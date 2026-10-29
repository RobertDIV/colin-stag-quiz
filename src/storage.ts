import type { Answer, Game, Question } from './types'

const QUESTIONS_KEY = 'csq.questions.v1'
const GAME_KEY = 'csq.game.v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    alert('Could not save to this phone. Export a backup now so nothing is lost.')
  }
}

/** Also flags examples loaded before the `example` field existed. */
export const loadQuestions = () =>
  read<Question[]>(QUESTIONS_KEY, []).map((q) =>
    !q.example && EXAMPLE_QUESTIONS.some((e) => e.text === q.text && e.source === q.source)
      ? { ...q, example: true as const }
      : q,
  )
export const saveQuestions = (questions: Question[]) => write(QUESTIONS_KEY, questions)
export const loadGame = () => read<Game | null>(GAME_KEY, null)
export const saveGame = (game: Game | null) => write(GAME_KEY, game)

/** Asks the browser not to evict our data when the phone is low on space. */
export function requestPersistence() {
  navigator.storage?.persist?.().catch(() => {})
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function exportBackup(questions: Question[]) {
  const payload = { app: 'colin-stag-quiz', version: 1, exportedAt: new Date().toISOString(), questions }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `colin-quiz-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Accepts an exported backup (or a bare array of questions). Throws on anything unusable. */
export function parseBackup(text: string): Question[] {
  const data = JSON.parse(text)
  const items: unknown = Array.isArray(data) ? data : data?.questions
  if (!Array.isArray(items)) throw new Error('No questions found in that file.')
  return items.map((item, i) => {
    const q = item as Partial<Question>
    const answer = q.answer as Answer
    if (typeof q.text !== 'string' || !q.text.trim() || (answer !== 'colin' && answer !== 'porn')) {
      throw new Error(`Question ${i + 1} in that file is missing its text or answer.`)
    }
    return {
      id: typeof q.id === 'string' && q.id ? q.id : newId(),
      text: q.text,
      answer,
      source: typeof q.source === 'string' && q.source.trim() ? q.source : undefined,
      ...(q.example === true && { example: true as const }),
    }
  })
}

export const EXAMPLE_QUESTIONS: Omit<Question, 'id' | 'example'>[] = [
  { text: 'Mate your calves at five-a-side last night were unreal 🔥', answer: 'colin', source: 'Example: sent to Jim' },
  { text: 'Those arms should be illegal', answer: 'porn', source: 'Example: comment on a fireman thirst trap video' },
  { text: "Honestly you're looking so good since you started the gym", answer: 'colin', source: 'Example: sent to Dave' },
  { text: 'The way he carries that hose 😩', answer: 'porn', source: 'Example: comment on a fireman thirst trap video' },
]
