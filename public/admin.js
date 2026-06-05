let PASS = '';
let MATCHES = [];
let filter = 'all';

const STAGE_LABELS = {
  group: 'Grupos', r32: 'Rodada de 32', r16: 'Oitavas', qf: 'Quartas', sf: 'Semi', third: '3º lugar', final: 'Final',
};
const STAGE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

const $ = (s) => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; };

function toast(msg, type = '') {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('hidden'), 3000);
}
function fmtLocalInput(iso) {
  // converte ISO para valor de input datetime-local
  try { const d = new Date(iso); const off = d.getTimezoneOffset() * 60000; return new Date(d - off).toISOString().slice(0, 16); }
  catch { return ''; }
}

// ---------- Login ----------
$('#login-btn').addEventListener('click', login);
$('#pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });

async function login() {
  PASS = $('#pass').value;
  const res = await fetch('/api/admin/participants', { headers: { 'x-admin-password': PASS } });
  if (res.status === 401) { $('#login-err').textContent = 'Senha inválida.'; return; }
  $('#login').classList.add('hidden');
  $('#panel').classList.remove('hidden');
  await loadMatches();
  loadParticipants();
}

// ---------- Tabs ----------
document.querySelectorAll('.tabs .chip').forEach((c) => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.tabs .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    const tab = c.dataset.tab;
    $('#tab-results').classList.toggle('hidden', tab !== 'results');
    $('#tab-participants').classList.toggle('hidden', tab !== 'participants');
  });
});

// ---------- Resultados ----------
async function loadMatches() {
  MATCHES = await fetch('/api/matches').then((r) => r.json());
  renderFilters();
  renderMatches();
}

function renderFilters() {
  const stages = STAGE_ORDER.filter((s) => MATCHES.some((m) => m.stage === s));
  const wrap = $('#stage-filters'); wrap.innerHTML = '';
  const mk = (val, label) => {
    const c = el('button', 'chip' + (filter === val ? ' active' : ''), label);
    c.onclick = () => { filter = val; renderFilters(); renderMatches(); };
    wrap.appendChild(c);
  };
  mk('all', 'Todos');
  stages.forEach((s) => mk(s, STAGE_LABELS[s]));
}

function renderMatches() {
  const root = $('#admin-matches'); root.innerHTML = '';
  MATCHES.filter((m) => filter === 'all' || m.stage === filter).forEach((m) => {
    root.appendChild(adminRow(m));
  });
}

function adminRow(m) {
  const row = el('div', 'arow');
  const tag = m.stage === 'group' ? `Grupo ${m.group}` : STAGE_LABELS[m.stage];
  row.appendChild(el('div', 'tag', tag));
  row.appendChild(el('div', 'nm r', `${m.homeFlag || '⚽'} ${m.homeTeam || '<i>A definir</i>'}`));

  const center = el('div', 'savecell');
  const hi = el('input', 's'); hi.type = 'number'; hi.min = 0; hi.value = m.homeScore ?? '';
  const ai = el('input', 's'); ai.type = 'number'; ai.min = 0; ai.value = m.awayScore ?? '';
  center.appendChild(hi); center.appendChild(el('span', '', '×')); center.appendChild(ai);
  row.appendChild(center);

  row.appendChild(el('div', 'nm', `${m.awayTeam || '<i>A definir</i>'} ${m.awayFlag || '⚽'}`));

  const actions = el('div', 'savecell');
  const save = el('button', 'btn btn-primary mini', 'Salvar');
  const status = el('span', 'ok', '');
  save.onclick = async () => {
    const r = await fetch('/api/admin/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': PASS },
      body: JSON.stringify({ matchId: m.id, homeScore: hi.value === '' ? null : Number(hi.value), awayScore: ai.value === '' ? null : Number(ai.value) }),
    }).then((x) => x.json());
    if (r.ok) { status.textContent = '✓'; m.homeScore = hi.value === '' ? null : Number(hi.value); m.awayScore = ai.value === '' ? null : Number(ai.value); toast('Resultado salvo.', 'success'); }
    else toast(r.error || 'Erro', 'error');
  };
  const edit = el('button', 'edit', '✎ Editar');
  edit.onclick = () => toggleEdit(m, row);
  actions.appendChild(save); actions.appendChild(status); actions.appendChild(edit);
  row.appendChild(actions);
  return row;
}

function toggleEdit(m, row) {
  const existing = row.nextSibling;
  if (existing && existing.classList && existing.classList.contains('editbox')) { existing.remove(); return; }
  const box = el('div', 'editbox');
  const f = (label, value, ph = '') => {
    const d = el('div', 'field');
    d.appendChild(el('label', '', label));
    const i = el('input'); i.value = value ?? ''; i.placeholder = ph; d.appendChild(i);
    return { d, i };
  };
  const ht = f('Time mandante', m.homeTeam, 'Ex.: Brasil');
  const hf = f('Bandeira mandante', m.homeFlag, '🇧🇷');
  const at = f('Time visitante', m.awayTeam, 'Ex.: Argentina');
  const af = f('Bandeira visitante', m.awayFlag, '🇦🇷');
  const dt = el('div', 'field'); dt.appendChild(el('label', '', 'Data e hora'));
  const di = el('input'); di.type = 'datetime-local'; di.value = fmtLocalInput(m.kickoff); dt.appendChild(di);
  [ht.d, hf.d, at.d, af.d, dt].forEach((x) => box.appendChild(x));

  const full = el('div', 'full');
  const save = el('button', 'btn btn-primary mini', 'Salvar jogo');
  save.onclick = async () => {
    const payload = { matchId: m.id, homeTeam: ht.i.value || null, homeFlag: hf.i.value || null, awayTeam: at.i.value || null, awayFlag: af.i.value || null };
    if (di.value) payload.kickoff = new Date(di.value).toISOString();
    const r = await fetch('/api/admin/match', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': PASS }, body: JSON.stringify(payload),
    }).then((x) => x.json());
    if (r.ok) { toast('Jogo atualizado.', 'success'); box.remove(); await loadMatches(); }
    else toast(r.error || 'Erro', 'error');
  };
  full.appendChild(save);
  box.appendChild(full);
  row.after(box);
}

// ---------- Participantes ----------
async function loadParticipants() {
  const rows = await fetch('/api/admin/participants', { headers: { 'x-admin-password': PASS } }).then((r) => r.json());
  const body = $('#parts-body'); body.innerHTML = '';
  rows.forEach((p) => {
    const tr = el('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.email}</td><td>${p.predictions}</td><td>${new Date(p.created_at).toLocaleDateString('pt-BR')}</td>`;
    body.appendChild(tr);
  });
}
