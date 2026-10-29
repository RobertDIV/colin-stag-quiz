import { score } from '../game'
import { ANSWER_LABEL, type Game } from '../types'

interface Props {
  game: Game
  onPlayAgain: () => void
  onHome: () => void
}

export default function Results({ game, onPlayAgain, onHome }: Props) {
  const total = game.questions.length

  return (
    <main className="screen results">
      <header className="results-head">
        <p className="muted">Colin scored</p>
        <p className="big-score">
          {score(game)}
          <span> / {total}</span>
        </p>
      </header>

      <ol className="review">
        {game.questions.map((q, i) => {
          const guess = game.guesses[i]
          const correct = guess === q.answer
          return (
            <li key={q.id} className={correct ? 'review-item right' : 'review-item wrong'}>
              <span className="review-mark">{correct ? '✓' : '✗'}</span>
              <div>
                <p className="review-text">{q.text}</p>
                <p className="small">
                  <b>{ANSWER_LABEL[q.answer]}</b>
                  {!correct && guess && <span className="muted"> · Colin guessed {ANSWER_LABEL[guess]}</span>}
                </p>
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
