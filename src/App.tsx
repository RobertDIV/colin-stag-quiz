import { useEffect, useState } from 'react'
import { isFinished, newGame } from './game'
import { loadGame, loadQuestions, loadSettings, saveGame, saveQuestions, saveSettings } from './storage'
import type { Game, Question, Settings } from './types'
import Home from './screens/Home'
import Editor from './screens/Editor'
import Play from './screens/Play'
import Results from './screens/Results'

type Screen = 'home' | 'editor' | 'play'

export default function App() {
  const [questions, setQuestions] = useState<Question[]>(loadQuestions)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [game, setGame] = useState<Game | null>(loadGame)
  const [screen, setScreen] = useState<Screen>('home')

  useEffect(() => saveQuestions(questions), [questions])
  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => saveGame(game), [game])

  // Android's back button returns to the home screen rather than closing the app.
  useEffect(() => {
    const onPop = () => setScreen('home')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function go(next: Screen) {
    if (next !== 'home' && screen === 'home') history.pushState(null, '')
    if (next === 'home' && screen !== 'home') history.back()
    else setScreen(next)
  }

  function startGame() {
    setGame(newGame(questions, settings))
    go('play')
  }

  if (screen === 'editor') {
    return <Editor questions={questions} onChange={setQuestions} onBack={() => go('home')} />
  }
  if (screen === 'play' && game) {
    return isFinished(game) ? (
      <Results game={game} onPlayAgain={startGame} onHome={() => go('home')} />
    ) : (
      <Play game={game} onChange={setGame} onQuit={() => go('home')} />
    )
  }
  return (
    <Home
      questions={questions}
      settings={settings}
      onSettingsChange={setSettings}
      game={game}
      onStart={startGame}
      onResume={() => go('play')}
      onEdit={() => go('editor')}
    />
  )
}
