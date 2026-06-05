// Dados oficiais da Copa do Mundo de 2026 (EUA, Mexico e Canada).
// Confrontos, datas e horarios (horario de BRASILIA) conforme tabela oficial.
//
// Horarios sao convertidos de Brasilia (UTC-3) para UTC ao gerar o ISO.
// No site, os horarios sao exibidos sempre no fuso de Brasilia.

// Bandeira de cada selecao
const FLAGS = {
  'México': '🇲🇽', 'África do Sul': '🇿🇦', 'Coreia do Sul': '🇰🇷', 'Tchéquia': '🇨🇿',
  'Canadá': '🇨🇦', 'Bósnia e Herzegovina': '🇧🇦', 'Catar': '🇶🇦', 'Suíça': '🇨🇭',
  'Brasil': '🇧🇷', 'Marrocos': '🇲🇦', 'Haiti': '🇭🇹', 'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸', 'Paraguai': '🇵🇾', 'Austrália': '🇦🇺', 'Turquia': '🇹🇷',
  'Alemanha': '🇩🇪', 'Curaçao': '🇨🇼', 'Costa do Marfim': '🇨🇮', 'Equador': '🇪🇨',
  'Países Baixos': '🇳🇱', 'Japão': '🇯🇵', 'Suécia': '🇸🇪', 'Tunísia': '🇹🇳',
  'Bélgica': '🇧🇪', 'Egito': '🇪🇬', 'Irã': '🇮🇷', 'Nova Zelândia': '🇳🇿',
  'Espanha': '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arábia Saudita': '🇸🇦', 'Uruguai': '🇺🇾',
  'França': '🇫🇷', 'Senegal': '🇸🇳', 'Iraque': '🇮🇶', 'Noruega': '🇳🇴',
  'Argentina': '🇦🇷', 'Argélia': '🇩🇿', 'Áustria': '🇦🇹', 'Jordânia': '🇯🇴',
  'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbequistão': '🇺🇿', 'Colômbia': '🇨🇴',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croácia': '🇭🇷', 'Gana': '🇬🇭', 'Panamá': '🇵🇦',
};

// Converte data "DD/MM" + horario "HH:MM" de Brasilia (UTC-3) em ISO (UTC).
function brt(dateStr, timeStr) {
  const [d, m] = dateStr.split('/').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  // UTC = BRT + 3h. Date.UTC normaliza a virada de dia.
  return new Date(Date.UTC(2026, m - 1, d, hh + 3, mm)).toISOString();
}

// Fase de grupos - tabela oficial (ordem dos jogos 1 a 72).
// [grupo, mandante, visitante, "DD/MM", "HH:MM"(Brasilia)]
const GROUP_FIXTURES = [
  // Grupo A
  ['A', 'México', 'África do Sul', '11/06', '16:00'],
  ['A', 'Coreia do Sul', 'Tchéquia', '11/06', '23:00'],
  ['A', 'México', 'Coreia do Sul', '17/06', '18:00'],
  ['A', 'Tchéquia', 'África do Sul', '18/06', '13:00'],
  ['A', 'Tchéquia', 'México', '24/06', '22:00'],
  ['A', 'África do Sul', 'Coreia do Sul', '24/06', '22:00'],
  // Grupo B
  ['B', 'Canadá', 'Bósnia e Herzegovina', '12/06', '16:00'],
  ['B', 'Catar', 'Suíça', '13/06', '16:00'],
  ['B', 'Canadá', 'Catar', '18/06', '19:00'],
  ['B', 'Suíça', 'Bósnia e Herzegovina', '18/06', '22:00'],
  ['B', 'Suíça', 'Canadá', '24/06', '16:00'],
  ['B', 'Bósnia e Herzegovina', 'Catar', '24/06', '16:00'],
  // Grupo C
  ['C', 'Brasil', 'Marrocos', '13/06', '19:00'],
  ['C', 'Haiti', 'Escócia', '13/06', '22:00'],
  ['C', 'Escócia', 'Marrocos', '19/06', '19:00'],
  ['C', 'Brasil', 'Haiti', '19/06', '21:30'],
  ['C', 'Escócia', 'Brasil', '24/06', '19:00'],
  ['C', 'Marrocos', 'Haiti', '24/06', '19:00'],
  // Grupo D
  ['D', 'Estados Unidos', 'Paraguai', '12/06', '22:00'],
  ['D', 'Austrália', 'Turquia', '14/06', '01:00'],
  ['D', 'Estados Unidos', 'Austrália', '19/06', '22:00'],
  ['D', 'Turquia', 'Paraguai', '20/06', '17:00'],
  ['D', 'Turquia', 'Estados Unidos', '25/06', '16:00'],
  ['D', 'Paraguai', 'Austrália', '25/06', '16:00'],
  // Grupo E
  ['E', 'Alemanha', 'Curaçao', '14/06', '14:00'],
  ['E', 'Costa do Marfim', 'Equador', '14/06', '20:00'],
  ['E', 'Alemanha', 'Costa do Marfim', '20/06', '17:00'],
  ['E', 'Equador', 'Curaçao', '20/06', '22:00'],
  ['E', 'Equador', 'Alemanha', '25/06', '13:00'],
  ['E', 'Curaçao', 'Costa do Marfim', '25/06', '13:00'],
  // Grupo F
  ['F', 'Países Baixos', 'Japão', '14/06', '17:00'],
  ['F', 'Suécia', 'Tunísia', '14/06', '23:00'],
  ['F', 'Países Baixos', 'Suécia', '20/06', '14:00'],
  ['F', 'Tunísia', 'Japão', '21/06', '01:00'],
  ['F', 'Tunísia', 'Países Baixos', '25/06', '20:00'],
  ['F', 'Japão', 'Suécia', '25/06', '20:00'],
  // Grupo G
  ['G', 'Bélgica', 'Egito', '15/06', '16:00'],
  ['G', 'Irã', 'Nova Zelândia', '15/06', '22:00'],
  ['G', 'Bélgica', 'Irã', '21/06', '16:00'],
  ['G', 'Nova Zelândia', 'Egito', '21/06', '22:00'],
  ['G', 'Nova Zelândia', 'Bélgica', '26/06', '16:00'],
  ['G', 'Egito', 'Irã', '26/06', '16:00'],
  // Grupo H
  ['H', 'Espanha', 'Cabo Verde', '15/06', '13:00'],
  ['H', 'Arábia Saudita', 'Uruguai', '15/06', '19:00'],
  ['H', 'Espanha', 'Arábia Saudita', '21/06', '13:00'],
  ['H', 'Uruguai', 'Cabo Verde', '21/06', '19:00'],
  ['H', 'Uruguai', 'Espanha', '26/06', '21:00'],
  ['H', 'Cabo Verde', 'Arábia Saudita', '26/06', '21:00'],
  // Grupo I
  ['I', 'França', 'Senegal', '16/06', '16:00'],
  ['I', 'Iraque', 'Noruega', '16/06', '19:00'],
  ['I', 'França', 'Iraque', '22/06', '18:00'],
  ['I', 'Noruega', 'Senegal', '22/06', '21:00'],
  ['I', 'Noruega', 'França', '26/06', '19:00'],
  ['I', 'Senegal', 'Iraque', '26/06', '19:00'],
  // Grupo J
  ['J', 'Argentina', 'Argélia', '16/06', '22:00'],
  ['J', 'Áustria', 'Jordânia', '17/06', '01:00'],
  ['J', 'Argentina', 'Áustria', '22/06', '14:00'],
  ['J', 'Jordânia', 'Argélia', '23/06', '00:00'],
  ['J', 'Jordânia', 'Argentina', '27/06', '23:00'],
  ['J', 'Argélia', 'Áustria', '27/06', '23:00'],
  // Grupo K
  ['K', 'Portugal', 'RD Congo', '17/06', '14:00'],
  ['K', 'Uzbequistão', 'Colômbia', '17/06', '21:00'],
  ['K', 'Portugal', 'Uzbequistão', '23/06', '16:00'],
  ['K', 'Colômbia', 'RD Congo', '23/06', '20:00'],
  ['K', 'Colômbia', 'Portugal', '27/06', '20:30'],
  ['K', 'RD Congo', 'Uzbequistão', '27/06', '20:30'],
  // Grupo L
  ['L', 'Inglaterra', 'Croácia', '17/06', '17:00'],
  ['L', 'Gana', 'Panamá', '17/06', '20:00'],
  ['L', 'Inglaterra', 'Gana', '23/06', '17:00'],
  ['L', 'Panamá', 'Croácia', '23/06', '20:00'],
  ['L', 'Panamá', 'Inglaterra', '27/06', '18:00'],
  ['L', 'Croácia', 'Gana', '27/06', '18:00'],
];

// Times de cada grupo (derivado dos confrontos) - exportado caso util.
export const GROUPS = (() => {
  const g = {};
  for (const [grp, home, away] of GROUP_FIXTURES) {
    g[grp] = g[grp] || new Set();
    g[grp].add(home); g[grp].add(away);
  }
  const out = {};
  for (const [k, set] of Object.entries(g)) {
    out[k] = [...set].map((name) => ({ name, flag: FLAGS[name] || '⚽' }));
  }
  return out;
})();

// Gera os 104 jogos (72 da fase de grupos + 32 do mata-mata).
export function buildMatches() {
  const matches = [];

  // ---- Fase de grupos ----
  const countInGroup = {};
  for (const [grp, home, away, date, time] of GROUP_FIXTURES) {
    countInGroup[grp] = (countInGroup[grp] || 0) + 1;
    matches.push({
      stage: 'group',
      grp,
      matchday: Math.ceil(countInGroup[grp] / 2), // 2 jogos por rodada
      label: `Grupo ${grp}`,
      home_team: home,
      away_team: away,
      home_flag: FLAGS[home] || '⚽',
      away_flag: FLAGS[away] || '⚽',
      kickoff: brt(date, time),
    });
  }

  // ---- Mata-mata (times definidos depois, no painel admin) ----
  const knockout = [
    { stage: 'r32', count: 16, name: 'Rodada de 32', date: '29/06' },
    { stage: 'r16', count: 8, name: 'Oitavas de final', date: '04/07' },
    { stage: 'qf', count: 4, name: 'Quartas de final', date: '09/07' },
    { stage: 'sf', count: 2, name: 'Semifinal', date: '14/07' },
    { stage: 'third', count: 1, name: 'Disputa de 3º lugar', date: '18/07' },
    { stage: 'final', count: 1, name: 'Final', date: '19/07' },
  ];
  for (const ko of knockout) {
    for (let i = 1; i <= ko.count; i++) {
      matches.push({
        stage: ko.stage,
        grp: null,
        matchday: null,
        label: ko.count > 1 ? `${ko.name} · Jogo ${i}` : ko.name,
        home_team: null,
        away_team: null,
        home_flag: null,
        away_flag: null,
        kickoff: brt(ko.date, '16:00'),
      });
    }
  }

  return matches;
}
