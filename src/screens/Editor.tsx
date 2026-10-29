import { useRef, useState } from 'react'
import { EXAMPLE_QUESTIONS, exportBackup, newId, parseBackup } from '../storage'
import { ANSWER_LABEL, type Answer, type Question } from '../types'

interface Props {
  questions: Question[]
  onChange: (questions: Question[]) => void
  onBack: () => void
}

type Filter = 'all' | Answer

interface Draft {
  id: string | null
  text: string
  answer: Answer | null
  source: string
}

const EMPTY_DRAFT: Draft = { id: null, text: '', answer: null, source: '' }

export default function Editor({ questions, onChange, onBack }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const importMode = useRef<'add' | 'replace'>('add')
  const fileInput = useRef<HTMLInputElement>(null)

  const shown = filter === 'all' ? questions : questions.filter((q) => q.answer === filter)
  const colinCount = questions.filter((q) => q.answer === 'colin').length

  function save() {
    if (!draft || !draft.text.trim() || !draft.answer) return
    const q: Question = {
      id: draft.id ?? newId(),
      text: draft.text.trim(),
      answer: draft.answer,
      source: draft.source.trim() || undefined,
    }
    onChange(draft.id ? questions.map((x) => (x.id === q.id ? q : x)) : [q, ...questions])
    setDraft(null)
  }

  function remove() {
    if (!draft?.id || !confirm('Delete this question?')) return
    onChange(questions.filter((q) => q.id !== draft.id))
    setDraft(null)
  }

  function pickImport(mode: 'add' | 'replace') {
    importMode.current = mode
    fileInput.current?.click()
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = parseBackup(await file.text())
      if (importMode.current === 'replace') {
        if (!confirm(`Replace all ${questions.length} questions with the ${imported.length} in this file?`)) return
        onChange(imported)
      } else {
        const known = new Set(questions.map((q) => q.id))
        const fresh = imported.filter((q) => !known.has(q.id))
        onChange([...questions, ...fresh])
        alert(`Added ${fresh.length} new questions${fresh.length < imported.length ? ` (${imported.length - fresh.length} already here)` : ''}.`)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read that file.')
    }
  }

  if (draft) {
    const canSave = draft.text.trim() !== '' && draft.answer !== null
    return (
      <main className="screen editor">
        <header className="bar">
          <button className="link" onClick={() => setDraft(null)}>
            ‹ Cancel
          </button>
          <h2>{draft.id ? 'Edit question' : 'New question'}</h2>
          <span />
        </header>

        <label className="field">
          <span>Message</span>
          <textarea
            rows={6}
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            placeholder="Type or paste the message"
            autoFocus
          />
        </label>

        <div className="field">
          <span>Who said it?</span>
          <div className="toggle">
            {(['colin', 'porn'] as Answer[]).map((a) => (
              <button
                key={a}
                className={draft.answer === a ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={() => setDraft({ ...draft, answer: a })}
              >
                {ANSWER_LABEL[a]}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Source (optional, shown after the guess)</span>
          <input
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value })}
            placeholder={draft.answer === 'porn' ? 'Found on a fireman thirst trap video' : 'Sent to Jim'}
          />
        </label>

        <div className="actions">
          <button className="btn btn-primary" onClick={save} disabled={!canSave}>
            Save
          </button>
          {draft.id && (
            <button className="btn btn-danger" onClick={remove}>
              Delete
            </button>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="screen editor">
      <header className="bar">
        <button className="link" onClick={onBack}>
          ‹ Menu
        </button>
        <h2>Questions</h2>
        <span />
      </header>

      <button className="btn btn-primary" onClick={() => setDraft(EMPTY_DRAFT)}>
        + Add question
      </button>

      <div className="tabs" role="tablist">
        {(['all', 'colin', 'porn'] as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'tab active' : 'tab'} onClick={() => setFilter(f)}>
            {f === 'all' ? `All ${questions.length}` : `${ANSWER_LABEL[f]} ${f === 'colin' ? colinCount : questions.length - colinCount}`}
          </button>
        ))}
      </div>

      {questions.length === 0 ? (
        <div className="empty">
          <p className="muted">No questions yet.</p>
          <button
            className="btn btn-secondary"
            onClick={() => onChange(EXAMPLE_QUESTIONS.map((q) => ({ ...q, id: newId() })))}
          >
            Load examples to try it out
          </button>
        </div>
      ) : (
        <ul className="q-list">
          {shown.map((q) => (
            <li key={q.id}>
              <button className="q-item" onClick={() => setDraft({ id: q.id, text: q.text, answer: q.answer, source: q.source ?? '' })}>
                <span className={q.answer === 'colin' ? 'badge badge-colin' : 'badge badge-porn'}>{ANSWER_LABEL[q.answer]}</span>
                <span className="q-text">{q.text}</span>
                {q.source && <span className="q-source">{q.source}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <section className="panel backup">
        <h3>Backup</h3>
        <p className="muted small">Questions only live on this phone. Export after each editing session.</p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => exportBackup(questions)} disabled={questions.length === 0}>
            Export backup
          </button>
          <button className="btn btn-secondary" onClick={() => pickImport('add')}>
            Import and add
          </button>
          <button className="btn btn-secondary" onClick={() => pickImport('replace')}>
            Import and replace all
          </button>
        </div>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
      </section>
    </main>
  )
}
