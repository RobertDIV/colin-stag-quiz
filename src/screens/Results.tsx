import { scores } from '../game'
import { ANSWER_LABEL, type Game } from '../types'

interface Props {
  game: Game
  onPlayAgain: () => void
  onHome: () => void
}

export default function Results({ game, onPlayAgain, onHome }: Props) {
  const total = game.questions.length
  const party = game.mode === 'party'
  const playerScores = scores(game)

  // Ties share a rank: 10, 10, 8 → 1st, 1st, 3rd.
  const ranked = game.players
    .map((name, p) => ({ name, score: playerScores[p] }))
    .sort((a, b) => b.score - a.score)
    .map((row, _, all) => ({ ...row, rank: all.findIndex((r) => r.score === row.score) + 1 }))

  return (
    <main className="screen results">
      {party ? (
        <header className="results-head">
          <p className="muted">Out of {total}</p>
          <ol className="leaderboard">
            {ranked.map((row) => (
              <li key={row.name} className={row.rank === 1 ? 'top' : undefined}>
                <span className="rank">{row.rank}</span>
                <span className="lb-name">{row.name}</span>
                <span className="lb-score">{row.score}</span>
              </li>
            ))}
          </ol>
        </header>
      ) : (
        <header className="results-head">
          <p className="muted">Colin scored</p>
          <p className="big-score">
            {playerScores[0]}
            <span> / {total}</span>
          </p>
        </header>
      )}

      <ol className="review">
        {game.questions.map((q, i) => {
          const guesses = game.guesses[i]
          const right = guesses.filter((g) => g === q.answer).length
          const allRight = right === guesses.length
          return (
            <li key={q.id} className={allRight ? 'review-item right' : 'review-item wrong'}>
              <span className="review-mark">{party ? `${right}/${guesses.length}` : allRight ? '✓' : '✗'}</span>
              <div>
                <p className="review-text">{q.text}</p>
                <p className="small">
                  <b>{ANSWER_LABEL[q.answer]}</b>
                  {!party && !allRight && guesses[0] && (
                    <span className="muted"> · Colin guessed {ANSWER_LABEL[guesses[0]]}</span>
                  )}
                </p>
                {party && !allRight && (
                  <p className="small muted">
                    Wrong: {game.players.filter((_, p) => guesses[p] !== q.answer).join(', ')}
                  </p>
                )}
                {q.source && <p className="small muted">{q.source}</p>}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="actions sticky-actions">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          Play again
        </button>
        <button className="btn btn-secondary" onClick={onHome}>
          Menu
        </button>
      </div>
    </main>
  )
}
