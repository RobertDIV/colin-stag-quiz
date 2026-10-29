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

/** A game snapshots its questions so editing mid-game can't break it. */
export interface Game {
  questions: Question[]
  /** Colin's guess for each question, null until answered. */
  guesses: (Answer | null)[]
  index: number
}
