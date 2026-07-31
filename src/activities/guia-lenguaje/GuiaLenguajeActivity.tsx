import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ActionButton } from '../../app/components/ActionButton'
import { ConfirmDialog } from '../../app/components/ConfirmDialog'
import { FeedbackBanner } from '../../app/components/FeedbackBanner'
import { ProgressBadge } from '../../app/components/ProgressBadge'
import { browserRandom } from '../../platform/random/RandomSource'
import {
  menuOptions,
  task1Parts,
  task1Questions,
  task2Image,
  task2Prompts,
  task2Text,
  task3Questions,
  type TaskKey,
} from './data/content'
import { playFeedbackSound } from './utils/audio'
import {
  createGuideState,
  getResultTaskKeys,
  guideReducer,
  type FragmentSelection,
  type GuideFeedback as Feedback,
  type GuideSelection,
  type GuideStage as Stage,
  type ResultsState,
  type TaskResult,
} from './domain/guideState'

function shuffleArray<T>(items: T[]) {
  return browserRandom.shuffle(items)
}

function getTotals(results: ResultsState) {
  const all = [...results.task1, ...results.task2, ...results.task3]
  const correct = all.filter((result) => result.correct).length
  return { correct, incorrect: all.length - correct, total: all.length }
}

export default function GuiaLenguajeActivity() {
  const [state, dispatch] = useReducer(
    guideReducer,
    undefined,
    () => createGuideState(makeTask2Choices()),
  )
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const {
    stage,
    sequence,
    selection,
    results,
    task1Mode,
    task1Part,
    task1Question,
    task1Selected,
    task1Feedback,
    task2Question,
    task2Selected,
    task2Feedback,
    task2Choices,
    task3Question,
    task3Selected,
    task3Feedback,
  } = state
  const totals = useMemo(() => getTotals(results), [results])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [stage, task1Mode])

  function resetGuide(
    nextStage: Stage = 'menu',
    nextSequence: TaskKey[] = [],
    nextSelection: GuideSelection = null,
  ) {
    dispatch({
      type: 'RESET',
      stage: nextStage,
      sequence: nextSequence,
      selection: nextSelection,
      task2Choices: makeTask2Choices(),
    })
  }

  function startGuide(selection: TaskKey | 'all') {
    const nextSequence: TaskKey[] = selection === 'all' ? ['task1', 'task2', 'task3'] : [selection]
    resetGuide(nextSequence[0], nextSequence, selection)
  }

  function registerResult(task: TaskKey, result: TaskResult) {
    dispatch({ type: 'REGISTER_RESULT', task, result })
  }

  function goNext(currentTask: TaskKey) {
    const index = sequence.indexOf(currentTask)
    const next = sequence[index + 1]
    dispatch({ type: 'SET_STAGE', stage: next ?? 'results' })
  }

  function discardGuideProgress() {
    setShowExitConfirm(false)
    resetGuide('menu', [])
  }

  function requestGuideExit() {
    if (stage === 'results') {
      discardGuideProgress()
      return
    }

    setShowExitConfirm(true)
  }

  function goBackToTaskOneReading() {
    dispatch({ type: 'BACK_TO_TASK1_READING', lastPart: task1Parts.length - 1 })
  }

  const backButtonLabel = stage === 'task1' && task1Mode === 'quiz' ? '← Volver a la lectura' : '← Volver al menú'
  const backButtonAction = stage === 'task1' && task1Mode === 'quiz' ? goBackToTaskOneReading : requestGuideExit

  if (stage === 'menu') {
    return (
      <section className="guide-original guide-original-menu">
        <div className="guide-original-copy">
          <span className="task-badge">Lenguaje</span>
          <h2>Guía de Lenguaje</h2>
          <p className="guide-original-help">
            Explora tres trabajos distintos o completa la guía en orden, desde el primero hasta el tercero.
          </p>
        </div>
        <div className="guide-original-grid">
          {menuOptions.map((option) => (
            <button className="guide-original-card ui-card ui-card--interactive" key={option.id} onClick={() => startGuide(option.id)} type="button">
              <span>{option.label}</span>
              <div className="guide-original-card-image">
                <img alt="" src={option.image} />
              </div>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </button>
          ))}
          <button className="guide-original-card guide-original-card--all ui-card ui-card--interactive" onClick={() => startGuide('all')} type="button">
            <span>Guía completa</span>
            <div className="guide-original-card-sequence" aria-hidden="true">
              <b>1</b><i>→</i><b>2</b><i>→</i><b>3</b>
            </div>
            <strong>Hacer los tres trabajos</strong>
            <small>Avanza por las tres tareas en orden y recibe un resultado conjunto al finalizar.</small>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="guide-original guide-original-workspace">
      <div className="activity-back-row">
        <ActionButton onClick={backButtonAction} variant="quiet">
          {backButtonLabel}
        </ActionButton>
      </div>
      <GuideTopBar stage={stage} totals={totals} showScore={stage === 'task2' && totals.total > 0} />
      {stage === 'task1' ? (
        <TaskOne
          feedback={task1Feedback}
          mode={task1Mode}
          partIndex={task1Part}
          questionIndex={task1Question}
          registerResult={registerResult}
          selected={task1Selected}
          setFeedback={(feedback) => dispatch({ type: 'SET_TASK1_FEEDBACK', feedback })}
          setMode={(mode) => dispatch({ type: 'SET_TASK1_MODE', mode })}
          setPartIndex={(index) => dispatch({ type: 'SET_TASK1_PART', index })}
          setQuestionIndex={(index) => dispatch({ type: 'SET_TASK1_QUESTION', index })}
          setSelected={(selected) => dispatch({ type: 'SET_TASK1_SELECTED', selected })}
          totals={totals}
          onDone={() => goNext('task1')}
        />
      ) : null}
      {stage === 'task2' ? (
        <TaskTwo
          choices={task2Choices}
          feedback={task2Feedback}
          questionIndex={task2Question}
          registerResult={registerResult}
          selected={task2Selected}
          setFeedback={(feedback) => dispatch({ type: 'SET_TASK2_FEEDBACK', feedback })}
          setQuestionIndex={(index) => dispatch({ type: 'SET_TASK2_QUESTION', index })}
          setSelected={(selected) => dispatch({ type: 'SET_TASK2_SELECTED', selected })}
          onDone={() => goNext('task2')}
        />
      ) : null}
      {stage === 'task3' ? (
        <TaskThree
          feedback={task3Feedback}
          questionIndex={task3Question}
          registerResult={registerResult}
          selected={task3Selected}
          setFeedback={(feedback) => dispatch({ type: 'SET_TASK3_FEEDBACK', feedback })}
          setQuestionIndex={(index) => dispatch({ type: 'SET_TASK3_QUESTION', index })}
          setSelected={(selected) => dispatch({ type: 'SET_TASK3_SELECTED', selected })}
          totals={totals}
          onDone={() => goNext('task3')}
        />
      ) : null}
      {stage === 'results' ? (
        <ResultsScreen results={results} resetGuide={() => resetGuide()} selection={selection} />
      ) : null}
      <ConfirmDialog
        confirmLabel="Descartar avance"
        description="Se perderán las respuestas y el avance de esta guía."
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={discardGuideProgress}
        open={showExitConfirm}
        title="¿Volver al menú?"
        tone="danger"
      />
    </section>
  )
}

function makeTask2Choices() {
  return task2Prompts.map((prompt) => shuffleArray(prompt.fragments))
}

function GuideTopBar({
  showScore = true,
  stage,
  totals,
}: {
  showScore?: boolean
  stage: Stage
  totals: { correct: number; total: number }
}) {
  const titles: Record<Stage, string> = {
    menu: 'Guía de Lenguaje',
    task1: 'Las cartas de Teodoro',
    task2: 'Incendio en el cerro Caracol de Concepción',
    task3: 'Sucesos y decisiones del día a día',
    results: 'Resultados',
  }

  return (
    <header className="guide-original-topbar">
      <div>
        <p>Guía lenguaje tradicional · v1.1.10</p>
        <h2>{titles[stage]}</h2>
      </div>
      {showScore ? (
        <ProgressBadge current={totals.correct} label="Aciertos" showBar={false} total={totals.total} />
      ) : null}
    </header>
  )
}

function TaskOne(props: {
  feedback: Feedback
  mode: 'reading' | 'quiz'
  onDone: () => void
  partIndex: number
  questionIndex: number
  registerResult: (task: TaskKey, result: TaskResult) => void
  selected: string
  setFeedback: (feedback: Feedback) => void
  setMode: (mode: 'reading' | 'quiz') => void
  setPartIndex: (index: number) => void
  setQuestionIndex: (index: number) => void
  setSelected: (selected: string) => void
  totals: { correct: number; total: number }
}) {
  if (props.mode === 'reading') {
    const part = task1Parts[props.partIndex]
    return (
      <section className="guide-original-reading">
        <div className="guide-reading-image">
          <span>Parte {props.partIndex + 1} de {task1Parts.length}</span>
          <img alt="" src={part.image} />
        </div>
        <article className="guide-reading-copy-card">
          <TaskHeader label="Tarea 1" />
          {part.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="guide-reading-actions">
            <PartDots active={props.partIndex} total={task1Parts.length} />
            <ActionButton
              onClick={() => {
                if (props.partIndex < task1Parts.length - 1) props.setPartIndex(props.partIndex + 1)
                else props.setMode('quiz')
              }}
            >
              {props.partIndex < task1Parts.length - 1 ? 'Siguiente parte' : 'Responder'}
            </ActionButton>
          </div>
        </article>
      </section>
    )
  }

  const question = task1Questions[props.questionIndex]
  const answerQuestion = (option: string) => {
    if (props.feedback !== null) return

    const correct = option === question.answer
    props.setSelected(option)
    playFeedbackSound(correct)
    props.registerResult('task1', {
      id: question.id,
      correct,
      label: question.question,
      selected: option,
      answer: question.answer,
      points: correct ? question.points : 0,
      maxPoints: question.points,
    })
    props.setFeedback(correct)
  }

  return (
    <QuestionLayout
      badge="Tarea 1"
      feedback={props.feedback}
      image={question.image}
      imageAlt={question.imageAlt}
      onNext={() => {
        if (props.questionIndex < task1Questions.length - 1) {
          props.setQuestionIndex(props.questionIndex + 1)
          props.setSelected('')
          props.setFeedback(null)
        } else {
          props.onDone()
        }
      }}
      nextLabel={props.questionIndex < task1Questions.length - 1 ? 'Siguiente pregunta' : 'Terminar tarea'}
      progress={`Pregunta ${props.questionIndex + 1} de ${task1Questions.length}`}
      skill={question.skill}
      title={question.question}
      totals={props.totals}
    >
      <OptionList answer={question.answer} feedback={props.feedback} onAnswer={answerQuestion} options={question.options} selected={props.selected} />
    </QuestionLayout>
  )
}

function TaskTwo(props: {
  choices: string[][]
  feedback: Feedback
  onDone: () => void
  questionIndex: number
  registerResult: (task: TaskKey, result: TaskResult) => void
  selected: FragmentSelection[]
  setFeedback: (feedback: Feedback) => void
  setQuestionIndex: (index: number) => void
  setSelected: (selected: FragmentSelection[]) => void
}) {
  const prompt = task2Prompts[props.questionIndex]
  const selectedText = props.selected.map((item) => item.text)
  const answerText = prompt.answer.join(' ')
  const fragments = props.choices[props.questionIndex]

  return (
    <section className="guide-task-two">
      <TaskHeader label="Tarea 2" skill="Interpretar y relacionar" />
      <div className="guide-task-two-grid">
        <div className="guide-task-two-source">
          <img alt="Incendio en cerro Caracol" src={task2Image} />
          <div>
            <h3>Incendio en el cerro Caracol de Concepción</h3>
            {task2Text.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>
                {paragraph.map((segment, segmentIndex) =>
                  segment.strong ? <strong key={`${paragraphIndex}-${segmentIndex}`}>{segment.text}</strong> : <span key={`${paragraphIndex}-${segmentIndex}`}>{segment.text}</span>,
                )}
              </p>
            ))}
          </div>
        </div>
        <div className="guide-fragment-panel">
          <div className="guide-fragments">
            <p>Fragmentos</p>
            <div>
              {fragments.map((text, index) => {
                const id = `${props.questionIndex}-${index}-${text}`
                const isSelected = props.selected.some((item) => item.id === id)
                return (
                  <button
                    className={isSelected ? 'is-used' : ''}
                    disabled={props.feedback !== null}
                    key={id}
                    onClick={() => {
                      if (isSelected) {
                        props.setSelected(props.selected.filter((item) => item.id !== id))
                      } else {
                        props.setSelected([...props.selected, { id, text }])
                      }
                    }}
                    type="button"
                  >
                    <span>{text}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <p className="guide-progress">Frase {props.questionIndex + 1}/{task2Prompts.length}</p>
          <h3>{prompt.question}</h3>
          <div className={`guide-answer-slot ${props.feedback === false ? 'is-wrong' : props.feedback === true ? 'is-correct' : ''}`}>
            {props.selected.length === 0 ? <span>Selecciona y ordena los fragmentos.</span> : props.selected.map((fragment, index) => (
              <div className="guide-answer-fragment" key={fragment.id}>
                <span>{fragment.text}</span>
                <div className="guide-answer-fragment-actions">
                  <button
                    aria-label={`Mover ${fragment.text} a la izquierda`}
                    disabled={props.feedback !== null || index === 0}
                    onClick={() => {
                      const reordered = [...props.selected]
                      ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
                      props.setSelected(reordered)
                    }}
                    type="button"
                  >
                    ←
                  </button>
                  <button
                    aria-label={`Mover ${fragment.text} a la derecha`}
                    disabled={props.feedback !== null || index === props.selected.length - 1}
                    onClick={() => {
                      const reordered = [...props.selected]
                      ;[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]]
                      props.setSelected(reordered)
                    }}
                    type="button"
                  >
                    →
                  </button>
                  <button
                    aria-label={`Quitar ${fragment.text}`}
                    disabled={props.feedback !== null}
                    onClick={() => props.setSelected(props.selected.filter((item) => item.id !== fragment.id))}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <FeedbackBar correct={props.feedback} />
          <div className="guide-fragment-actions">
            {props.feedback === null ? (
              <ActionButton
                disabled={props.selected.length === 0}
                onClick={() => {
                  const correct = selectedText.join('|') === prompt.answer.join('|')
                  playFeedbackSound(correct)
                  props.registerResult('task2', {
                    id: prompt.id,
                    correct,
                    label: prompt.question,
                    selected: selectedText.join(' '),
                    answer: answerText,
                    points: correct ? 1 : 0,
                    maxPoints: 1,
                  })
                  props.setFeedback(correct)
                }}
              >
                Revisar respuesta
              </ActionButton>
            ) : (
              <ActionButton
                onClick={() => {
                  if (props.questionIndex < task2Prompts.length - 1) {
                    props.setQuestionIndex(props.questionIndex + 1)
                    props.setSelected([])
                    props.setFeedback(null)
                  } else {
                    props.onDone()
                  }
                }}
              >
                Continuar
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function TaskThree(props: {
  feedback: Feedback
  onDone: () => void
  questionIndex: number
  registerResult: (task: TaskKey, result: TaskResult) => void
  selected: string
  setFeedback: (feedback: Feedback) => void
  setQuestionIndex: (index: number) => void
  setSelected: (selected: string) => void
  totals: { correct: number; total: number }
}) {
  const question = task3Questions[props.questionIndex]
  const answerQuestion = (option: string) => {
    if (props.feedback !== null) return

    const correct = option === question.answer
    props.setSelected(option)
    playFeedbackSound(correct)
    props.registerResult('task3', {
      id: question.id,
      correct,
      label: question.story,
      selected: option,
      answer: question.answer,
      points: correct ? 1 : 0,
      maxPoints: 1,
    })
    props.setFeedback(correct)
  }

  return (
    <QuestionLayout
      badge="Tarea 3"
      feedback={props.feedback}
      onNext={() => {
        if (props.questionIndex < task3Questions.length - 1) {
          props.setQuestionIndex(props.questionIndex + 1)
          props.setSelected('')
          props.setFeedback(null)
        } else {
          props.onDone()
        }
      }}
      nextLabel={props.questionIndex < task3Questions.length - 1 ? 'Siguiente pregunta' : 'Terminar tarea'}
      progress={`Pregunta ${props.questionIndex + 1} de ${task3Questions.length}`}
      skill="Interpretar y relacionar"
      title={question.story}
      totals={props.totals}
    >
      <div className="guide-visual-options">
        {question.options.map((option) => {
          const showCorrect = props.feedback !== null && option.text === question.answer
          const showWrong = props.feedback === false && props.selected === option.text && option.text !== question.answer
          return (
            <button
              aria-pressed={props.selected === option.text}
              className={`${props.selected === option.text ? 'is-selected' : ''} ${showCorrect ? 'is-correct' : ''} ${showWrong ? 'is-wrong' : ''}`}
              disabled={props.feedback !== null}
              key={option.text}
              onClick={() => answerQuestion(option.text)}
              type="button"
            >
              <img alt={option.text} src={option.image} />
              <span>{option.text}</span>
            </button>
          )
        })}
      </div>
    </QuestionLayout>
  )
}

function QuestionLayout(props: {
  badge: string
  children: React.ReactNode
  feedback: Feedback
  image?: string
  imageAlt?: string
  nextLabel: string
  onNext: () => void
  progress: string
  skill: string
  title: string
  totals: { correct: number; total: number }
}) {
  const nextQuestionButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (props.feedback !== null) nextQuestionButtonRef.current?.focus()
  }, [props.feedback])

  return (
    <section className={`guide-question-layout ${props.image ? '' : 'is-text-only'} ${props.feedback === false ? 'is-wrong' : props.feedback === true ? 'is-correct' : ''}`}>
      {props.image ? (
        <aside className="guide-question-image">
          <img alt={props.imageAlt ?? ''} src={props.image} />
        </aside>
      ) : null}
      <article className="guide-question-body">
        <div className="guide-question-meta">
          <TaskHeader label={props.badge} skill={props.skill} />
          <span className="guide-question-progress">{props.progress}</span>
        </div>
        <div className="guide-question-score">
          <span>Respuestas correctas: {props.totals.correct}</span>
        </div>
        <h3>{props.title}</h3>
        <p className="guide-question-help">Elige la alternativa correcta.</p>
        {props.children}
        <div className="guide-question-response" aria-live="polite">
          {props.feedback !== null ? (
            <>
              <FeedbackBar correct={props.feedback} />
              <div className="guide-question-actions">
                <ActionButton onClick={props.onNext} ref={nextQuestionButtonRef}>
                  {props.nextLabel}
                </ActionButton>
              </div>
            </>
          ) : (
            <p className="guide-question-response-placeholder">Selecciona una alternativa para continuar.</p>
          )}
        </div>
      </article>
    </section>
  )
}

function OptionList(props: {
  answer: string
  feedback: Feedback
  onAnswer: (option: string) => void
  options: string[]
  selected: string
}) {
  return (
    <div className="guide-option-list" data-option-size="medium">
      {props.options.map((option) => {
        const showCorrect = props.feedback !== null && option === props.answer
        const showWrong = props.feedback === false && props.selected === option && option !== props.answer
        return (
          <button
            aria-pressed={props.selected === option}
            className={`guide-option-button ${props.selected === option ? 'is-selected' : ''} ${showCorrect ? 'is-correct' : ''} ${showWrong ? 'is-wrong' : ''}`}
            disabled={props.feedback !== null}
            key={option}
            onClick={() => props.onAnswer(option)}
            type="button"
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function TaskHeader({ label, skill }: { label: string; skill?: string }) {
  return (
    <div className="guide-task-header">
      <span>{label}</span>
      {skill ? <strong>{skill}</strong> : null}
    </div>
  )
}

function PartDots({ active, total }: { active: number; total: number }) {
  return (
    <div aria-label={`Parte ${active + 1} de ${total}`} className="guide-part-dots" role="status">
      {Array.from({ length: total }, (_, index) => (
        <span aria-hidden="true" className={index === active ? 'is-active' : ''} key={index} />
      ))}
    </div>
  )
}

function FeedbackBar({ correct }: { correct: Feedback }) {
  if (correct === null) return null
  return (
    <FeedbackBanner className="guide-feedback-banner" title={correct ? 'Respuesta correcta' : 'Revisa la respuesta'} tone={correct ? 'success' : 'danger'}>
      {correct ? 'Muy bien. Puedes continuar.' : 'Observa la alternativa correcta antes de continuar.'}
    </FeedbackBanner>
  )
}

function ResultsScreen({
  results,
  resetGuide,
  selection,
}: {
  results: ResultsState
  resetGuide: () => void
  selection: GuideSelection
}) {
  const visibleTaskKeys = getResultTaskKeys(selection)
  const visibleOptions = menuOptions.filter((option) => visibleTaskKeys.includes(option.id))
  const visibleResults = visibleTaskKeys.flatMap((task) => results[task])
  const correct = visibleResults.filter((result) => result.correct).length
  const selectedOption = selection !== 'all' ? visibleOptions[0] : null
  const isCompleteGuide = selection === 'all'

  return (
    <section className={`guide-results ${isCompleteGuide ? 'guide-results--complete' : 'guide-results--single'}`}>
      <span className="task-badge">{isCompleteGuide ? 'Resultados globales' : 'Resultado de la actividad'}</span>
      <h2>{isCompleteGuide ? 'Guía terminada' : `${selectedOption?.title ?? 'Actividad'} terminada`}</h2>
      <p>
        {isCompleteGuide ? 'Completaste la guía' : 'Completaste esta actividad'} con {correct} respuestas correctas de {visibleResults.length}.
      </p>
      <p>
        {isCompleteGuide
          ? 'Revisa cada parte para decidir qué conviene practicar nuevamente.'
          : 'Este resumen corresponde solo a la actividad que seleccionaste.'}
      </p>
      <div className="guide-results-grid">
        {visibleOptions.map((option) => {
          const taskResults = results[option.id]
          const correct = taskResults.filter((result) => result.correct).length
          return (
            <article key={option.id}>
              <img alt="" src={option.image} />
              <strong>{option.label}</strong>
              <span>{correct} correctas de {taskResults.length}</span>
            </article>
          )
        })}
      </div>
      <ActionButton onClick={resetGuide}>
        Volver al menú
      </ActionButton>
    </section>
  )
}
