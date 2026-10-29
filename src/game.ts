import type { Game, Question, Settings } from './types'

export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export interface Mix {
  colin: number
  porn: number
  /** How many Gay Porn messages the next game will use. */
  pornUsed: number
  canPlay: boolean
}

/**
 * Every Colin message is always played. Gay Porn messages are picked at random
 * to match the Colin count, so spare bait can be loaded without unbalancing the game.
 */
export function getMix(questions: Question[]): Mix {
  const colin = questions.filter((q) => q.answer === 'colin').length
  const porn = questions.length - colin
  return { colin, porn, pornUsed: Math.min(colin, porn), canPlay: colin > 0 && porn > 0 }
}

export function newGame(questions: Question[], settings: Settings): Game {
  const colin = questions.filter((q) => q.answer === 'colin')
  const porn = shuffle(questions.filter((q) => q.answer === 'porn')).slice(0, colin.length)
  const picked = shuffle([...colin, ...porn])
  const players = settings.mode === 'party' ? settings.players : ['Colin']
  return {
    mode: settings.mode,
    players,
    questions: picked,
    guesses: picked.map(() => players.map(() => null)),
    revealed: picked.map(() => false),
    index: 0,
  }
}

/** Correct answers per player, in player order. */
export function scores(game: Game): number[] {
  return game.players.map((_, p) => game.guesses.filter((g, i) => g[p] === game.questions[i].answer).length)
}

export function isFinished(game: Game): boolean {
  return game.index >= game.questions.length
}
