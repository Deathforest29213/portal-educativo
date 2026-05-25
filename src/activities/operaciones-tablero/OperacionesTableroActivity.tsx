import { useMemo, useState, type CSSProperties } from 'react'

type DifficultyKey = 'easy' | 'medium' | 'hard' | 'expert'
type Operation = '+' | '-' | 'x' | '/'
type Shape = 'circle' | 'star' | 'heart' | 'triangle' | 'diamond'
type Screen = 'setup' | 'playing' | 'finished'
type Feedback = 'correct' | 'wrong' | null

type Difficulty = {
  key: DifficultyKey
  label: string
  maxNumber: number
  operations: Operation[]
  tone: string
}

type Player = {
  color: string
  id: string
  name: string
  score: number
  shape: Shape
}

type ClaimedCell = {
  playerId: string
  shape: Shape
  color: string
}

type Roll = {
  row: number
  col: number
  operation: Operation
  answer: number
  prompt: string
}

const DIFFICULTIES: Difficulty[] = [
  { key: 'easy', label: 'Fácil', maxNumber: 3, operations: ['+'], tone: '#34a853' },
  { key: 'medium', label: 'Medio', maxNumber: 5, operations: ['+', '-'], tone: '#4285f4' },
  { key: 'hard', label: 'Difícil', maxNumber: 7, operations: ['+', '-', 'x'], tone: '#fbbc04' },
  { key: 'expert', label: 'Experto', maxNumber: 9, operations: ['+', '-', 'x', '/'], tone: '#ea4335' },
]

const PLAYER_NAMES = [
  'Sofi',
  'Tomas',
  'Martina',
  'Diego',
  'Emilia',
  'Lucas',
  'Antonia',
  'Mateo',
  'Jose',
  'Florencia',
  'Vicente',
  'Isidora',
  'Agustin',
  'Renata',
  'Benjamin',
]

const PLAYER_COLORS = ['#4285f4', '#ea4335', '#34a853', '#fbbc04', '#9c27b0']
const PLAYER_SHAPES: Shape[] = ['circle', 'star', 'heart', 'triangle', 'diamond']

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function makePlayers(count: number): Player[] {
  const names = shuffle(PLAYER_NAMES)
  const colors = shuffle(PLAYER_COLORS)
  const shapes = shuffle(PLAYER_SHAPES)

  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: names[index],
    color: colors[index],
    shape: shapes[index],
    score: 0,
  }))
}

function getDifficulty(key: DifficultyKey) {
  return DIFFICULTIES.find((difficulty) => difficulty.key === key) ?? DIFFICULTIES[0]
}

function cellKey(row: number, col: number) {
  return `${row}-${col}`
}

function lineKey(playerId: string, cells: string[]) {
  return `${playerId}:${cells.join('|')}`
}

function getProblem(row: number, col: number, operation: Operation): Roll {
  if (operation === '+') {
    return { row, col, operation, answer: row + col, prompt: `${row} + ${col}` }
  }

  if (operation === '-') {
    return { row, col, operation, answer: row - col, prompt: `${row} - ${col}` }
  }

  if (operation === 'x') {
    return { row, col, operation, answer: row * col, prompt: `${row} x ${col}` }
  }

  return { row, col, operation, answer: row / col, prompt: `${row} / ${col}` }
}

function isValidProblem(row: number, col: number, operation: Operation) {
  if (operation === '-') {
    return row >= col
  }

  if (operation === '/') {
    return col !== 0 && row % col === 0
  }

  return true
}

function makeRoll(difficulty: Difficulty, claimed: Record<string, ClaimedCell>): Roll | null {
  const candidates: Roll[] = []

  for (const operation of difficulty.operations) {
    for (let row = 0; row <= difficulty.maxNumber; row += 1) {
      for (let col = 0; col <= difficulty.maxNumber; col += 1) {
        if (claimed[cellKey(row, col)] || !isValidProblem(row, col, operation)) {
          continue
        }

        candidates.push(getProblem(row, col, operation))
      }
    }
  }

  if (candidates.length === 0) {
    return null
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

function getLineBonuses(
  row: number,
  col: number,
  playerId: string,
  claimed: Record<string, ClaimedCell>,
  maxNumber: number,
  awardedLines: Set<string>,
) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]
  const bonuses: string[] = []

  for (const [dr, dc] of directions) {
    for (let offset = -2; offset <= 0; offset += 1) {
      const cells = Array.from({ length: 3 }, (_, index) => {
        const nextRow = row + (offset + index) * dr
        const nextCol = col + (offset + index) * dc
        return { row: nextRow, col: nextCol, key: cellKey(nextRow, nextCol) }
      })

      const isInside = cells.every(
        (cell) =>
          cell.row >= 0 &&
          cell.row <= maxNumber &&
          cell.col >= 0 &&
          cell.col <= maxNumber,
      )
      if (!isInside) {
        continue
      }

      const allOwned = cells.every((cell) => claimed[cell.key]?.playerId === playerId)
      const bonusKey = lineKey(playerId, cells.map((cell) => cell.key))
      if (allOwned && !awardedLines.has(bonusKey)) {
        bonuses.push(bonusKey)
      }
    }
  }

  return bonuses
}

function shapeSymbol(shape: Shape) {
  const symbols: Record<Shape, string> = {
    circle: '●',
    star: '★',
    heart: '♥',
    triangle: '▲',
    diamond: '◆',
  }

  return symbols[shape]
}

export default function OperacionesTableroActivity() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>('easy')
  const [playerCount, setPlayerCount] = useState(3)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [claimed, setClaimed] = useState<Record<string, ClaimedCell>>({})
  const [roll, setRoll] = useState<Roll | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [message, setMessage] = useState('Tira los dados para comenzar el turno.')
  const [awardedLineKeys, setAwardedLineKeys] = useState<Set<string>>(() => new Set())

  const difficulty = getDifficulty(difficultyKey)
  const numbers = useMemo(
    () => Array.from({ length: difficulty.maxNumber + 1 }, (_, index) => index),
    [difficulty.maxNumber],
  )
  const currentPlayer = players[currentPlayerIndex]
  const claimedCount = Object.keys(claimed).length
  const totalCells = numbers.length * numbers.length

  function startGame() {
    const nextPlayers = makePlayers(playerCount)
    setPlayers(nextPlayers)
    setCurrentPlayerIndex(0)
    setClaimed({})
    setRoll(null)
    setAnswer('')
    setFeedback(null)
    setAwardedLineKeys(new Set())
    setMessage(`${nextPlayers[0].name} parte tirando los dados.`)
    setScreen('playing')
  }

  function resetGame() {
    setScreen('setup')
    setPlayers([])
    setCurrentPlayerIndex(0)
    setClaimed({})
    setRoll(null)
    setAnswer('')
    setFeedback(null)
    setAwardedLineKeys(new Set())
    setMessage('Tira los dados para comenzar el turno.')
  }

  function finishGame() {
    setRoll(null)
    setAnswer('')
    setFeedback(null)
    setScreen('finished')
    setMessage('Partida terminada. Revisen el puntaje final.')
  }

  function rollDice() {
    const nextRoll = makeRoll(difficulty, claimed)
    setFeedback(null)
    setAnswer('')

    if (!nextRoll) {
      setRoll(null)
      setMessage('No quedan casillas disponibles para esta dificultad.')
      setScreen('finished')
      return
    }

    setRoll(nextRoll)
    setMessage(`${currentPlayer.name}, resuelve la operación para marcar la casilla.`)
  }

  function submitAnswer() {
    if (!roll || !currentPlayer || answer.trim() === '') {
      return
    }

    const numericAnswer = Number(answer)
    if (!Number.isFinite(numericAnswer) || numericAnswer !== roll.answer) {
      setFeedback('wrong')
      setMessage('Revisa el resultado e intenta de nuevo.')
      return
    }

    const nextClaimed = {
      ...claimed,
      [cellKey(roll.row, roll.col)]: {
        playerId: currentPlayer.id,
        color: currentPlayer.color,
        shape: currentPlayer.shape,
      },
    }

    const bonusLines = getLineBonuses(
      roll.row,
      roll.col,
      currentPlayer.id,
      nextClaimed,
      difficulty.maxNumber,
      awardedLineKeys,
    )
    const bonusPoints = bonusLines.length * 2
    const nextPlayers = players.map((player) =>
      player.id === currentPlayer.id
        ? { ...player, score: player.score + 1 + bonusPoints }
        : player,
    )
    const nextAwarded = new Set(awardedLineKeys)
    bonusLines.forEach((bonusKey) => nextAwarded.add(bonusKey))
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length

    setClaimed(nextClaimed)
    setPlayers(nextPlayers)
    setAwardedLineKeys(nextAwarded)
    setFeedback('correct')
    setRoll(null)
    setAnswer('')

    if (Object.keys(nextClaimed).length >= totalCells) {
      setScreen('finished')
      setMessage('Tablero completo. Revisen el puntaje final.')
      return
    }

    setCurrentPlayerIndex(nextPlayerIndex)
    setMessage(
      bonusPoints > 0
        ? `${currentPlayer.name} gana ${1 + bonusPoints} puntos. Sigue ${nextPlayers[nextPlayerIndex].name}.`
        : `${currentPlayer.name} marca la casilla. Sigue ${nextPlayers[nextPlayerIndex].name}.`,
    )
  }

  if (screen === 'setup') {
    return (
      <section className="board-game board-game-setup">
        <div className="board-hero">
          <span className="task-badge">Matemática en turnos</span>
          <h2>Tablero de Operaciones</h2>
          <p>
            Tiren los dados virtuales, resuelvan la operación y marquen una línea de tres
            para sumar puntos extra.
          </p>
        </div>

        <div className="board-setup-grid">
          <article className="board-setup-card">
            <h3>Dificultad</h3>
            <div className="board-choice-grid">
              {DIFFICULTIES.map((item) => (
                <button
                  className={item.key === difficultyKey ? 'is-selected' : ''}
                  key={item.key}
                  onClick={() => setDifficultyKey(item.key)}
                  style={{ '--board-tone': item.tone } as CSSProperties}
                  type="button"
                >
                  <strong>{item.label}</strong>
                  <span>0 a {item.maxNumber}</span>
                  <small>{item.operations.map(formatOperation).join(' ')}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="board-setup-card">
            <h3>Participantes</h3>
            <div className="board-player-count">
              {[2, 3, 4, 5].map((count) => (
                <button
                  className={count === playerCount ? 'is-selected' : ''}
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  type="button"
                >
                  {count}
                </button>
              ))}
            </div>
            <p>El juego asigna nombres, colores y figuras al comenzar.</p>
          </article>
        </div>

        <button className="primary-button board-start-button" onClick={startGame} type="button">
          Comenzar juego
        </button>
      </section>
    )
  }

  return (
    <section className="board-game board-game-play">
      <div className="board-status-panel">
        <div>
          <span className="task-badge">Dificultad {difficulty.label}</span>
          <h2>{screen === 'finished' ? 'Resultado final' : 'Turno de juego'}</h2>
          <p>{message}</p>
        </div>

        <div className="board-score-grid">
          {players.map((player, index) => (
            <article
              className={`board-player-card ${index === currentPlayerIndex && screen === 'playing' ? 'is-active' : ''}`}
              key={player.id}
              style={{ '--player-color': player.color } as CSSProperties}
            >
              <span className={`board-marker board-marker--${player.shape}`}>
                {shapeSymbol(player.shape)}
              </span>
              <strong>{player.name}</strong>
              <em>{player.score} pts</em>
            </article>
          ))}
        </div>
      </div>

      <div className="board-layout">
        <article className="board-table-wrap">
          <OperationBoard numbers={numbers} claimed={claimed} />
          <div className="board-progress-note">
            Casillas marcadas: {claimedCount}/{totalCells}
          </div>
        </article>

        <aside className="board-turn-panel">
          {screen === 'finished' ? (
            <FinishedPanel players={players} onRestart={resetGame} />
          ) : (
            <>
              <div className="board-dice-panel">
                <div className="board-dice-row">
                  <DiceValue label="Fila" value={roll?.row ?? '-'} />
                  <DiceValue label="Columna" value={roll?.col ?? '-'} />
                  <DiceValue label="Operación" value={roll ? formatOperation(roll.operation) : '-'} />
                </div>
                <button className="primary-button board-roll-button" onClick={rollDice} type="button">
                  Tirar dados
                </button>
              </div>

              <div className={`board-problem-card ${feedback ? `is-${feedback}` : ''}`}>
                <span>Problema</span>
                <strong>{roll ? `${roll.prompt} = ?` : 'Tira los dados'}</strong>
                <div className="board-answer-row">
                  <input
                    disabled={!roll}
                    inputMode="numeric"
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        submitAnswer()
                      }
                    }}
                    placeholder="Respuesta"
                    type="number"
                    value={answer}
                  />
                  <button className="secondary-button" disabled={!roll} onClick={submitAnswer} type="button">
                    Responder
                  </button>
                </div>
              </div>

              <button className="secondary-button board-end-button" onClick={finishGame} type="button">
                Terminar juego
              </button>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}

function OperationBoard({
  claimed,
  numbers,
}: {
  claimed: Record<string, ClaimedCell>
  numbers: number[]
}) {
  return (
    <div
      className="operation-board"
      style={{ '--board-size': numbers.length + 1 } as CSSProperties}
      aria-label="Tablero de numeros"
    >
      <div className="board-axis board-corner">x</div>
      {numbers.map((number) => (
        <div className="board-axis" key={`col-${number}`}>
          {number}
        </div>
      ))}
      {numbers.map((row) => (
        <div className="board-row-fragment" key={`row-${row}`}>
          <div className="board-axis">{row}</div>
          {numbers.map((col) => {
            const cell = claimed[cellKey(row, col)]

            return (
              <div className={cell ? 'board-cell is-claimed' : 'board-cell'} key={cellKey(row, col)}>
                {cell ? (
                  <span
                    className={`board-marker board-marker--${cell.shape}`}
                    style={{ '--player-color': cell.color } as CSSProperties}
                  >
                    {shapeSymbol(cell.shape)}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function DiceValue({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="board-die">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function FinishedPanel({ players, onRestart }: { players: Player[]; onRestart: () => void }) {
  const orderedPlayers = [...players].sort((a, b) => b.score - a.score)
  const winner = orderedPlayers[0]

  return (
    <div className="board-finished">
      <span className="task-badge">Fin del juego</span>
      <h3>Gana {winner?.name}</h3>
      <div className="board-final-list">
        {orderedPlayers.map((player, index) => (
          <div key={player.id} style={{ '--player-color': player.color } as CSSProperties}>
            <span>{index + 1}</span>
            <strong>{player.name}</strong>
            <em>{player.score} pts</em>
          </div>
        ))}
      </div>
      <button className="primary-button" onClick={onRestart} type="button">
        Jugar otra vez
      </button>
    </div>
  )
}

function formatOperation(operation: Operation) {
  const labels: Record<Operation, string> = {
    '+': '+',
    '-': '-',
    x: 'x',
    '/': '/',
  }

  return labels[operation]
}
