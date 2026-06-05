// Regras de pontuacao do palpitometro.
//
// Por padrao, seguimos o pedido original: 1 ponto por ACERTO de resultado.
// Aqui "acerto" significa cravar o PLACAR EXATO do jogo.
//
// Caso queira premiar tambem quem acertou apenas o vencedor/empate (estilo
// bolao tradicional), troque os valores abaixo. Exemplo comum:
//   POINTS_EXACT  = 3  (cravou o placar)
//   POINTS_RESULT = 1  (acertou so quem venceu / empate)
export const POINTS_EXACT = 1;   // placar exato
export const POINTS_RESULT = 0;  // acertou apenas o resultado (1x2)

function outcome(h, a) {
  if (h > a) return 'H';
  if (h < a) return 'A';
  return 'D';
}

// Pontos de um unico palpite contra o resultado real.
export function scorePrediction(pred, match) {
  if (match.home_score == null || match.away_score == null) return 0;
  if (pred.home_score == null || pred.away_score == null) return 0;

  const exact =
    pred.home_score === match.home_score &&
    pred.away_score === match.away_score;
  if (exact) return POINTS_EXACT;

  const sameOutcome =
    outcome(pred.home_score, pred.away_score) ===
    outcome(match.home_score, match.away_score);
  return sameOutcome ? POINTS_RESULT : 0;
}
