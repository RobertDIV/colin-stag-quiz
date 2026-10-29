export type Answer = 'colin' | 'porn'

export const ANSWER_LABEL: Record<Answer, string> = {
  colin: 'Colin',
  porn: 'Gay Porn',
}

export interface Question {
  id: string
  text: string
  answer: Answer
  /** Revealed after the guess, e.g. "Sent to Jim" or "Found on a fireman thirst trap video". */
  source?: string
  /** Loaded from the built-in examples, so it can be cleared in one go. */
  example?: true
}

/** classic: Colin guesses alone. party: every player guesses each message. */
export type Mode = 'classic' | 'party'

export interface Settings {
  mode: Mode
  players: string[]
}

/** A game snapshots its questions and players so editing mid-game can't break it. */
export interface Game {
  mode: Mode
  players: string[]
  questions: Question[]
  /** guesses[question][player], null until chosen. */
  guesses: (Answer | null)[][]
  revealed: boolean[]
  index: number
}
