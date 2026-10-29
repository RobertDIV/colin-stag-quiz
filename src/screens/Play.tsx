import { score } from '../game'
import { ANSWER_LABEL, type Answer, type Game } from '../types'

interface Props {
  game: Game
  onChange: (game: Game) => void
  onQuit: () => void
}

export default function Play({ game, onChange, onQuit }: Props) {
  const { index, questions, guesses } = game
  const question = questions[index]
  const guess = guesses[index]
  const isLast = index === questions.length - 1

  function answer(a: Answer) {
    onChange({ ...game, guesses: guesses.map((g, i) => (i === index ? a : g)) })
  }

  function undo() {
    onChange({ ...game, guesses: guesses.map((g, i) => (i === index ? null : g)) })
  }

  function next() {
    onChange({ ...game, index: index + 1 })
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
        <span className="score-pill">Score {score(game)}</span>
      </header>

      {guess === null ? (
        <>
          <p className="muted center">Read it out. Who said it?</p>
          <blockquote className="message">{question.text}</blockquote>
          <div className="choices">
            <button className="btn btn-primary btn-huge" onClick={() => answer('colin')}>
              Colin
            </button>
            <button className="btn btn-outline btn-huge" onClick={() => answer('porn')}>
              Gay Porn
            </button>
          </div>
        </>
      ) : (
        <Reveal question={question} guess={guess} isLast={isLast} onNext={next} onUndo={undo} />
      )}
    </main>
  )
}

interface RevealProps {
  question: Game['questions'][number]
  guess: Answer
  isLast: boolean
  onNext: () => void
  onUndo: () => void
}

function Reveal({ question, guess, isLast, onNext, onUndo }: RevealProps) {
  const correct = guess === question.answer
  return (
    <>
      <div className={correct ? 'verdict verdict-right' : 'verdict verdict-wrong'}>
        <span className="verdict-mark">{correct ? '✓' : '✗'}</span>
        <span>{correct ? 'Correct!' : 'Wrong!'}</span>
      </div>
      <div className="reveal">
        <p className="reveal-answer">
          It was <b>{ANSWER_LABEL[question.answer]}</b>
        </p>
        {question.source && <p className="reveal-source">{question.source}</p>}
        <blockquote className="message message-small">{question.text}</blockquote>
        <p className="muted small">Colin guessed {ANSWER_LABEL[guess]}</p>
      </div>
      <div className="choices">
        <button className="btn btn-primary btn-huge" onClick={onNext}>
          {isLast ? 'See results' : 'Next message'}
        </button>
        <button className="link" onClick={onUndo}>
          Undo answer
        </button>
      </div>
    </>
  )
}
