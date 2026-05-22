import { useEffect, useMemo, useState } from 'react'

type BrowserWindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

type Stage = 'menu' | 'task1' | 'task2' | 'task3' | 'results'
type TaskKey = 'task1' | 'task2' | 'task3'
type Feedback = boolean | null

type TaskResult = {
  answer: string
  correct: boolean
  id: string
  label: string
  maxPoints: number
  points: number
  selected: string
}

type ResultsState = Record<TaskKey, TaskResult[]>
type FragmentSelection = { id: string; text: string }

const image = (name: string) => `/guia-lenguaje/images/${name}`

const task1Parts = [
  {
    image: image('teodoro-1.webp'),
    title: 'Las cartas de Teodoro',
    paragraphs: [
      'Todas las mañanas, Teodoro aparece por la vereda con su gran sonrisa de gato y grita “¡carteroooooooo!”. Su bolso está repleto de sobres con estampillas de colores. Los buzones de las casas abren grandes sus bocas para recibir las cartas de Teodoro.',
    ],
  },
  {
    image: image('teodoro-2.webp'),
    title: 'Todos esperan sus cartas',
    paragraphs: [
      'Todos en el barrio lo esperan ansiosos. Las gallinas salen apuradas por recibir noticias del gallo, que está de viaje.',
      'El perro grita desde su casa: —¡Teodoro, siempre me traes buenas noticias!',
      'La vaca le agradece en silencio, mirándolo con sus ojos largas pestañas. Los ratones esperan sobrecitos con olor a queso.',
      'Pero, a veces, algunos animales no reciben cartas. Teodoro nota la tristeza de sus vecinos y tiene una gran idea.',
    ],
  },
  {
    image: image('teodoro-3.webp'),
    title: 'Una gran idea',
    paragraphs: [
      'Teodoro, en su casa, se pone a escribir. Cartas y más cartas. Llenas de historias, recetas y consejos.',
      'Desde entonces, todos en el barrio reciben cartas: a veces de sus familias, a veces de sus amigos. Y cuando estas no llegan, reciben una carta de Teodoro, el gato cartero.',
    ],
  },
]

const task1Questions = [
  {
    id: 't1-q1',
    points: 2,
    skill: 'Interpretar y relacionar',
    question: '¿Cómo se sienten los animales del barrio cuando esperan las cartas que entrega Teodoro?',
    options: ['Afligidos.', 'Ansiosos.', 'Agradecidos.', 'Apenados.'],
    answer: 'Ansiosos.',
  },
  {
    id: 't1-q2',
    points: 2,
    skill: 'Interpretar y relacionar',
    question: 'Según el texto, ¿qué le sucedía a veces al señor caballo?',
    options: ['Se quedaba sin carta.', 'Le daban buenas noticias.', 'Recibía un sobre con olor a queso.', 'Le facilitaban buenas referencias.'],
    answer: 'Se quedaba sin carta.',
  },
  {
    id: 't1-q3',
    points: 1,
    skill: 'Interpretar y relacionar',
    question: '¿Quién agradece en silencio al recibir las cartas de Teodoro?',
    options: ['La gata.', 'La araña.', 'La gallina.', 'La vaca.'],
    answer: 'La vaca.',
  },
  {
    id: 't1-q4',
    points: 2,
    skill: 'Interpretar y relacionar',
    question: '¿A quiénes escribía cartas Teodoro?',
    options: ['A los animales que viajaran al extranjero.', 'A los animales que le agradecen.', 'A los animales que no reciben cartas.', 'A los animales que están de viaje.'],
    answer: 'A los animales que no reciben cartas.',
  },
]

const task2Image = image('bombero-1.webp')
const task2Text = [
  [
    { text: 'Ayer en la tarde se inició un foco de incendio en el cerro Caracol, en la ' },
    { text: 'ciudad de Concepción', strong: true },
    { text: ', en las proximidades del conjunto residencial Las Violetas.' },
  ],
  [
    { text: 'Tres compañías de bomberos acudieron a apagar el incendio. Fue necesario recurrir a un helicóptero de bomberos, que acarreó agua desde el río ' },
    { text: 'Bío-Bío', strong: true },
    { text: '.' },
  ],
  [
    { text: 'Sólo se logró apagar el incendio alrededor de las tres de la madrugada. Fueron destruidas ' },
    { text: '3 hectáreas de bosque nativo', strong: true },
    { text: '. Bomberos aún sigue ' },
    { text: 'preocupado', strong: true },
    { text: ' por el origen del incendio.' },
  ],
]

const task2Prompts = [
  {
    id: 't2-q1',
    question: '¿En qué lugar de Chile ocurre el incendio?',
    answer: ['En la', 'ciudad', 'de Concepción.'],
    fragments: ['En la', 'ciudad', 'de Concepción.', 'En el', 'cerro Caracol', 'río Bío-Bío', 'bosque nativo.'],
  },
  {
    id: 't2-q2',
    question: '¿Qué había provocado esta situación?',
    answer: ['Fueron destruidas', '3 hectáreas', 'de bosque nativo.'],
    fragments: ['Fueron destruidas', '3 hectáreas', 'de bosque nativo.', 'Tres compañías', 'apagaron', 'el incendio.', 'Las Violetas.'],
  },
  {
    id: 't2-q3',
    question: '¿Cómo se sentían los bomberos?',
    answer: ['Preocupación por lo', 'que le había sucedido', 'con el bosque nativo.'],
    fragments: ['Preocupación por lo', 'que le había sucedido', 'con el bosque nativo.', 'Alegría por lo', 'que llegó desde', 'el río Bío-Bío.', 'en la madrugada.'],
  },
]

const task3Questions = [
  {
    id: 't3-q1',
    story: 'Estaba muy cansado, había hecho dos exámenes y también había tenido clase de educación física. Sólo me apetecía llegar a la casa, comer y descansar un ratito. ¿De dónde vengo?',
    answer: 'De la escuela',
    options: [
      { text: 'Del gimnasio', image: image('cosa-1-1.webp') },
      { text: 'De la escuela', image: image('cosa-1-2.webp') },
      { text: 'De la plaza', image: image('cosa-1-3.webp') },
    ],
  },
  {
    id: 't3-q2',
    story: 'Quería llegar pronto a mi casa, la tarde estaba helada, corría viento y las hojas secas bailaban a mi alrededor. Por suerte, justo en ese momento pasó el autobús y me llevó. ¿En qué época del año ocurre este relato?',
    answer: 'Otoño',
    options: [
      { text: 'Otoño', image: image('cosa-2-1.webp') },
      { text: 'Primavera', image: image('cosa-2-2.webp') },
      { text: 'Invierno', image: image('cosa-2-3.webp') },
    ],
  },
  {
    id: 't3-q3',
    story: 'Cuando llegamos a casa no la encontraba por ningún lado. No podríamos abrir la puerta así que tuvimos que llamar al cerrajero. Cuando conseguimos entrar, vi que me la había dejado sobre la mesa. ¿Qué objeto estaba sobre la mesa?',
    answer: 'Las llaves',
    options: [
      { text: 'La billetera', image: image('cosa-3-1.webp') },
      { text: 'El monedero', image: image('cosa-3-2.webp') },
      { text: 'Las llaves', image: image('cosa-3-3.webp') },
    ],
  },
  {
    id: 't3-q4',
    story: 'Le dijo a papá que arreglarlo costaría sobre $2.000 porque había que ponerles un retrovisor nuevo e inflable a las ruedas. ¿Quién le dijo eso a papá?',
    answer: 'Un mecánico',
    options: [
      { text: 'Un constructor', image: image('cosa-4-1.webp') },
      { text: 'Un mecánico', image: image('cosa-4-2.webp') },
      { text: 'Un ingeniero', image: image('cosa-4-3.webp') },
    ],
  },
  {
    id: 't3-q5',
    story: 'Empecé a pedalear cada vez más fuerte así que iba muy rápido. Papá me dijo que tuviera cuidado, pero no le hice caso y me caí, menos mal que llevaba casco y no me pasó nada. ¿En qué estaba montado el personaje que relata la historia?',
    answer: 'En bicicleta',
    options: [
      { text: 'En patines', image: image('cosa-5-1.webp') },
      { text: 'En patineta', image: image('cosa-5-2.webp') },
      { text: 'En bicicleta', image: image('cosa-5-3.webp') },
    ],
  },
  {
    id: 't3-q6',
    story: 'Estamos en abril y mi cumpleaños será dentro de cuatro meses, ¿cuándo será mi cumpleaños?',
    answer: 'Agosto',
    options: [
      { text: 'Agosto', image: image('cosa-6-1.webp') },
      { text: 'Octubre', image: image('cosa-6-2.webp') },
      { text: 'Septiembre', image: image('cosa-6-3.webp') },
    ],
  },
]

const menuOptions = [
  { id: 'task1', title: 'Las cartas de Teodoro', label: 'Tarea 1', description: 'Lectura breve y preguntas de comprensión.', image: image('teodoro-1.webp') },
  { id: 'task2', title: 'Incendio en el cerro', label: 'Tarea 2', description: 'Construcción de respuestas con fragmentos.', image: task2Image },
  { id: 'task3', title: 'Fichas interrogativas', label: 'Tarea 3', description: 'Respuestas a partir de imágenes y situaciones.', image: image('cosa-1-2.webp') },
] as const

const emptyResults: ResultsState = { task1: [], task2: [], task3: [] }

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function playFeedbackSound(isCorrect: boolean) {
  const AudioContextClass =
    window.AudioContext ||
    (window as BrowserWindowWithWebkitAudio).webkitAudioContext
  if (!AudioContextClass) return

  const context = new AudioContextClass()
  const tones = isCorrect ? [523.25, 659.25, 783.99] : [220, 164.81]
  const now = context.currentTime

  tones.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = isCorrect ? 'sine' : 'triangle'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.001, now + index * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.16, now + index * 0.1 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.16)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now + index * 0.1)
    oscillator.stop(now + index * 0.1 + 0.18)
  })
}

function getTotals(results: ResultsState) {
  const all = [...results.task1, ...results.task2, ...results.task3]
  const correct = all.filter((result) => result.correct).length
  return { correct, incorrect: all.length - correct, total: all.length }
}

export default function GuiaLenguajeActivity() {
  const [stage, setStage] = useState<Stage>('menu')
  const [sequence, setSequence] = useState<TaskKey[]>([])
  const [results, setResults] = useState<ResultsState>(emptyResults)
  const [task1Mode, setTask1Mode] = useState<'reading' | 'quiz'>('reading')
  const [task1Part, setTask1Part] = useState(0)
  const [task1Question, setTask1Question] = useState(0)
  const [task1Selected, setTask1Selected] = useState('')
  const [task1Feedback, setTask1Feedback] = useState<Feedback>(null)
  const [task2Question, setTask2Question] = useState(0)
  const [task2Selected, setTask2Selected] = useState<FragmentSelection[]>([])
  const [task2Feedback, setTask2Feedback] = useState<Feedback>(null)
  const [task2Choices, setTask2Choices] = useState(() => task2Prompts.map((prompt) => shuffleArray(prompt.fragments)))
  const [task3Question, setTask3Question] = useState(0)
  const [task3Selected, setTask3Selected] = useState('')
  const [task3Feedback, setTask3Feedback] = useState<Feedback>(null)
  const totals = useMemo(() => getTotals(results), [results])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [stage, task1Mode, task1Part, task1Question, task2Question, task3Question])

  function resetGuide(nextStage: Stage = 'menu', nextSequence: TaskKey[] = []) {
    setStage(nextStage)
    setSequence(nextSequence)
    setResults({ task1: [], task2: [], task3: [] })
    setTask1Mode('reading')
    setTask1Part(0)
    setTask1Question(0)
    setTask1Selected('')
    setTask1Feedback(null)
    setTask2Question(0)
    setTask2Selected([])
    setTask2Feedback(null)
    setTask2Choices(task2Prompts.map((prompt) => shuffleArray(prompt.fragments)))
    setTask3Question(0)
    setTask3Selected('')
    setTask3Feedback(null)
  }

  function startGuide(selection: TaskKey | 'all') {
    const nextSequence: TaskKey[] = selection === 'all' ? ['task1', 'task2', 'task3'] : [selection]
    resetGuide(nextSequence[0], nextSequence)
  }

  function registerResult(task: TaskKey, result: TaskResult) {
    setResults((current) => ({ ...current, [task]: [...current[task], result] }))
  }

  function goNext(currentTask: TaskKey) {
    const index = sequence.indexOf(currentTask)
    const next = sequence[index + 1]
    setStage(next ?? 'results')
  }

  function goBackToGuideMenu() {
    resetGuide('menu', [])
  }

  function goBackToTaskOneReading() {
    setTask1Mode('reading')
    setTask1Part(task1Parts.length - 1)
    setTask1Question(0)
    setTask1Selected('')
    setTask1Feedback(null)
    setResults((current) => ({ ...current, task1: [] }))
  }

  const backButtonLabel = stage === 'task1' && task1Mode === 'quiz' ? '← Volver a la lectura' : '← Volver al menú'
  const backButtonAction = stage === 'task1' && task1Mode === 'quiz' ? goBackToTaskOneReading : goBackToGuideMenu

  if (stage === 'menu') {
    return (
      <section className="guide-original guide-original-menu">
        <div className="guide-original-copy">
          <span className="task-badge">Lenguaje</span>
          <h2>Elige una parte de la guía</h2>
          <p className="guide-original-help">
            Selecciona una tarea específica o trabaja la guía completa en secuencia.
          </p>
        </div>
        <div className="guide-original-grid">
          {menuOptions.map((option) => (
            <button className="guide-original-card" key={option.id} onClick={() => startGuide(option.id)} type="button">
              <span>{option.label}</span>
              <div className="guide-original-card-image">
                <img alt="" src={option.image} />
              </div>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
        <button className="primary-button guide-start-button" onClick={() => startGuide('all')} type="button">
          Hacer guía completa
        </button>
      </section>
    )
  }

  return (
    <section className="guide-original guide-original-workspace">
      <div className="activity-back-row">
        <button className="activity-back-pill" onClick={backButtonAction} type="button">
          {backButtonLabel}
        </button>
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
          setFeedback={setTask1Feedback}
          setMode={setTask1Mode}
          setPartIndex={setTask1Part}
          setQuestionIndex={setTask1Question}
          setSelected={setTask1Selected}
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
          setFeedback={setTask2Feedback}
          setQuestionIndex={setTask2Question}
          setSelected={setTask2Selected}
          onDone={() => goNext('task2')}
        />
      ) : null}
      {stage === 'task3' ? (
        <TaskThree
          feedback={task3Feedback}
          questionIndex={task3Question}
          registerResult={registerResult}
          selected={task3Selected}
          setFeedback={setTask3Feedback}
          setQuestionIndex={setTask3Question}
          setSelected={setTask3Selected}
          totals={totals}
          onDone={() => goNext('task3')}
        />
      ) : null}
      {stage === 'results' ? <ResultsScreen results={results} resetGuide={() => resetGuide()} /> : null}
    </section>
  )
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
        <div className="guide-original-score">
          <span>Aciertos</span>
          <strong>{totals.correct}/{totals.total}</strong>
        </div>
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
            <button
              className="primary-button"
              onClick={() => {
                if (props.partIndex < task1Parts.length - 1) props.setPartIndex(props.partIndex + 1)
                else props.setMode('quiz')
              }}
              type="button"
            >
              {props.partIndex < task1Parts.length - 1 ? 'Siguiente parte' : 'Responder'}
            </button>
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
      image={task1Parts[Math.min(props.questionIndex, task1Parts.length - 1)].image}
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
            {props.selected.length === 0 ? <span>...</span> : props.selected.map((fragment) => (
              <button
                disabled={props.feedback !== null}
                key={fragment.id}
                onClick={() => props.setSelected(props.selected.filter((item) => item.id !== fragment.id))}
                type="button"
              >
                {fragment.text}
              </button>
            ))}
          </div>
          <FeedbackBar correct={props.feedback} />
          <div className="guide-fragment-actions">
            {props.feedback === null ? (
              <button
                className="primary-button"
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
                type="button"
              >
                Confirmar
              </button>
            ) : (
              <button
                className="primary-button"
                onClick={() => {
                  if (props.questionIndex < task2Prompts.length - 1) {
                    props.setQuestionIndex(props.questionIndex + 1)
                    props.setSelected([])
                    props.setFeedback(null)
                  } else {
                    props.onDone()
                  }
                }}
                type="button"
              >
                Continuar
              </button>
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
  nextLabel: string
  onNext: () => void
  progress: string
  skill: string
  title: string
  totals: { correct: number; total: number }
}) {
  return (
    <section className={`guide-question-layout ${props.image ? '' : 'is-text-only'} ${props.feedback === false ? 'is-wrong' : props.feedback === true ? 'is-correct' : ''}`}>
      {props.image ? (
        <aside className="guide-question-image">
          <img alt="" src={props.image} />
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
        <FeedbackBar correct={props.feedback} />
        {props.feedback !== null ? (
          <div className="guide-question-actions">
            <button className="primary-button" onClick={props.onNext} type="button">
              {props.nextLabel}
            </button>
          </div>
        ) : null}
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
    <div className="guide-part-dots">
      {Array.from({ length: total }, (_, index) => (
        <span className={index === active ? 'is-active' : ''} key={index} />
      ))}
    </div>
  )
}

function FeedbackBar({ correct }: { correct: Feedback }) {
  if (correct === null) return null
  return (
    <div className={`guide-feedback ${correct ? 'is-correct' : 'is-wrong'}`}>
      {correct ? 'Muy bien, respuesta correcta.' : 'Revisa la respuesta correcta y continúa.'}
    </div>
  )
}

function ResultsScreen({ results, resetGuide }: { results: ResultsState; resetGuide: () => void }) {
  const totals = getTotals(results)
  return (
    <section className="guide-results">
      <span className="task-badge">Resultados</span>
      <h2>Guía terminada</h2>
      <p>Aciertos: {totals.correct} de {totals.total}</p>
      <div className="guide-results-grid">
        {menuOptions.map((option) => {
          const taskResults = results[option.id]
          const correct = taskResults.filter((result) => result.correct).length
          return (
            <article key={option.id}>
              <img alt="" src={option.image} />
              <strong>{option.label}</strong>
              <span>{correct}/{taskResults.length}</span>
            </article>
          )
        })}
      </div>
      <button className="primary-button" onClick={resetGuide} type="button">
        Volver al menú
      </button>
    </section>
  )
}
