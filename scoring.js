// Regras de pontuacao do palpitometro (estilo bolao tradicional).
//
//   POINTS_EXACT  = 3  -> cravou o placar exato (ex.: palpite 2x1, deu 2x1)
//   POINTS_RESULT = 1  -> acertou so o vencedor/empate (ex.: palpite 2x1, deu 3x0)
//
// Para usar "1 ponto so por placar exato", deixe EXACT = 1 e RESULT = 0.
export const POINTS_EXACT = 3;   // placar exato
export const POINTS_RESULT = 1;  // acertou apenas o resultado (1x2)

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
