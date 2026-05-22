import { Delete } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

type DifficultyKey = 'easy' | 'medium' | 'hard'
type Screen = 'menu' | 'playing' | 'summary'
type Feedback = 'correct' | 'wrong' | null

type Problem = {
  num1: number
  num2: number
  operator: '+' | '-'
  options: number[]
  result: number
}

type DifficultySettings = {
  bg: string
  body: string
  bodyReverse: string
  decos: string[]
  exercises: number
  head: string
  icon: string
  key: DifficultyKey
  label: string
  maxVal: number
  optionsCount: number
  primary: string
  secondary: string
  skipOnError: boolean
  tail: string
}

const asset = (name: string) => `/serpiente/assets/${name}`

const difficulties: Record<DifficultyKey, DifficultySettings> = {
  easy: {
    key: 'easy',
    label: 'Culebrita',
    exercises: 5,
    maxVal: 10,
    icon: '🐛',
    optionsCount: 3,
    skipOnError: false,
    primary: '#34a853',
    secondary: '#fbbc04',
    bg: '#e6f4ea',
    decos: ['🐛', '🌿', '🌻', '🍃'],
    tail: asset('culebra_tail.svg'),
    body: asset('culebra_body.svg'),
    bodyReverse: asset('culebra_body_reverse.svg'),
    head: asset('culebra_head.svg'),
  },
  medium: {
    key: 'medium',
    label: 'Boa',
    exercises: 12,
    maxVal: 20,
    icon: '🐍',
    optionsCount: 4,
    skipOnError: true,
    primary: '#4285f4',
    secondary: '#ea4335',
    bg: '#e8f0fe',
    decos: ['🐍', '☠️', '🏜️', '⚡'],
    tail: asset('boa_tail.svg'),
    body: asset('boa_body.svg'),
    bodyReverse: asset('boa_body_reverse.svg'),
    head: asset('boa_head.svg'),
  },
  hard: {
    key: 'hard',
    label: 'Dragón',
    exercises: 20,
    maxVal: 50,
    icon: '🐉',
    optionsCount: 4,
    skipOnError: true,
    primary: '#ea4335',
    secondary: '#34a853',
    bg: '#fce8e6',
    decos: ['🐲', '🔥', '⚔️', '🏰'],
    tail: asset('dragon_tail.svg'),
    body: asset('dragon_body.svg'),
    bodyReverse: asset('dragon_body_reverse.svg'),
    head: asset('dragon_head.svg'),
  },
}

const difficultyKeys: DifficultyKey[] = ['easy', 'medium', 'hard']

function makeStartNumber(settings: DifficultySettings) {
  return Math.floor(Math.random() * Math.max(settings.maxVal - 2, 1)) + 1
}

function generateProblem(startNumber: number | null, difficulty: DifficultyKey): Problem {
  const settings = difficulties[difficulty]
  const currentStart = startNumber ?? makeStartNumber(settings)
  const isAddition = Math.random() > 0.5
  let num2 = 0
  let operator: '+' | '-' = '+'
  let result = currentStart

  if (isAddition) {
    if (currentStart >= settings.maxVal) {
      operator = '-'
      num2 = Math.floor(Math.random() * Math.max(currentStart - 1, 1)) + 1
      result = currentStart - num2
    } else {
      operator = '+'
      num2 = Math.floor(Math.random() * (settings.maxVal - currentStart)) + 1
      result = currentStart + num2
    }
  } else if (currentStart <= 1) {
    operator = '+'
    num2 = Math.floor(Math.random() * (settings.maxVal - currentStart)) + 1
    result = currentStart + num2
  } else {
    operator = '-'
    num2 = Math.floor(Math.random() * currentStart)
    result = currentStart - num2
  }

  const options = new Set<number>([result])
  while (options.size < settings.optionsCount) {
    const fake = result + Math.floor(Math.random() * 5) - 2
    if (fake >= 0 && fake <= settings.maxVal && fake !== result) {
      options.add(fake)
    } else {
      options.add(Math.floor(Math.random() * (settings.maxVal + 1)))
    }
  }

  return {
    num1: currentStart,
    num2,
    operator,
    result,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  }
}

export default function SerpienteMatematicaActivity() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>('easy')
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyKey>('easy')
  const [snakeSegments, setSnakeSegments] = useState<number[]>([])
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [exerciseIndex, setExerciseIndex] = useState(0)

  function startGame() {
    const settings = difficulties[difficultyKey]
    const startNumber = makeStartNumber(settings)
    setActiveDifficulty(difficultyKey)
    setSnakeSegments([startNumber])
    setExerciseIndex(0)
    setFeedback(null)
    setCurrentProblem(generateProblem(startNumber, difficultyKey))
    setScreen('playing')
  }

  function returnToLevels() {
    setScreen('menu')
    setSnakeSegments([])
    setCurrentProblem(null)
    setFeedback(null)
    setExerciseIndex(0)
  }

  function handleAnswer(value: number) {
    if (!currentProblem || feedback) return
    const settings = difficulties[activeDifficulty]

    if (value === currentProblem.result) {
      setFeedback('correct')
      window.setTimeout(() => {
        setSnakeSegments((current) => [...current, value])
        const nextIndex = exerciseIndex + 1
        if (nextIndex >= settings.exercises) {
          setScreen('summary')
        } else {
          setExerciseIndex(nextIndex)
          setCurrentProblem(generateProblem(value, activeDifficulty))
          setFeedback(null)
        }
      }, 800)
      return
    }

    setFeedback('wrong')

    if (settings.skipOnError) {
      window.setTimeout(() => {
        const nextIndex = exerciseIndex + 1
        if (nextIndex >= settings.exercises) {
          setScreen('summary')
        } else {
          setExerciseIndex(nextIndex)
          setCurrentProblem(generateProblem(null, activeDifficulty))
          setFeedback(null)
        }
      }, 1200)
    } else {
      window.setTimeout(() => setFeedback(null), 500)
    }
  }

  const selectedSettings = screen === 'menu' ? difficulties[difficultyKey] : difficulties[activeDifficulty]

  return (
    <section
      className={`serpiente-original snake-theme-${selectedSettings.key}`}
      style={{
        '--snake-primary': selectedSettings.primary,
        '--snake-secondary': selectedSettings.secondary,
        '--snake-bg': selectedSettings.bg,
      } as CSSProperties}
    >
      <SnakeDecorations settings={selectedSettings} />
      {screen === 'menu' ? (
        <SnakeMenu selectedDifficulty={difficultyKey} setDifficulty={setDifficultyKey} onStart={startGame} />
      ) : null}
      {screen === 'playing' && currentProblem ? (
        <SnakeGame
          difficulty={activeDifficulty}
          exerciseIndex={exerciseIndex}
          feedback={feedback}
          onAnswer={handleAnswer}
          onExit={returnToLevels}
          problem={currentProblem}
          snake={snakeSegments}
        />
      ) : null}
      {screen === 'summary' ? (
        <SnakeSummary difficulty={activeDifficulty} onRestart={() => setScreen('menu')} snake={snakeSegments} />
      ) : null}
    </section>
  )
}

function SnakeDecorations({ settings }: { settings: DifficultySettings }) {
  return (
    <div className="snake-decorations" aria-hidden="true">
      {settings.decos.map((deco, index) => (
        <span className={`snake-decoration snake-decoration-${index + 1}`} key={`${settings.key}-${deco}`}>
          {deco}
        </span>
      ))}
    </div>
  )
}

function SnakeMenu({
  onStart,
  selectedDifficulty,
  setDifficulty,
}: {
  onStart: () => void
  selectedDifficulty: DifficultyKey
  setDifficulty: (difficulty: DifficultyKey) => void
}) {
  return (
    <div className="snake-menu-screen">
      <span className="task-badge">Cálculo mental</span>
      <h2>Serpiente Matemática</h2>
      <p>Elige tu serpiente para comenzar.</p>
      <div className="snake-difficulty-grid" role="radiogroup" aria-label="Nivel de dificultad">
        {difficultyKeys.map((key) => {
          const settings = difficulties[key]
          const selected = selectedDifficulty === key
          return (
            <button
              aria-checked={selected}
              className={`snake-difficulty-card ${selected ? 'is-selected' : ''}`}
              key={key}
              onClick={() => setDifficulty(key)}
              role="radio"
              style={{ '--snake-card-tone': settings.primary, '--snake-card-bg': settings.bg } as CSSProperties}
              type="button"
            >
              <span className="snake-difficulty-icon">{settings.icon}</span>
              <strong>{settings.label}</strong>
              <small>{settings.exercises} ejercicios</small>
              <small>Conteo hasta {settings.maxVal}</small>
            </button>
          )
        })}
      </div>
      <button className="primary-button snake-feed-button" onClick={onStart} type="button">
        ¡ALIMENTAR!
      </button>
    </div>
  )
}

function SnakeGame({
  difficulty,
  exerciseIndex,
  feedback,
  onAnswer,
  onExit,
  problem,
  snake,
}: {
  difficulty: DifficultyKey
  exerciseIndex: number
  feedback: Feedback
  onAnswer: (value: number) => void
  onExit: () => void
  problem: Problem
  snake: number[]
}) {
  const settings = difficulties[difficulty]
  const progress = (exerciseIndex / settings.exercises) * 100
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' })
  }, [snake])

  useEffect(() => setInputValue(''), [problem])

  function handleKeyInput(key: string) {
    if (feedback !== null) return

    if (key === 'backspace') {
      setInputValue((current) => current.slice(0, -1))
    } else if (key === 'enter') {
      if (inputValue !== '') onAnswer(Number.parseInt(inputValue, 10))
    } else {
      setInputValue((current) => (current.length < 3 ? current + key : current))
    }
  }

  useEffect(() => {
    if (difficulty !== 'hard' || feedback !== null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') handleKeyInput(event.key)
      else if (event.key === 'Backspace') handleKeyInput('backspace')
      else if (event.key === 'Enter') handleKeyInput('enter')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [difficulty, feedback, inputValue])

  return (
    <div className={`snake-game-screen snake-game-screen--${difficulty}`}>
      <header className="snake-game-topbar">
        <button className="snake-exit-button" onClick={onExit} type="button">
          ← Volver a niveles
        </button>
        <div>
          <span>Bocado {exerciseIndex + 1} de {settings.exercises}</span>
        </div>
      </header>

      <div className="snake-progress-line">
        <span style={{ width: `${progress}%` }} />
      </div>

      <article className={`snake-problem-card ${feedback === 'wrong' ? 'is-wrong' : ''} ${feedback === 'correct' ? 'is-correct' : ''}`}>
        <div className="snake-operation">
          <span>{problem.num1}</span>
          <span>{problem.operator}</span>
          <span>{problem.num2}</span>
          <span>=</span>
          <strong className={feedback === 'correct' ? 'is-correct-answer' : difficulty === 'hard' && inputValue !== '' ? 'has-input' : ''}>
            {feedback === 'correct' ? problem.result : difficulty === 'hard' && inputValue !== '' ? inputValue : '?'}
          </strong>
        </div>

        {difficulty !== 'hard' ? (
          <div className="snake-answer-grid" data-options={problem.options.length}>
            {problem.options.map((option) => {
              const isCorrect = option === problem.result
              return (
                <button
                  className={`${feedback === 'correct' && isCorrect ? 'is-correct' : ''} ${feedback === 'wrong' && isCorrect && !settings.skipOnError ? 'is-hint' : ''} ${feedback === 'wrong' && !isCorrect ? 'is-dimmed' : ''}`}
                  disabled={feedback !== null}
                  key={option}
                  onClick={() => onAnswer(option)}
                  type="button"
                >
                  {option}
                </button>
              )
            })}
          </div>
        ) : (
          <NumericKeypad feedback={feedback} inputValue={inputValue} onKeyInput={handleKeyInput} />
        )}
      </article>

      <div className="snake-segments-track" ref={scrollRef} aria-label="Tu serpiente">
        <div className="snake-track-label">Tu Serpiente</div>
        <img alt="" src={settings.tail} />
        {snake.map((value, index) => {
          const isHead = index === snake.length - 1
          return (
            <div className="snake-segment" key={`${value}-${index}`}>
              <img alt="" src={isHead ? settings.head : index % 2 === 0 ? settings.body : settings.bodyReverse} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NumericKeypad({
  feedback,
  inputValue,
  onKeyInput,
}: {
  feedback: Feedback
  inputValue: string
  onKeyInput: (key: string) => void
}) {
  return (
    <div className="snake-keypad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button disabled={feedback !== null} key={num} onClick={() => onKeyInput(num.toString())} type="button">
          {num}
        </button>
      ))}
      <button
        aria-label="Borrar"
        className="snake-keypad-delete"
        disabled={feedback !== null}
        onClick={() => onKeyInput('backspace')}
        title="Borrar"
        type="button"
      >
        <Delete aria-hidden="true" strokeWidth={3} />
      </button>
      <button disabled={feedback !== null} onClick={() => onKeyInput('0')} type="button">0</button>
      <button disabled={feedback !== null || inputValue === ''} onClick={() => onKeyInput('enter')} title="Aceptar" type="button">↵</button>
    </div>
  )
}

function SnakeSummary({
  difficulty,
  onRestart,
  snake,
}: {
  difficulty: DifficultyKey
  onRestart: () => void
  snake: number[]
}) {
  const settings = difficulties[difficulty]
  const totalLength = snake.length + 1

  return (
    <div className="snake-summary">
      <h2>¡Misión Cumplida!</h2>
      <p>Has alimentado muy bien a tu serpiente.</p>
      <div className="snake-summary-card">
        <div className="snake-summary-heading">
          <span>Resultado Final</span>
          <strong>📏 Largo: {totalLength} piezas</strong>
        </div>
        <div className="snake-summary-track" aria-label="Serpiente final">
          <img alt="" src={settings.tail} />
          {snake.map((value, index) => (
            <div className="snake-segment" key={`${value}-${index}`}>
              <img alt="" src={index === snake.length - 1 ? settings.head : index % 2 === 0 ? settings.body : settings.bodyReverse} />
            </div>
          ))}
        </div>
        <small>← Desliza para verla completa →</small>
      </div>
      <button className="primary-button" onClick={onRestart} type="button">
        Jugar otra vez
      </button>
    </div>
  )
}
