import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, seedMatchesIfEmpty } from './db.js';
import { scorePrediction, POINTS_EXACT, POINTS_RESULT } from './scoring.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'copa2026';

seedMatchesIfEmpty();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(join(__dirname, 'public')));

// ---------- Helpers ----------
const isLocked = (kickoff) => new Date(kickoff).getTime() <= Date.now();

function normalizeEmail(e) {
  return String(e || '').trim().toLowerCase();
}

function publicMatch(m) {
  return {
    id: m.id,
    stage: m.stage,
    group: m.grp,
    matchday: m.matchday,
    label: m.label,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeFlag: m.home_flag,
    awayFlag: m.away_flag,
    kickoff: m.kickoff,
    homeScore: m.home_score,
    awayScore: m.away_score,
    locked: isLocked(m.kickoff),
  };
}

// ---------- API publica ----------

app.get('/api/config', (_req, res) => {
  res.json({ pointsExact: POINTS_EXACT, pointsResult: POINTS_RESULT });
});

app.get('/api/matches', (_req, res) => {
  const rows = db.prepare('SELECT * FROM matches ORDER BY sort_order').all();
  res.json(rows.map(publicMatch));
});

// Palpites salvos de um participante (para pre-preencher o formulario)
app.get('/api/predictions', (req, res) => {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.json({ participant: null, predictions: {} });

  const participant = db
    .prepare('SELECT id, name, email FROM participants WHERE email = ?')
    .get(email);
  if (!participant) return res.json({ participant: null, predictions: {} });

  const rows = db
    .prepare('SELECT match_id, home_score, away_score FROM predictions WHERE participant_id = ?')
    .all(participant.id);
  const predictions = {};
  for (const r of rows) {
    predictions[r.match_id] = { homeScore: r.home_score, awayScore: r.away_score };
  }
  res.json({
    participant: { name: participant.name, email: participant.email },
    predictions,
  });
});

// Salva/atualiza palpites
app.post('/api/predictions', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = normalizeEmail(req.body?.email);
  const predictions = req.body?.predictions;

  if (name.length < 2) return res.status(400).json({ error: 'Informe seu nome completo.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  if (!Array.isArray(predictions))
    return res.status(400).json({ error: 'Palpites inválidos.' });

  const now = new Date().toISOString();

  // upsert participante por email
  let participant = db.prepare('SELECT id FROM participants WHERE email = ?').get(email);
  if (participant) {
    db.prepare('UPDATE participants SET name = ? WHERE id = ?').run(name, participant.id);
  } else {
    const info = db
      .prepare('INSERT INTO participants (name, email, created_at) VALUES (?, ?, ?)')
      .run(name, email, now);
    participant = { id: info.lastInsertRowid };
  }

  const getMatch = db.prepare('SELECT id, kickoff FROM matches WHERE id = ?');
  const upsert = db.prepare(`
    INSERT INTO predictions (participant_id, match_id, home_score, away_score, updated_at)
    VALUES (@pid, @mid, @hs, @as, @now)
    ON CONFLICT(participant_id, match_id)
    DO UPDATE SET home_score = excluded.home_score,
                  away_score = excluded.away_score,
                  updated_at = excluded.updated_at
  `);

  let saved = 0;
  let skipped = 0;
  db.exec('BEGIN');
  try {
    for (const p of predictions) {
      const match = getMatch.get(p.matchId);
      if (!match) { skipped++; continue; }
      if (isLocked(match.kickoff)) { skipped++; continue; } // jogo ja comecou
      const hs = Number(p.homeScore);
      const as = Number(p.awayScore);
      if (!Number.isInteger(hs) || !Number.isInteger(as) || hs < 0 || as < 0 || hs > 99 || as > 99) {
        skipped++; continue;
      }
      upsert.run({ pid: participant.id, mid: match.id, hs, as, now });
      saved++;
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao salvar palpites.' });
  }

  res.json({ ok: true, saved, skipped });
});

// Ranking calculado
app.get('/api/ranking', (_req, res) => {
  const participants = db.prepare('SELECT id, name FROM participants').all();
  const matches = db.prepare('SELECT * FROM matches WHERE home_score IS NOT NULL').all();
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const finishedCount = matches.length;

  const preds = db.prepare('SELECT participant_id, match_id, home_score, away_score FROM predictions').all();
  const byParticipant = new Map();
  for (const p of preds) {
    if (!byParticipant.has(p.participant_id)) byParticipant.set(p.participant_id, []);
    byParticipant.get(p.participant_id).push(p);
  }

  const ranking = participants.map((part) => {
    let points = 0;
    let exact = 0;
    const list = byParticipant.get(part.id) || [];
    for (const pr of list) {
      const m = matchById.get(pr.match_id);
      if (!m) continue;
      const pts = scorePrediction(
        { home_score: pr.home_score, away_score: pr.away_score },
        m
      );
      points += pts;
      if (pts === POINTS_EXACT && POINTS_EXACT > 0 &&
          pr.home_score === m.home_score && pr.away_score === m.away_score) {
        exact++;
      }
    }
    return { name: part.name, points, exact };
  });

  ranking.sort((a, b) => b.points - a.points || b.exact - a.exact || a.name.localeCompare(b.name));
  ranking.forEach((r, i) => { r.position = i + 1; });

  res.json({ finishedCount, ranking });
});

// ---------- API admin ----------
function requireAdmin(req, res, next) {
  const pass = req.get('x-admin-password') || req.query.password;
  if (pass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Senha de administrador inválida.' });
  next();
}

// Lancar/atualizar resultado de um jogo
app.post('/api/admin/result', requireAdmin, (req, res) => {
  const id = Number(req.body?.matchId);
  const hs = req.body?.homeScore;
  const as = req.body?.awayScore;
  const match = db.prepare('SELECT id FROM matches WHERE id = ?').get(id);
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado.' });

  if (hs === null || as === null || hs === '' || as === '') {
    db.prepare('UPDATE matches SET home_score = NULL, away_score = NULL WHERE id = ?').run(id);
    return res.json({ ok: true, cleared: true });
  }
  const h = Number(hs), a = Number(as);
  if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0)
    return res.status(400).json({ error: 'Placar inválido.' });
  db.prepare('UPDATE matches SET home_score = ?, away_score = ? WHERE id = ?').run(h, a, id);
  res.json({ ok: true });
});

// Atualizar dados de um jogo (times, bandeiras, data) - util para o mata-mata
app.post('/api/admin/match', requireAdmin, (req, res) => {
  const id = Number(req.body?.matchId);
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado.' });

  const fields = ['home_team', 'away_team', 'home_flag', 'away_flag', 'kickoff', 'label'];
  const updates = {};
  for (const f of fields) {
    const key = { home_team: 'homeTeam', away_team: 'awayTeam', home_flag: 'homeFlag', away_flag: 'awayFlag', kickoff: 'kickoff', label: 'label' }[f];
    if (req.body[key] !== undefined) updates[f] = req.body[key];
  }
  if (Object.keys(updates).length === 0) return res.json({ ok: true });

  const set = Object.keys(updates).map((k) => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE matches SET ${set} WHERE id = @id`).run({ ...updates, id });
  res.json({ ok: true });
});

// Lista de participantes (admin)
app.get('/api/admin/participants', requireAdmin, (_req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.email, p.created_at,
           (SELECT COUNT(*) FROM predictions pr WHERE pr.participant_id = p.id) AS predictions
    FROM participants p ORDER BY p.created_at DESC
  `).all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Palpitômetro Copa 2026 rodando em http://localhost:${PORT}`);
  console.log(`Painel admin: http://localhost:${PORT}/admin.html (senha: ${ADMIN_PASSWORD})`);
});
