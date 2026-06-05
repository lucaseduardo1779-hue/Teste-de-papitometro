// Dados da Copa do Mundo de 2026 (EUA, Mexico e Canada)
// Grupos definidos no sorteio oficial. Datas/horarios sao APROXIMADOS e
// podem ser ajustados no painel de administracao.

// Cada grupo: lista de times na ordem [t0, t1, t2, t3]
export const GROUPS = {
  A: [
    { name: 'México', flag: '🇲🇽' },
    { name: 'Coreia do Sul', flag: '🇰🇷' },
    { name: 'África do Sul', flag: '🇿🇦' },
    { name: 'Tchéquia', flag: '🇨🇿' },
  ],
  B: [
    { name: 'Canadá', flag: '🇨🇦' },
    { name: 'Suíça', flag: '🇨🇭' },
    { name: 'Catar', flag: '🇶🇦' },
    { name: 'Bósnia e Herzegovina', flag: '🇧🇦' },
  ],
  C: [
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Marrocos', flag: '🇲🇦' },
    { name: 'Haiti', flag: '🇭🇹' },
    { name: 'Escócia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { name: 'Estados Unidos', flag: '🇺🇸' },
    { name: 'Paraguai', flag: '🇵🇾' },
    { name: 'Austrália', flag: '🇦🇺' },
    { name: 'Turquia', flag: '🇹🇷' },
  ],
  E: [
    { name: 'Alemanha', flag: '🇩🇪' },
    { name: 'Costa do Marfim', flag: '🇨🇮' },
    { name: 'Equador', flag: '🇪🇨' },
    { name: 'Curaçao', flag: '🇨🇼' },
  ],
  F: [
    { name: 'Holanda', flag: '🇳🇱' },
    { name: 'Suécia', flag: '🇸🇪' },
    { name: 'Tunísia', flag: '🇹🇳' },
    { name: 'Japão', flag: '🇯🇵' },
  ],
  G: [
    { name: 'Bélgica', flag: '🇧🇪' },
    { name: 'Egito', flag: '🇪🇬' },
    { name: 'Irã', flag: '🇮🇷' },
    { name: 'Nova Zelândia', flag: '🇳🇿' },
  ],
  H: [
    { name: 'Espanha', flag: '🇪🇸' },
    { name: 'Cabo Verde', flag: '🇨🇻' },
    { name: 'Arábia Saudita', flag: '🇸🇦' },
    { name: 'Uruguai', flag: '🇺🇾' },
  ],
  I: [
    { name: 'França', flag: '🇫🇷' },
    { name: 'Senegal', flag: '🇸🇳' },
    { name: 'Iraque', flag: '🇮🇶' },
    { name: 'Noruega', flag: '🇳🇴' },
  ],
  J: [
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Argélia', flag: '🇩🇿' },
    { name: 'Áustria', flag: '🇦🇹' },
    { name: 'Jordânia', flag: '🇯🇴' },
  ],
  K: [
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'RD Congo', flag: '🇨🇩' },
    { name: 'Uzbequistão', flag: '🇺🇿' },
    { name: 'Colômbia', flag: '🇨🇴' },
  ],
  L: [
    { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croácia', flag: '🇭🇷' },
    { name: 'Gana', flag: '🇬🇭' },
    { name: 'Panamá', flag: '🇵🇦' },
  ],
};

// Data aproximada do 1o jogo (matchday 1) de cada grupo.
const MD1_DATE = {
  A: '2026-06-11', B: '2026-06-12', C: '2026-06-13', D: '2026-06-12',
  E: '2026-06-14', F: '2026-06-14', G: '2026-06-15', H: '2026-06-15',
  I: '2026-06-16', J: '2026-06-16', K: '2026-06-17', L: '2026-06-17',
};

function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T18:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

// Pares do round-robin de um grupo de 4 times, distribuidos em 3 rodadas.
// Garante que todos os 6 confrontos possiveis acontecam.
const ROUND_ROBIN = [
  { md: 1, pairs: [[0, 1], [2, 3]] },
  { md: 2, pairs: [[0, 2], [3, 1]] },
  { md: 3, pairs: [[3, 0], [1, 2]] },
];

// Gera os 104 jogos (72 da fase de grupos + 32 do mata-mata).
export function buildMatches() {
  const matches = [];

  // ---- Fase de grupos ----
  for (const [grp, teams] of Object.entries(GROUPS)) {
    const md1 = MD1_DATE[grp];
    const mdDate = { 1: md1, 2: addDays(md1, 5), 3: addDays(md1, 10) };
    for (const round of ROUND_ROBIN) {
      for (const [hi, ai] of round.pairs) {
        const home = teams[hi];
        const away = teams[ai];
        matches.push({
          stage: 'group',
          grp,
          matchday: round.md,
          label: `Grupo ${grp} · Rodada ${round.md}`,
          home_team: home.name,
          away_team: away.name,
          home_flag: home.flag,
          away_flag: away.flag,
          kickoff: typeof mdDate[round.md] === 'string' && mdDate[round.md].length === 10
            ? mdDate[round.md] + 'T18:00:00.000Z'
            : mdDate[round.md],
        });
      }
    }
  }

  // ---- Mata-mata (times definidos depois, no painel admin) ----
  const knockout = [
    { stage: 'r32', count: 16, name: 'Rodada de 32', date: '2026-06-30' },
    { stage: 'r16', count: 8, name: 'Oitavas de final', date: '2026-07-05' },
    { stage: 'qf', count: 4, name: 'Quartas de final', date: '2026-07-10' },
    { stage: 'sf', count: 2, name: 'Semifinal', date: '2026-07-14' },
    { stage: 'third', count: 1, name: 'Disputa de 3º lugar', date: '2026-07-18' },
    { stage: 'final', count: 1, name: 'Final', date: '2026-07-19' },
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
        kickoff: addDays(ko.date, 0),
      });
    }
  }

  return matches;
}
