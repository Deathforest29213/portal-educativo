import { useEffect, useRef, useState } from 'react'
import { PyramidStack } from '../components/PyramidStack'
import { TopBar } from '../components/TopBar'
import type { Minihistory, QuestionFeedback } from '../types'

interface QuizScreenProps {
  story: Minihistory
  quizIndex: number
  score: number
  feedback: QuestionFeedback | null
  onBackToReading: () => void
  onAnswer: (optionIndex: number) => void
  onNextQuestion: () => void
}

export function QuizScreen({
  story,
  quizIndex,
  score,
  feedback,
  onBackToReading,
  onAnswer,
  onNextQuestion,
}: QuizScreenProps) {
  const question = story.questions[quizIndex]
  const finalLine = story.lines[story.lines.length - 1]
  const summaryPanelRef = useRef<HTMLDivElement | null>(null)
  const [questionPanelHeight, setQuestionPanelHeight] = useState<number | null>(null)

  useEffect(() => {
    const summaryPanel = summaryPanelRef.current
    if (!summaryPanel) return

    const twoColumnQuery = window.matchMedia('(min-width: 1121px)')
    const syncHeight = () => {
      if (!twoColumnQuery.matches) {
        setQuestionPanelHeight(null)
        return
      }

      setQuestionPanelHeight(Math.ceil(summaryPanel.getBoundingClientRect().height))
    }

    syncHeight()

    const observer = new ResizeObserver(syncHeight)
    observer.observe(summaryPanel)
    twoColumnQuery.addEventListener('change', syncHeight)

    return () => {
      observer.disconnect()
      twoColumnQuery.removeEventListener('change', syncHeight)
    }
  }, [quizIndex, story.id])

  return (
    <>
      <TopBar
        label={`Pregunta ${quizIndex + 1} de ${story.questions.length}`}
        backLabel="Volver a la lectura"
        onBack={onBackToReading}
      />

      <section className="quiz-grid">
        <div className="summary-panel glass" ref={summaryPanelRef}>
          <div className="eyebrow">{story.badge}</div>
          <h2 className="section-title">{story.title}</h2>
          <p className="copy">La pirámide queda visible para apoyar la comprensión.</p>

          <div className="image-stage">
            <div className="image-frame">
              {finalLine.image ? (
                <img src={finalLine.image} alt={story.title} loading="lazy" />
              ) : null}
            </div>
          </div>

          <PyramidStack story={story} mode="summary" />
        </div>

        <div
          className="question-panel glass"
          style={questionPanelHeight ? { height: `${questionPanelHeight}px` } : undefined}
        >
          <div className="eyebrow">
            <span>🧠</span>
            <span>Respuestas correctas: {score}</span>
          </div>

          <h3 className="section-title">{question.q}</h3>
          <p className="copy question-help">Elige la alternativa correcta.</p>

          <div className="option-list" data-option-size="medium">
            {question.options.map((option, index) => {
              let extraClass = ''
              if (feedback) {
                if (index === question.correct) {
                  extraClass = 'correct'
                } else if (index === feedback.selected && !feedback.isCorrect) {
                  extraClass = 'wrong'
                }
              }

              return (
                <button
                  key={`${story.id}-option-${index}`}
                  className={`option-button ${extraClass}`}
                  type="button"
                  onClick={() => onAnswer(index)}
                  disabled={Boolean(feedback)}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {feedback ? (
            <div className="feedback-box">
              <strong>{feedback.isCorrect ? '¡Correcto!' : 'Casi'}</strong>
              <div className="muted">{question.explanation}</div>

              {feedback.isCorrect ? (
                <div className="burst" aria-hidden="true">
                  <span>✨</span>
                  <span>🎉</span>
                  <span>✨</span>
                  <span>🎊</span>
                </div>
              ) : null}

              <div className="controls">
                <button className="result-button" type="button" onClick={onNextQuestion}>
                  {quizIndex < story.questions.length - 1
                    ? 'Siguiente pregunta'
                    : 'Terminar actividad'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
