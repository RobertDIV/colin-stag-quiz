import { useState } from 'react'
import ConfirmButton from '../ConfirmButton'
import { getMix, isFinished } from '../game'
import type { Game, Mode, Question, Settings } from '../types'

interface Props {
  questions: Question[]
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  game: Game | null
  onStart: () => void
  onResume: () => void
  onEdit: () => void
}

const MODE_LABEL: Record<Mode, string> = { classic: 'Colin guesses', party: 'Party mode' }

export default function Home({ questions, settings, onSettingsChange, game, onStart, onResume, onEdit }: Props) {
  const [name, setName] = useState('')
  const mix = getMix(questions)
  const inProgress = game && !isFinished(game)
  const spare = mix.porn - mix.pornUsed
  const party = settings.mode === 'party'
  const needsPlayers = party && settings.players.length === 0
  const canStart = mix.canPlay && !needsPlayers

  const trimmed = name.trim()
  const duplicate = settings.players.some((p) => p.toLowerCase() === trimmed.toLowerCase())

  function addPlayer(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed || duplicate) return
    onSettingsChange({ ...settings, players: [...settings.players, trimmed] })
    setName('')
  }

  function removePlayer(player: string) {
    onSettingsChange({ ...settings, players: settings.players.filter((p) => p !== player) })
  }

  return (
    <main className="screen home">
      <header className="home-title">
        <h1>
          Colin <span className="or">or</span> <span className="tag">Gay Porn</span>?
        </h1>
        <p className="muted">
          {party ? 'Read the message out. Everyone guesses.' : 'Read the message out. Colin guesses. No cheating.'}
        </p>
      </header>

      <div className="tabs tabs-2" role="tablist">
        {(['classic', 'party'] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={settings.mode === m}
            className={settings.mode === m ? 'tab active' : 'tab'}
            onClick={() => onSettingsChange({ ...settings, mode: m })}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      {party && (
        <section className="panel">
          <h3 className="panel-title">Players</h3>
          {settings.players.length > 0 ? (
            <ul className="chips">
              {settings.players.map((p) => (
                <li key={p} className="chip">
                  {p}
                  <button aria-label={`Remove ${p}`} onClick={() => removePlayer(p)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">Add everyone who's guessing, Colin included if he's playing.</p>
          )}
          <form className="add-player" onSubmit={addPlayer}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Player name" maxLength={20} />
            <button className="btn btn-primary" disabled={!trimmed || duplicate}>
              Add
            </button>
          </form>
          {duplicate && trimmed && <p className="small muted">{trimmed} is already playing.</p>}
        </section>
      )}

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
            Resume {game.mode === 'party' ? 'party game' : 'game'} ({game.index + 1}/{game.questions.length})
          </button>
        )}
        {inProgress ? (
          <ConfirmButton
            className="btn btn-secondary"
            label={`New ${party ? 'party ' : ''}game`}
            confirmLabel="Tap again to abandon this game"
            onConfirm={onStart}
            disabled={!canStart}
          />
        ) : (
          <button className="btn btn-primary" onClick={onStart} disabled={!canStart}>
            Start {party ? 'party ' : ''}game
          </button>
        )}
        <button className="btn btn-secondary" onClick={onEdit}>
          Edit questions
        </button>
      </div>
      {needsPlayers && <p className="muted small center">Add at least one player to start a party game.</p>}
      {inProgress && <p className="muted small center">Edits and player changes apply from the next new game.</p>}
    </main>
  )
}
