import { getMix, isFinished } from '../game'
import type { Game, Question } from '../types'

interface Props {
  questions: Question[]
  game: Game | null
  onStart: () => void
  onResume: () => void
  onEdit: () => void
}

export default function Home({ questions, game, onStart, onResume, onEdit }: Props) {
  const mix = getMix(questions)
  const inProgress = game && !isFinished(game)
  const spare = mix.porn - mix.pornUsed

  function start() {
    if (inProgress && !confirm('Abandon the game in progress and start a new one?')) return
    onStart()
  }

  return (
    <main className="screen home">
      <header className="home-title">
        <h1>
          Colin <span className="or">or</span> <span className="tag">Gay Porn</span>?
        </h1>
        <p className="muted">Read the message out. Colin guesses. No cheating.</p>
      </header>

      <section className="panel">
        <div className="counts">
          <div>
            <strong>{mix.colin}</strong>
            <span>Colin</span>
          </div>
          <div>
            <strong>{mix.porn}</strong>
            <span>Gay Porn</span>
          </div>
        </div>
        {mix.canPlay ? (
          <p className="mix-note">
            Next game: <b>{mix.colin + mix.pornUsed} messages</b> ({mix.colin} Colin + {mix.pornUsed} Gay Porn).
            {spare > 0 && ` ${spare} spare Gay Porn ${spare === 1 ? 'message sits' : 'messages sit'} out at random.`}
            {mix.porn < mix.colin && ` Add ${mix.colin - mix.porn} more Gay Porn to even it up.`}
          </p>
        ) : (
          <p className="mix-note">Add at least one Colin message and one Gay Porn message to play.</p>
        )}
      </section>

      <div className="actions">
        {inProgress && (
          <button className="btn btn-primary" onClick={onResume}>
            Resume game ({game.index + 1}/{game.questions.length})
          </button>
        )}
        <button className={inProgress ? 'btn btn-secondary' : 'btn btn-primary'} onClick={start} disabled={!mix.canPlay}>
          {inProgress ? 'New game' : 'Start game'}
        </button>
        <button className="btn btn-secondary" onClick={onEdit}>
          Edit questions
        </button>
      </div>
      {inProgress && <p className="muted small center">Edits apply from the next new game.</p>}
    </main>
  )
}
