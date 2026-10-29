import { scores } from '../game'
import { ANSWER_LABEL, type Answer, type Game } from '../types'

interface Props {
  game: Game
  onChange: (game: Game) => void
  onQuit: () => void
}

export default function Play({ game, onChange, onQuit }: Props) {
  const { index, questions, players, mode } = game
  const question = questions[index]
  const guesses = game.guesses[index]
  const revealed = game.revealed[index]
  const isLast = index === questions.length - 1
  const allGuessed = guesses.every((g) => g !== null)

  function update(nextGuesses: (Answer | null)[], nextRevealed: boolean) {
    onChange({
      ...game,
      guesses: game.guesses.map((g, i) => (i === index ? nextGuesses : g)),
      revealed: game.revealed.map((r, i) => (i === index ? nextRevealed : r)),
    })
  }

  function guess(player: number, a: Answer) {
    update(
      guesses.map((g, p) => (p === player ? a : g)),
      false,
    )
  }

  function undo() {
    // Classic goes straight back to the two big buttons; party keeps the picks so one can be fixed.
    update(mode === 'classic' ? guesses.map(() => null) : guesses, false)
  }

  return (
    <main className="screen play">
      <header className="play-bar">
        <button className="link" onClick={onQuit}>
          ‹ Menu
        </button>
        <span>
          {index + 1} / {questions.length}
        </span>
        {mode === 'classic' ? <span className="score-pill">Score {scores(game)[0]}</span> : <span />}
      </header>

      {revealed ? (
        <Reveal game={game} isLast={isLast} onNext={() => onChange({ ...game, index: index + 1 })} onUndo={undo} />
      ) : mode === 'classic' ? (
        <>
          <p className="muted center">Read it out. Who said it?</p>
          <blockquote className="message">{question.text}</blockquote>
          <div className="choices">
            {(['colin', 'porn'] as Answer[]).map((a) => (
              <button
                key={a}
                className={a === 'colin' ? 'btn btn-primary btn-huge' : 'btn btn-outline btn-huge'}
                onClick={() => update([a], true)}
              >
                {ANSWER_LABEL[a]}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="muted center">Read it out. Everyone guesses.</p>
          <blockquote className="message message-party">{question.text}</blockquote>
          <ul className="player-guesses">
            {players.map((player, p) => (
              <li key={player}>
                <span className="player-name">{player}</span>
                <div className="mini-toggle">
                  {(['colin', 'porn'] as Answer[]).map((a) => (
                    <button
                      key={a}
                      aria-pressed={guesses[p] === a}
                      className={guesses[p] === a ? 'mini on' : 'mini'}
                      onClick={() => guess(p, a)}
                    >
                      {ANSWER_LABEL[a]}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <div className="choices sticky-actions">
            <button className="btn btn-primary btn-huge" disabled={!allGuessed} onClick={() => update(guesses, true)}>
              {allGuessed ? 'Reveal answer' : `${guesses.filter((g) => g === null).length} still to guess`}
            </button>
          </div>
        </>
      )}
    </main>
  )
}

interface RevealProps {
  game: Game
  isLast: boolean
  onNext: () => void
  onUndo: () => void
}

function Reveal({ game, isLast, onNext, onUndo }: RevealProps) {
  const question = game.questions[game.index]
  const guesses = game.guesses[game.index]
  const party = game.mode === 'party'
  const correct = guesses.filter((g) => g === question.answer).length
  const allRight = correct === guesses.length

  return (
    <>
      {party ? (
        <div className="verdict verdict-right">
          It was {ANSWER_LABEL[question.answer]}
        </div>
      ) : (
        <div className={allRight ? 'verdict verdict-right' : 'verdict verdict-wrong'}>
          <span className="verdict-mark">{allRight ? '✓' : '✗'}</span>
          <span>{allRight ? 'Correct!' : 'Wrong!'}</span>
        </div>
      )}
      <div className="reveal">
        {!party && (
          <p className="reveal-answer">
            It was <b>{ANSWER_LABEL[question.answer]}</b>
          </p>
        )}
        {question.source && <p className="reveal-source">{question.source}</p>}
        <blockquote className="message message-small">{question.text}</blockquote>
        {party ? (
          <>
            <p className="small muted">
              {correct} of {guesses.length} got it right
            </p>
            <ul className="player-results">
              {game.players.map((player, p) => {
                const right = guesses[p] === question.answer
                return (
                  <li key={player} className={right ? 'right' : 'wrong'}>
                    <span className="review-mark">{right ? '✓' : '✗'}</span>
                    {player}
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <p className="muted small">Colin guessed {ANSWER_LABEL[guesses[0]!]}</p>
        )}
      </div>
      <div className="choices">
        <button className="btn btn-primary btn-huge" onClick={onNext}>
          {isLast ? 'See results' : 'Next message'}
        </button>
        <button className="link" onClick={onUndo}>
          {party ? 'Undo: change guesses' : 'Undo answer'}
        </button>
      </div>
    </>
  )
}
