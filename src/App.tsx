import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  LoaderCircle,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import LecturaPiramideActivity from './activities/lectura-piramide/LecturaPiramideActivity'
import { LECTURA_PIRAMIDE_IMAGE_ASSETS } from './activities/lectura-piramide/data/imageUrls'
import GuiaLenguajeActivity from './activities/guia-lenguaje/GuiaLenguajeActivity'
import OperacionesTableroActivity from './activities/operaciones-tablero/OperacionesTableroActivity'
import SerpienteMatematicaActivity from './activities/serpiente/SerpienteMatematicaActivity'
import { activities, activityQuestions } from './data/activities'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import type { Activity, ActivityQuestion, DownloadRecord } from './types'
import { loadDownloads, saveDownloads } from './utils/storage'

type SnakeDifficultyKey = 'easy' | 'medium' | 'hard'
type GuideActivityKey = 'task1' | 'task2' | 'task3' | 'all'

type GuideActivityOption = {
  description: string
  image: string
  key: Exclude<GuideActivityKey, 'all'>
  label: string
  questions: ActivityQuestion[]
  title: string
}

const GUIDE_DEFAULT_TEXT = [
  'Lee con calma la información de apoyo y luego responde la pregunta.',
  'Puedes volver a mirar la imagen antes de elegir una alternativa.',
]

const GUIDE_ACTIVITY_OPTIONS: GuideActivityOption[] = [
  {
    key: 'task1',
    label: 'Tarea 1',
    title: 'Las cartas de Teodoro',
    description: 'Lectura breve y preguntas de comprensión.',
    image: '/guia-lenguaje/images/teodoro-1.webp',
    questions: [
      {
        badge: 'Tarea 1',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Las cartas de Teodoro',
        readingText: [
          'Teodoro reparte cartas por el barrio y todos esperan sus noticias con alegría.',
          'Cada carta trae una historia, una sorpresa o un mensaje importante para quien la recibe.',
        ],
        image: '/guia-lenguaje/images/teodoro-1.webp',
        prompt: '¿Qué lleva Teodoro en su bolso?',
        answer: 'Cartas para repartir',
        options: ['Cartas para repartir', 'Zapatos nuevos', 'Juguetes del colegio'],
      },
      {
        badge: 'Tarea 1',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Las cartas de Teodoro',
        readingText: [
          'Los vecinos miran por la ventana cuando Teodoro se acerca.',
          'Su visita anuncia que pronto recibirán un mensaje esperado.',
        ],
        image: '/guia-lenguaje/images/teodoro-2.webp',
        prompt: '¿Por qué los vecinos esperan a Teodoro?',
        answer: 'Porque trae mensajes',
        options: ['Porque trae mensajes', 'Porque vende comida', 'Porque arregla bicicletas'],
      },
      {
        badge: 'Tarea 1',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Las cartas de Teodoro',
        readingText: [
          'Cuando termina su recorrido, Teodoro se siente contento.',
          'Sabe que ayudó a que las noticias llegaran a su destino.',
        ],
        image: '/guia-lenguaje/images/teodoro-3.webp',
        prompt: '¿Cómo se siente Teodoro al terminar su trabajo?',
        answer: 'Contento',
        options: ['Contento', 'Enojado', 'Dormido'],
      },
    ],
  },
  {
    key: 'task2',
    label: 'Tarea 2',
    title: 'Incendio en el cerro',
    description: 'Comprensión con pistas del texto informativo.',
    image: '/guia-lenguaje/images/bombero-1.webp',
    questions: [
      {
        badge: 'Tarea 2',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Incendio en el cerro Caracol',
        readingText: [
          'Tres compañías de bomberos acudieron a apagar el incendio.',
          'Fue necesario recurrir a un helicóptero que acarreó agua desde el río Bío-Bío.',
        ],
        image: '/guia-lenguaje/images/bombero-1.webp',
        prompt: '¿Quiénes acudieron a apagar el incendio?',
        answer: 'Tres compañías de bomberos',
        options: ['Tres compañías de bomberos', 'Un grupo de estudiantes', 'Los vecinos solos'],
      },
      {
        badge: 'Tarea 2',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Incendio en el cerro Caracol',
        readingText: [
          'El incendio avanzaba por el cerro y se necesitó apoyo desde el aire.',
          'El helicóptero transportó agua para ayudar a controlar el fuego.',
        ],
        image: '/guia-lenguaje/images/bombero-1.webp',
        prompt: '¿Qué vehículo ayudó desde el aire?',
        answer: 'Un helicóptero',
        options: ['Un helicóptero', 'Un tren', 'Una bicicleta'],
      },
      {
        badge: 'Tarea 2',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Incendio en el cerro Caracol',
        readingText: [
          'Los bomberos trabajaron durante varias horas para controlar la emergencia.',
          'El esfuerzo permitió proteger el sector afectado.',
        ],
        image: '/guia-lenguaje/images/bombero-1.webp',
        prompt: '¿Qué hicieron los bomberos durante varias horas?',
        answer: 'Trabajaron para controlar la emergencia',
        options: ['Trabajaron para controlar la emergencia', 'Descansaron en la plaza', 'Pintaron una escuela'],
      },
    ],
  },
  {
    key: 'task3',
    label: 'Tarea 3',
    title: 'Fichas interrogativas',
    description: 'Respuestas a partir de imágenes y situaciones.',
    image: '/guia-lenguaje/images/cosa-1-2.webp',
    questions: [
      {
        badge: 'Tarea 3',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Fichas interrogativas',
        readingText: ['Observa las opciones y responde según la información de la ficha.'],
        image: '/guia-lenguaje/images/cosa-1-2.webp',
        prompt: '¿De dónde vienen los niños?',
        answer: 'De la escuela',
        options: ['Del gimnasio', 'De la escuela', 'De la plaza'],
      },
      {
        badge: 'Tarea 3',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Fichas interrogativas',
        readingText: ['Mira la imagen y elige la estación que corresponde.'],
        image: '/guia-lenguaje/images/cosa-2-1.webp',
        prompt: '¿En qué estación ocurre la escena?',
        answer: 'Otoño',
        options: ['Otoño', 'Primavera', 'Invierno'],
      },
      {
        badge: 'Tarea 3',
        skill: 'Interpretar y relacionar',
        readingTitle: 'Fichas interrogativas',
        readingText: ['Observa la situación y responde qué objeto se perdió.'],
        image: '/guia-lenguaje/images/cosa-3-3.webp',
        prompt: '¿Qué objeto se perdió?',
        answer: 'Las llaves',
        options: ['La billetera', 'El monedero', 'Las llaves'],
      },
    ],
  },
]

function getGuideQuestions(selection: GuideActivityKey | null) {
  if (selection === 'all') {
    return GUIDE_ACTIVITY_OPTIONS.flatMap((option) => option.questions)
  }

  return GUIDE_ACTIVITY_OPTIONS.find((option) => option.key === selection)?.questions ?? []
}

type SnakeDifficulty = {
  body: string
  bodyReverse: string
  exercises: number
  head: string
  icon: string
  key: SnakeDifficultyKey
  label: string
  maxVal: number
  optionsCount: number
  rangeLabel: string
  tail: string
  tone: string
}

const SNAKE_DIFFICULTIES: SnakeDifficulty[] = [
  {
    key: 'easy',
    label: 'Culebrita',
    icon: '1',
    exercises: 8,
    maxVal: 10,
    optionsCount: 3,
    rangeLabel: 'Conteo hasta 10',
    tone: '#34a853',
    tail: '/serpiente/assets/culebra_tail.svg',
    body: '/serpiente/assets/culebra_body.svg',
    bodyReverse: '/serpiente/assets/culebra_body_reverse.svg',
    head: '/serpiente/assets/culebra_head.svg',
  },
  {
    key: 'medium',
    label: 'Boa',
    icon: '2',
    exercises: 12,
    maxVal: 20,
    optionsCount: 4,
    rangeLabel: 'Conteo hasta 20',
    tone: '#4285f4',
    tail: '/serpiente/assets/boa_tail.svg',
    body: '/serpiente/assets/boa_body.svg',
    bodyReverse: '/serpiente/assets/boa_body_reverse.svg',
    head: '/serpiente/assets/boa_head.svg',
  },
  {
    key: 'hard',
    label: 'Dragón',
    icon: '3',
    exercises: 20,
    maxVal: 50,
    optionsCount: 4,
    rangeLabel: 'Conteo hasta 50',
    tone: '#ea4335',
    tail: '/serpiente/assets/dragon_tail.svg',
    body: '/serpiente/assets/dragon_body.svg',
    bodyReverse: '/serpiente/assets/dragon_body_reverse.svg',
    head: '/serpiente/assets/dragon_head.svg',
  },
]

function getSnakeDifficulty(key: SnakeDifficultyKey) {
  return SNAKE_DIFFICULTIES.find((difficulty) => difficulty.key === key) ?? SNAKE_DIFFICULTIES[0]
}

function generateSnakeQuestions(difficulty: SnakeDifficulty): ActivityQuestion[] {
  let current = Math.floor(Math.random() * Math.max(difficulty.maxVal - 2, 1)) + 1

  return Array.from({ length: difficulty.exercises }, () => {
    const shouldAdd = Math.random() > 0.5
    let num2 = 0
    let operator = '+'
    let result = current

    if (shouldAdd && current < difficulty.maxVal) {
      operator = '+'
      num2 = Math.floor(Math.random() * (difficulty.maxVal - current)) + 1
      result = current + num2
    } else if (current > 1) {
      operator = '-'
      num2 = Math.floor(Math.random() * current)
      result = current - num2
    } else {
      operator = '+'
      num2 = Math.floor(Math.random() * (difficulty.maxVal - current)) + 1
      result = current + num2
    }

    const options = new Set<number>([result])
    while (options.size < difficulty.optionsCount) {
      const nearby = result + Math.floor(Math.random() * 5) - 2
      if (nearby >= 0 && nearby <= difficulty.maxVal && nearby !== result) {
        options.add(nearby)
      } else {
        options.add(Math.floor(Math.random() * (difficulty.maxVal + 1)))
      }
    }

    current = result

    return {
      prompt: `Resuelve: ${operator === '+' ? current - num2 : current + num2} ${operator} ${num2}`,
      answer: String(result),
      options: Array.from(options)
        .sort(() => Math.random() - 0.5)
        .map(String),
    }
  })
}

const GUIA_IMAGE_ASSETS = [
  '/guia-lenguaje/images/bombero-1.webp',
  '/guia-lenguaje/images/cosa-1-1.webp',
  '/guia-lenguaje/images/cosa-1-2.webp',
  '/guia-lenguaje/images/cosa-1-3.webp',
  '/guia-lenguaje/images/cosa-2-1.webp',
  '/guia-lenguaje/images/cosa-2-2.webp',
  '/guia-lenguaje/images/cosa-2-3.webp',
  '/guia-lenguaje/images/cosa-3-1.webp',
  '/guia-lenguaje/images/cosa-3-2.webp',
  '/guia-lenguaje/images/cosa-3-3.webp',
  '/guia-lenguaje/images/cosa-4-1.webp',
  '/guia-lenguaje/images/cosa-4-2.webp',
  '/guia-lenguaje/images/cosa-4-3.webp',
  '/guia-lenguaje/images/cosa-5-1.webp',
  '/guia-lenguaje/images/cosa-5-2.webp',
  '/guia-lenguaje/images/cosa-5-3.webp',
  '/guia-lenguaje/images/cosa-6-1.webp',
  '/guia-lenguaje/images/cosa-6-2.webp',
  '/guia-lenguaje/images/cosa-6-3.webp',
  '/guia-lenguaje/images/teodoro-1.webp',
  '/guia-lenguaje/images/teodoro-2.webp',
  '/guia-lenguaje/images/teodoro-3.webp',
]

const SERPIENTE_ASSETS = [
  '/serpiente/assets/boa_body.svg',
  '/serpiente/assets/boa_body_reverse.svg',
  '/serpiente/assets/boa_head.svg',
  '/serpiente/assets/boa_tail.svg',
  '/serpiente/assets/culebra_body.svg',
  '/serpiente/assets/culebra_body_reverse.svg',
  '/serpiente/assets/culebra_head.svg',
  '/serpiente/assets/culebra_tail.svg',
  '/serpiente/assets/dragon_body.svg',
  '/serpiente/assets/dragon_body_reverse.svg',
  '/serpiente/assets/dragon_head.svg',
  '/serpiente/assets/dragon_tail.svg',
]

const activityAssets: Record<string, string[]> = {
  'lectura-piramide': ['/', ...LECTURA_PIRAMIDE_IMAGE_ASSETS],
  'guia-lenguaje': ['/', ...GUIA_IMAGE_ASSETS],
  'serpiente-matematica': ['/', ...SERPIENTE_ASSETS],
  'operaciones-tablero': ['/'],
}

function App() {
  const isOnline = useOnlineStatus()
  const [selectedId, setSelectedId] = useState<string | null>(() => getActivityIdFromHash())
  const [downloads, setDownloads] = useState(() => loadDownloads(activities))

  useEffect(() => saveDownloads(downloads), [downloads])
  useEffect(() => {
    const syncFromHash = () => setSelectedId(getActivityIdFromHash())

    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const selectedActivity = activities.find((activity) => activity.id === selectedId) ?? null

  function updateDownload(activity: Activity, next: Partial<DownloadRecord>) {
    setDownloads((current) => ({
      ...current,
      [activity.id]: {
        ...current[activity.id],
        ...next,
      },
    }))
  }

  function downloadActivity(activity: Activity) {
    updateDownload(activity, { state: 'downloading' })

    navigator.serviceWorker?.controller?.postMessage({
      type: 'CACHE_ACTIVITY',
      activityId: activity.id,
      assets: activityAssets[activity.id] ?? ['/'],
    })

    window.setTimeout(() => {
      updateDownload(activity, {
        downloadedAt: new Date().toISOString(),
        downloadedVersion: activity.version,
        state: 'downloaded',
      })
    }, 900)
  }

  if (selectedActivity) {
    return (
      <ActivityView
        activity={selectedActivity}
        download={downloads[selectedActivity.id]}
        isOnline={isOnline}
        onBack={() => navigateHome()}
        onDownload={() => downloadActivity(selectedActivity)}
      />
    )
  }

  return (
    <main className="app-shell">
      <Header isOnline={isOnline} />
      <section className="intro-section" aria-labelledby="page-title">
        <div>
          <p className="section-label">Portal educativo</p>
          <h1 id="page-title">Aula de Actividades</h1>
          <p className="intro-copy">
            Actividades listas para trabajar en vivo, con descarga para usarlas sin conexión.
          </p>
        </div>
        <div className="summary-strip" aria-label="Resumen del portal">
          <SummaryItem label="Actividades" value={activities.length.toString()} />
          <SummaryItem label="Descargadas" value={countDownloaded(downloads).toString()} />
        </div>
      </section>

      <ActivitySection
        area="Lenguaje"
        downloads={downloads}
        onDownload={downloadActivity}
        onOpen={navigateToActivity}
      />
      <ActivitySection
        area="Matemática"
        downloads={downloads}
        onDownload={downloadActivity}
        onOpen={navigateToActivity}
      />
    </main>
  )
}

function getActivityIdFromHash() {
  const match = window.location.hash.match(/^#\/actividad\/([a-z0-9-]+)$/)
  const candidate = match?.[1] ?? null

  return activities.some((activity) => activity.id === candidate) ? candidate : null
}

function navigateToActivity(activityId: string) {
  window.location.hash = `/actividad/${activityId}`
}

function navigateHome() {
  window.location.hash = '/'
}

type HeaderProps = {
  isOnline: boolean
}

function Header({ isOnline }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand-mark" aria-hidden="true">
        A
      </div>
      <div>
        <strong>Aula de Actividades</strong>
        <span>Prototipo local</span>
      </div>
      <div className={`connection-badge ${isOnline ? 'is-online' : 'is-offline'}`}>
        {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        {isOnline ? 'Con conexión' : 'Sin conexión'}
      </div>
    </header>
  )
}

type SummaryItemProps = {
  label: string
  value: string
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type ActivitySectionProps = {
  area: Activity['area']
  downloads: Record<string, DownloadRecord>
  onDownload: (activity: Activity) => void
  onOpen: (activityId: string) => void
}

function ActivitySection({ area, downloads, onDownload, onOpen }: ActivitySectionProps) {
  const sectionActivities = activities.filter((activity) => activity.area === area)

  return (
    <section className="activity-section" aria-labelledby={`section-${area}`}>
      <div className="section-heading">
        <p className="section-label">Sección</p>
        <h2 id={`section-${area}`}>{area}</h2>
      </div>
      <div className="activity-grid">
        {sectionActivities.map((activity) => (
          <ActivityCard
            activity={activity}
            download={downloads[activity.id]}
            key={activity.id}
            onDownload={() => onDownload(activity)}
            onOpen={() => onOpen(activity.id)}
          />
        ))}
      </div>
    </section>
  )
}

type ActivityCardProps = {
  activity: Activity
  download: DownloadRecord
  onDownload: () => void
  onOpen: () => void
}

function ActivityCard({ activity, download, onDownload, onOpen }: ActivityCardProps) {
  const needsUpdate =
    download.downloadedVersion !== null && download.downloadedVersion !== activity.version

  return (
    <article className={`activity-card activity-card--${activity.area.toLowerCase()}`}>
      <div className="card-topline">
        <span>{activity.level}</span>
        {needsUpdate ? (
          <span className="update-flag" title="Hay una versión más nueva">
            <AlertTriangle size={16} />
            Actualizar
          </span>
        ) : null}
      </div>
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
      <div className="card-actions">
        <button className="primary-button" onClick={onOpen} type="button">
          Abrir
        </button>
        <span className="version-chip" aria-label={`Versión ${activity.version}`}>
          v{activity.version}
        </span>
        <DownloadButton download={download} onDownload={onDownload} />
      </div>
    </article>
  )
}

function DownloadButton({
  download,
  onDownload,
}: {
  download: DownloadRecord
  onDownload: () => void
}) {
  if (download.state === 'downloading') {
    return (
      <button className="secondary-button" disabled type="button">
        <LoaderCircle className="spin" size={17} />
        Descargando
      </button>
    )
  }

  if (download.state === 'downloaded') {
    return (
      <button className="secondary-button is-downloaded" onClick={onDownload} type="button">
        <CheckCircle2 size={17} />
        Descargada
      </button>
    )
  }

  return (
    <button className="secondary-button" onClick={onDownload} type="button">
      <Download size={17} />
      Descargar
    </button>
  )
}

type ActivityViewProps = {
  activity: Activity
  download: DownloadRecord
  isOnline: boolean
  onBack: () => void
  onDownload: () => void
}

function ActivityView({ activity, download, isOnline, onBack, onDownload }: ActivityViewProps) {
  const isGuide = activity.id === 'guia-lenguaje'
  const isSnake = activity.id === 'serpiente-matematica'
  const isBoardGame = activity.id === 'operaciones-tablero'
  const [guideSelection, setGuideSelection] = useState<GuideActivityKey | null>(null)
  const [snakeDifficultyKey, setSnakeDifficultyKey] = useState<SnakeDifficultyKey>('easy')
  const [snakeQuestions, setSnakeQuestions] = useState<ActivityQuestion[] | null>(null)
  const snakeDifficulty = getSnakeDifficulty(snakeDifficultyKey)
  const questions = isGuide
    ? getGuideQuestions(guideSelection)
    : isSnake
      ? (snakeQuestions ?? [])
      : (activityQuestions[activity.id] ?? [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const canUseOffline = isOnline || download.state === 'downloaded'
  const areaClass = activity.area === 'Lenguaje' ? 'language' : 'math'

  useEffect(() => {
    setCurrentIndex(0)
    setCorrect(0)
    setSelected(null)
    setCompleted(false)
    setGuideSelection(null)
    setSnakeDifficultyKey('easy')
    setSnakeQuestions(null)
  }, [activity.id])

  function startGuideActivity(selection: GuideActivityKey) {
    setGuideSelection(selection)
    setCurrentIndex(0)
    setCorrect(0)
    setSelected(null)
    setCompleted(false)
  }

  function startSnakeActivity() {
    setSnakeQuestions(generateSnakeQuestions(snakeDifficulty))
    setCurrentIndex(0)
    setCorrect(0)
    setSelected(null)
    setCompleted(false)
  }

  function chooseOption(option: string) {
    if (selected || completed) {
      return
    }

    const currentQuestion = questions[currentIndex]
    const isCorrect = option === currentQuestion.answer
    const nextCorrect = isCorrect ? correct + 1 : correct

    setSelected(option)
    setCorrect(nextCorrect)

    window.setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        setCompleted(true)
        return
      }

      setCurrentIndex((index) => index + 1)
      setSelected(null)
    }, 650)
  }

  function restartActivity() {
    setCurrentIndex(0)
    setCorrect(0)
    setSelected(null)
    setCompleted(false)
  }

  return (
    <main className={`app-shell activity-view activity-view--${areaClass}`}>
      <header className="activity-header">
        <div className="activity-title-block">
          <h1>{activity.title}</h1>
        </div>
        <div className="activity-header-actions">
          <span className="activity-area-label">{activity.area}</span>
          <DownloadButton download={download} onDownload={onDownload} />
          <button className="back-button" onClick={onBack} type="button">
            <ArrowLeft size={19} />
            Inicio
          </button>
        </div>
      </header>

      {!canUseOffline ? (
        <section className="activity-panel">
          <AlertTriangle size={28} />
          <h2>Actividad no descargada</h2>
          <p>Conéctate o descarga esta actividad antes de usarla sin internet.</p>
        </section>
      ) : activity.id === 'lectura-piramide' ? (
        <section className="activity-stage activity-stage--lectura">
          <LecturaPiramideActivity />
        </section>
      ) : activity.id === 'guia-lenguaje' ? (
        <GuiaLenguajeActivity />
      ) : activity.id === 'serpiente-matematica' ? (
        <SerpienteMatematicaActivity />
      ) : isBoardGame ? (
        <OperacionesTableroActivity />
      ) : isGuide && !guideSelection ? (
        <GuideActivityMenu onStart={startGuideActivity} />
      ) : isSnake && !snakeQuestions ? (
        <SnakeDifficultyMenu
          difficultyKey={snakeDifficultyKey}
          onChange={setSnakeDifficultyKey}
          onStart={startSnakeActivity}
        />
      ) : (
        <QuestionActivity
          activity={activity}
          completed={completed}
          correct={correct}
          currentIndex={currentIndex}
          onBack={onBack}
          onChoose={chooseOption}
          onRestart={restartActivity}
          questions={questions}
          selected={selected}
          snakeDifficulty={isSnake ? snakeDifficulty : null}
        />
      )}
    </main>
  )
}

type QuestionActivityProps = {
  activity: Activity
  completed: boolean
  correct: number
  currentIndex: number
  onBack: () => void
  onChoose: (option: string) => void
  onRestart: () => void
  questions: ActivityQuestion[]
  selected: string | null
  snakeDifficulty: SnakeDifficulty | null
}

function QuestionActivity({
  activity,
  completed,
  correct,
  currentIndex,
  onBack,
  onChoose,
  onRestart,
  questions,
  selected,
  snakeDifficulty,
}: QuestionActivityProps) {
  const currentQuestion = questions[currentIndex]
  const isGuide = activity.id === 'guia-lenguaje'

  if (!currentQuestion) {
    return (
      <section className="activity-panel">
        <h2>Actividad sin preguntas</h2>
        <p>Falta migrar el contenido de esta actividad.</p>
      </section>
    )
  }

  if (completed) {
    return (
      <section className={`reference-result ${isGuide ? 'reference-result--guide' : 'reference-result--math'}`}>
        <CheckCircle2 size={42} />
        <h2>Actividad completa</h2>
        <p>
          Aciertos: {correct} de {questions.length}
        </p>
        <div className="result-actions">
          <button className="primary-button" onClick={onRestart} type="button">
            Repetir actividad
          </button>
          <button className="secondary-button" onClick={onBack} type="button">
            Volver al menú
          </button>
        </div>
      </section>
    )
  }

  return isGuide ? (
    <GuideQuestionActivity
      currentIndex={currentIndex}
      currentQuestion={currentQuestion}
      questions={questions}
      selected={selected}
      onChoose={onChoose}
    />
  ) : (
    <SnakeQuestionActivity
      correct={correct}
      currentIndex={currentIndex}
      currentQuestion={currentQuestion}
      difficulty={snakeDifficulty ?? SNAKE_DIFFICULTIES[0]}
      questions={questions}
      selected={selected}
      onChoose={onChoose}
    />
  )
}

function GuideActivityMenu({ onStart }: { onStart: (selection: GuideActivityKey) => void }) {
  return (
    <section className="guide-menu">
      <div className="guide-menu-copy">
        <span className="task-badge">Lenguaje</span>
        <h2>Elige una parte de la guía</h2>
        <p>Selecciona una tarea específica o trabaja la guía completa en secuencia.</p>
      </div>

      <div className="guide-menu-grid" aria-label="Opciones de guía">
        {GUIDE_ACTIVITY_OPTIONS.map((option) => (
          <button className="guide-menu-card" key={option.key} onClick={() => onStart(option.key)} type="button">
            <span>{option.label}</span>
            <div className="guide-menu-image">
              <img alt="" src={option.image} />
            </div>
            <strong>{option.title}</strong>
            <small>{option.description}</small>
          </button>
        ))}
      </div>

      <button className="primary-button guide-start-button" onClick={() => onStart('all')} type="button">
        Hacer guía completa
      </button>
    </section>
  )
}

function GuideQuestionActivity({
  currentIndex,
  currentQuestion,
  onChoose,
  questions,
  selected,
}: {
  currentIndex: number
  currentQuestion: ActivityQuestion
  onChoose: (option: string) => void
  questions: ActivityQuestion[]
  selected: string | null
}) {
  const readingText = currentQuestion.readingText ?? GUIDE_DEFAULT_TEXT
  const readingTitle = currentQuestion.readingTitle ?? 'Guía de Lenguaje'
  const image = currentQuestion.image ?? '/guia-lenguaje/images/teodoro-1.webp'
  const badge = currentQuestion.badge ?? 'Lenguaje'

  return (
    <section className="reference-workspace reference-workspace--guide">
      <aside className="guide-reading-card">
        <div className="guide-card-head">
          <span>{badge}</span>
          <strong>{readingTitle}</strong>
        </div>
        <div className="guide-image-frame">
          <img src={image} alt="" />
        </div>
        <div className="guide-reading-text">
          {readingText.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </aside>

      <article className="guide-question-card">
        <div className="task-badge">{badge}</div>
        <span className="question-count">
          Pregunta {currentIndex + 1}/{questions.length}
        </span>
        {currentQuestion.skill ? <p className="guide-skill">{currentQuestion.skill}</p> : null}
        <h2>{currentQuestion.prompt}</h2>
        <OptionButtons
          answer={currentQuestion.answer}
          onChoose={onChoose}
          options={currentQuestion.options}
          selected={selected}
        />
      </article>
    </section>
  )
}

function SnakeDifficultyMenu({
  difficultyKey,
  onChange,
  onStart,
}: {
  difficultyKey: SnakeDifficultyKey
  onChange: (key: SnakeDifficultyKey) => void
  onStart: () => void
}) {
  return (
    <section className="snake-level-menu">
      <div className="snake-level-copy">
        <span className="task-badge">Cálculo mental</span>
        <h2>Elige tu nivel de serpiente</h2>
        <p>Selecciona la dificultad antes de comenzar la actividad.</p>
      </div>

      <div className="snake-level-grid" role="radiogroup" aria-label="Nivel de dificultad">
        {SNAKE_DIFFICULTIES.map((difficulty) => {
          const isSelected = difficulty.key === difficultyKey

          return (
            <button
              aria-checked={isSelected}
              className={`snake-level-card ${isSelected ? 'is-selected' : ''}`}
              key={difficulty.key}
              onClick={() => onChange(difficulty.key)}
              role="radio"
              style={{ '--snake-tone': difficulty.tone } as CSSProperties}
              type="button"
            >
              <span className="snake-level-number">{difficulty.icon}</span>
              <img alt="" className="snake-level-sprite" src={difficulty.head} />
              <strong>{difficulty.label}</strong>
              <span>{difficulty.exercises} ejercicios</span>
              <small>{difficulty.rangeLabel}</small>
            </button>
          )
        })}
      </div>

      <button className="primary-button snake-start-button" onClick={onStart} type="button">
        Alimentar
      </button>
    </section>
  )
}

function SnakeQuestionActivity({
  correct,
  currentIndex,
  currentQuestion,
  difficulty,
  onChoose,
  questions,
  selected,
}: {
  correct: number
  currentIndex: number
  currentQuestion: ActivityQuestion
  difficulty: SnakeDifficulty
  onChoose: (option: string) => void
  questions: ActivityQuestion[]
  selected: string | null
}) {
  return (
    <section className="reference-workspace reference-workspace--snake">
      <aside className="snake-mission-card">
        <div className="snake-topline">
          <span>Misión de cálculo</span>
          <strong>
            {correct}/{questions.length}
          </strong>
        </div>
        <div className="snake-operation-card">
          <span>{currentQuestion.prompt.replace('Resuelve: ', '')}</span>
          <div>?</div>
        </div>
        <div className="snake-progress">
          <span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
        <div className="snake-track" aria-label="Serpiente de avance">
          <img src={difficulty.tail} alt="" />
          <img src={difficulty.body} alt="" />
          <img src={difficulty.bodyReverse} alt="" />
          <img src={difficulty.head} alt="" />
        </div>
      </aside>

      <article className="snake-question-card">
        <div className="task-badge">{difficulty.label}</div>
        <span className="question-count">
          Pregunta {currentIndex + 1}/{questions.length}
        </span>
        <h2>Elige el resultado correcto.</h2>
        <OptionButtons
          answer={currentQuestion.answer}
          onChoose={onChoose}
          options={currentQuestion.options}
          selected={selected}
        />
      </article>
    </section>
  )
}

function OptionButtons({
  answer,
  onChoose,
  options,
  selected,
}: {
  answer: string
  onChoose: (option: string) => void
  options: string[]
  selected: string | null
}) {
  return (
    <div className="options-list">
      {options.map((option) => {
        const isSelected = selected === option
        const isCorrect = option === answer

        return (
          <button
            className={[
              'option-button',
              selected && isCorrect ? 'is-correct' : '',
              isSelected && !isCorrect ? 'is-wrong' : '',
            ].join(' ')}
            disabled={Boolean(selected)}
            key={option}
            onClick={() => onChoose(option)}
            type="button"
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function countDownloaded(downloads: Record<string, DownloadRecord>) {
  return Object.values(downloads).filter((download) => download.state === 'downloaded').length
}

export default App
