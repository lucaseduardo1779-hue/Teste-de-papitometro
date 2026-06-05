// ---------- Estado ----------
let MATCHES = [];
let CONFIG = { pointsExact: 1, pointsResult: 0 };
let currentFilter = 'all';
const local = {}; // matchId -> { homeScore, awayScore }

const STAGE_LABELS = {
  group: 'Fase de grupos',
  r32: 'Rodada de 32',
  r16: 'Oitavas',
  qf: 'Quartas',
  sf: 'Semifinal',
  third: '3º lugar',
  final: 'Final',
};
const STAGE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

function toast(msg, type = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('hidden'), 3200);
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

// ---------- Carregamento inicial ----------
async function init() {
  const [matchesRes, cfgRes] = await Promise.all([
    fetch('/api/matches').then((r) => r.json()),
    fetch('/api/config').then((r) => r.json()).catch(() => CONFIG),
  ]);
  MATCHES = matchesRes;
  CONFIG = cfgRes;
  loadRanking();
}

// ---------- Identificacao ----------
$('#identify-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim().toLowerCase();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return toast('Preencha nome e e-mail válidos.', 'error');
  }
  const data = await fetch('/api/predictions?email=' + encodeURIComponent(email)).then((r) => r.json());
  if (data.participant) {
    $('#name').value = data.participant.name;
    Object.entries(data.predictions).forEach(([mid, p]) => { local[mid] = p; });
    toast('Bem-vindo de volta! Seus palpites foram carregados.', 'success');
  } else {
    toast('Vamos lá! Preencha seus palpites e salve.', 'success');
  }
  $('#predictions-area').classList.remove('hidden');
  renderFilters();
  renderMatches();
  $('#predictions-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---------- Filtros por fase ----------
function renderFilters() {
  const stages = STAGE_ORDER.filter((s) => MATCHES.some((m) => m.stage === s));
  const wrap = $('#stage-filters');
  wrap.innerHTML = '';
  const all = el('button', 'chip' + (currentFilter === 'all' ? ' active' : ''), 'Todos');
  all.onclick = () => { currentFilter = 'all'; renderFilters(); renderMatches(); };
  wrap.appendChild(all);
  for (const s of stages) {
    const c = el('button', 'chip' + (currentFilter === s ? ' active' : ''), STAGE_LABELS[s]);
    c.onclick = () => { currentFilter = s; renderFilters(); renderMatches(); };
    wrap.appendChild(c);
  }
}

// ---------- Render dos jogos ----------
function renderMatches() {
  const root = $('#matches');
  root.innerHTML = '';

  const visible = MATCHES.filter((m) => currentFilter === 'all' || m.stage === currentFilter);

  // Agrupa: fase de grupos por grupo; mata-mata por fase
  const blocks = new Map();
  for (const m of visible) {
    const key = m.stage === 'group' ? `group-${m.group}` : `stage-${m.stage}`;
    if (!blocks.has(key)) blocks.set(key, []);
    blocks.get(key).push(m);
  }

  for (const [key, list] of blocks) {
    const block = el('div', 'group-block');
    const first = list[0];
    let title;
    if (first.stage === 'group') {
      title = `<span class="pill">Grupo ${first.group}</span> Fase de grupos`;
    } else {
      title = `<span class="pill">${STAGE_LABELS[first.stage]}</span>`;
    }
    block.appendChild(el('h3', 'group-head', title));
    list.forEach((m) => block.appendChild(matchRow(m)));
    root.appendChild(block);
  }
  updateProgress();
}

function teamSide(name, flag, side) {
  const e = el('div', 'team ' + side);
  const flagHtml = flag ? `<span class="flag">${flag}</span>` : '<span class="flag">⚽</span>';
  const nameHtml = name
    ? `<span class="name">${name}</span>`
    : '<span class="tbd">A definir</span>';
  e.innerHTML = side === 'away' ? nameHtml + flagHtml : flagHtml + nameHtml;
  return e;
}

function matchRow(m) {
  const row = el('div', 'match' + (m.locked ? ' locked' : ''));
  const saved = local[m.id] || {};
  const hasTeams = m.homeTeam && m.awayTeam;

  row.appendChild(teamSide(m.homeTeam, m.homeFlag, 'home'));

  const center = el('div', 'center');
  const pair = el('div', 'score-pair');
  const hi = el('input', 'score-input');
  const ai = el('input', 'score-input');
  for (const [inp, key] of [[hi, 'homeScore'], [ai, 'awayScore']]) {
    inp.type = 'number'; inp.min = 0; inp.max = 99; inp.inputMode = 'numeric';
    inp.value = saved[key] ?? '';
    inp.disabled = m.locked || !hasTeams;
    inp.addEventListener('input', () => {
      local[m.id] = local[m.id] || {};
      local[m.id][key] = inp.value === '' ? null : Number(inp.value);
      updateProgress();
    });
  }
  pair.appendChild(hi);
  pair.appendChild(el('span', 'x', '×'));
  pair.appendChild(ai);
  center.appendChild(pair);

  const meta = el('div', 'match-meta');
  if (m.homeScore != null && m.awayScore != null) {
    meta.innerHTML = `<span class="result">Resultado: ${m.homeScore} × ${m.awayScore}</span>`;
  } else if (m.locked) {
    meta.innerHTML = `<span class="lockmsg">Jogo começou — palpite fechado</span>`;
  } else {
    meta.textContent = fmtDate(m.kickoff);
  }
  center.appendChild(meta);
  row.appendChild(center);

  row.appendChild(teamSide(m.awayTeam, m.awayFlag, 'away'));
  return row;
}

function updateProgress() {
  const predictable = MATCHES.filter((m) => m.homeTeam && m.awayTeam);
  const filled = predictable.filter((m) => {
    const p = local[m.id];
    return p && p.homeScore != null && p.awayScore != null;
  }).length;
  const total = predictable.length;
  $('#progress-text').textContent = `${filled} / ${total} preenchidos`;
  $('#progress-bar').style.width = total ? (filled / total * 100) + '%' : '0%';
}

// ---------- Salvar ----------
$('#save-btn').addEventListener('click', async () => {
  const name = $('#name').value.trim();
  const email = $('#email').value.trim().toLowerCase();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return toast('Preencha nome e e-mail válidos no topo.', 'error');
  }
  const predictions = Object.entries(local)
    .filter(([, p]) => p && p.homeScore != null && p.awayScore != null)
    .map(([matchId, p]) => ({ matchId: Number(matchId), homeScore: p.homeScore, awayScore: p.awayScore }));

  if (predictions.length === 0) return toast('Você ainda não preencheu nenhum palpite.', 'error');

  $('#save-btn').disabled = true;
  $('#save-status').textContent = 'Salvando…';
  try {
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, predictions }),
    }).then((r) => r.json());
    if (res.error) throw new Error(res.error);
    const msg = `${res.saved} palpite(s) salvo(s)` + (res.skipped ? `, ${res.skipped} ignorado(s) (jogo já começou)` : '');
    $('#save-status').textContent = msg;
    toast('Palpites salvos! ' + msg, 'success');
  } catch (err) {
    $('#save-status').textContent = '';
    toast(err.message || 'Erro ao salvar.', 'error');
  } finally {
    $('#save-btn').disabled = false;
  }
});

// ---------- Ranking ----------
async function loadRanking() {
  try {
    const data = await fetch('/api/ranking').then((r) => r.json());
    const body = $('#ranking-body');
    body.innerHTML = '';
    const players = data.ranking.length;
    $('#stat-players').textContent = players;
    $('#ranking-desc').textContent = players === 0
      ? 'Ainda não há participantes. Seja o primeiro a palpitar!'
      : `${players} participante(s) · ${data.finishedCount} jogo(s) com resultado lançado. Pontuação: ${CONFIG.pointsExact} ponto(s) por placar exato` + (CONFIG.pointsResult ? ` e ${CONFIG.pointsResult} por acertar o vencedor.` : '.');

    const medals = ['🥇', '🥈', '🥉'];
    data.ranking.forEach((r) => {
      const tr = el('tr');
      const medal = r.position <= 3 ? `<span class="medal">${medals[r.position - 1]}</span> ` : '';
      tr.innerHTML = `
        <td class="pos">${medal}${r.position}</td>
        <td>${r.name}</td>
        <td>${r.exact}</td>
        <td class="pts">${r.points}</td>`;
      body.appendChild(tr);
    });
  } catch {
    $('#ranking-desc').textContent = 'Não foi possível carregar o ranking.';
  }
}

init();
