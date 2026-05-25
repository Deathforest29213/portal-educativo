import { useEffect, useMemo, useState } from 'react'
import { ActivityShell } from './components/ActivityShell'
import {
  INACTIVE_SOURCE_STORIES,
  STORIES,
} from './data/activities'
import { CollectionScreen } from './screens/CollectionScreen'
import { CompleteScreen } from './screens/CompleteScreen'
import { ExerciseScreen } from './screens/ExerciseScreen'
import { MenuScreen } from './screens/MenuScreen'
import { PrintScreen } from './screens/PrintScreen'
import { QuizScreen } from './screens/QuizScreen'
import type { AppView, QuestionFeedback } from './types'
import { useTonePlayer } from './utils/audio'
import './lectura-piramide.css'

type SessionSummary = {
  correct: number
  total: number
}

type LecturaPiramideActivityProps = {
  onSessionComplete?: (summary: SessionSummary) => void
  onSessionStart?: () => void
}

function LecturaPiramideActivity({
  onSessionComplete,
  onSessionStart,
}: LecturaPiramideActivityProps) {
  const [view, setView] = useState<AppView>('menu')
  const [sourceView, setSourceView] = useState<'menu' | 'collection'>('menu')
  const [storyId, setStoryId] = useState<string | null>(null)
  const [lineIndex, setLineIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null)
  const playTone = useTonePlayer()

  const story = useMemo(
    () => STORIES.find((item) => item.id === storyId) ?? null,
    [storyId],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!story || view !== 'exercise') return
      if (event.repeat) return

      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault()
        advanceLine()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, story, lineIndex])

  function startStory(nextId: string, origin: 'menu' | 'collection') {
    onSessionStart?.()
    setStoryId(nextId)
    setSourceView(origin)
    setLineIndex(0)
    setQuizIndex(0)
    setScore(0)
    setFeedback(null)
    setView('exercise')
  }

  function startRandom() {
    if (STORIES.length === 0) return
    const randomStory = STORIES[Math.floor(Math.random() * STORIES.length)]
    startStory(randomStory.id, 'menu')
  }

  function restartCurrentStory() {
    if (!story) return
    startStory(story.id, sourceView)
  }

  function backToSource() {
    setFeedback(null)
    setView(sourceView === 'collection' ? 'collection' : 'menu')
  }

  function advanceLine() {
    if (!story) return

    if (lineIndex < story.lines.length - 1) {
      setLineIndex((previous) => Math.min(previous + 1, story.lines.length - 1))
      playTone('step')
      return
    }

    setQuizIndex(0)
    setFeedback(null)
    setView('quiz')
  }

  function answerQuestion(optionIndex: number) {
    if (!story || feedback) return

    const currentQuestion = story.questions[quizIndex]
    const isCorrect = optionIndex === currentQuestion.correct
    if (isCorrect) {
      setScore((previous) => previous + 1)
      playTone('success')
    }

    setFeedback({ selected: optionIndex, isCorrect })
  }

  function goToNextQuestion() {
    if (!story) return

    if (quizIndex < story.questions.length - 1) {
      setQuizIndex((previous) => previous + 1)
      setFeedback(null)
      return
    }

    setView('complete')
    onSessionComplete?.({
      correct: score,
      total: story.questions.length,
    })
  }

  return (
    <ActivityShell>
      {view === 'menu' ? (
        <MenuScreen
          hasStories={STORIES.length > 0}
          inactiveStoryCount={INACTIVE_SOURCE_STORIES}
          onStartRandom={startRandom}
          onOpenCollection={() => setView('collection')}
        />
      ) : null}

      {view === 'collection' ? (
        <CollectionScreen
          stories={STORIES}
          onBack={() => setView('menu')}
          onOpenPrint={() => setView('print')}
          onSelectStory={(nextStoryId) => startStory(nextStoryId, 'collection')}
        />
      ) : null}

      {view === 'print' ? (
        <PrintScreen stories={STORIES} onBack={() => setView('collection')} />
      ) : null}

      {view === 'exercise' && story ? (
        <ExerciseScreen
          story={story}
          lineIndex={lineIndex}
          sourceView={sourceView}
          onBack={backToSource}
          onRestart={restartCurrentStory}
        />
      ) : null}

      {view === 'quiz' && story ? (
        <QuizScreen
          story={story}
          quizIndex={quizIndex}
          score={score}
          feedback={feedback}
          onBackToReading={() => setView('exercise')}
          onAnswer={answerQuestion}
          onNextQuestion={goToNextQuestion}
        />
      ) : null}

      {view === 'complete' ? (
        <CompleteScreen
          onBackToMenu={() => setView('menu')}
          onRestart={restartCurrentStory}
          onStartRandom={startRandom}
          onOpenCollection={() => setView('collection')}
        />
      ) : null}
    </ActivityShell>
  )
}

export default LecturaPiramideActivity
