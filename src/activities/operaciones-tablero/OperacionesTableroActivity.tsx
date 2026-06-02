import { Dice5, UsersRound } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { DIFFICULTIES, PLAYER_NICKNAMES, PLAYER_PRESETS, getDifficulty } from './data/config'
import {
  cellKey,
  getLineBonuses,
  makePlayers,
  makeRoll,
  shapeSymbol,
} from './domain/board'
import type { ClaimedCell, DifficultyKey, Operation, Player, PlayerPreset, Roll } from './types'

type Screen = 'setup' | 'playing' | 'finished'
type Feedback = 'correct' | 'wrong' | null

const MAX_ROLLS_PER_TURN = 2

export default function OperacionesTableroActivity() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>('easy')
  const [playerCount, setPlayerCount] = useState(3)
  const [playerPresets, setPlayerPresets] = useState<PlayerPreset[]>(PLAYER_PRESETS)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [claimed, setClaimed] = useState<Record<string, ClaimedCell>>({})
  const [roll, setRoll] = useState<Roll | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [message, setMessage] = useState('Tira los dados para comenzar el turno.')
  const [awardedLineKeys, setAwardedLineKeys] = useState<Set<string>>(() => new Set())
  const [rollsThisTurn, setRollsThisTurn] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)

  const difficulty = getDifficulty(difficultyKey)
  const numbers = useMemo(
    () => Array.from({ length: difficulty.maxNumber + 1 }, (_, index) => index),
    [difficulty.maxNumber],
  )
  const selectedPlayerPresets = playerPresets.slice(0, playerCount)
  const currentPlayer = players[currentPlayerIndex]
  const claimedCount = Object.keys(claimed).length
  const totalCells = numbers.length * numbers.length
  const isTurnFinished = !roll && feedback !== null
  const rollButtonLabel = isRolling
    ? 'Tirando...'
    : rollsThisTurn === 0
      ? 'Tirar dados'
      : rollsThisTurn < MAX_ROLLS_PER_TURN
        ? 'Tirar otra vez'
        : 'Sin tiradas'
  const canRoll = !isRolling && rollsThisTurn < MAX_ROLLS_PER_TURN
  const resolverText = roll
    ? `${roll.prompt} = ?`
    : isTurnFinished
      ? 'Turno finalizado'
    : `Turno de ${currentPlayer?.name ?? 'jugador'}, tira los dados.`

  function startGame() {
    const nextPlayers = makePlayers(playerCount, selectedPlayerPresets)
    setPlayers(nextPlayers)
    setCurrentPlayerIndex(0)
    setClaimed({})
    setRoll(null)
    setAnswer('')
    setFeedback(null)
    setAwardedLineKeys(new Set())
    setRollsThisTurn(0)
    setIsRolling(false)
    setShowFinishConfirm(false)
    setMessage(`${nextPlayers[0].name} parte tirando los dados.`)
    setScreen('playing')
  }

  function randomizePlayerName(playerIndex: number) {
    setPlayerPresets((currentPresets) => {
      const usedNames = new Set(currentPresets.map((player) => player.name))
      const availableNames = PLAYER_NICKNAMES.filter((name) => !usedNames.has(name))

      if (availableNames.length === 0) {
        return currentPresets
      }

      const nextName = availableNames[Math.floor(Math.random() * availableNames.length)]
      return currentPresets.map((player, index) =>
        index === playerIndex ? { ...player, name: nextName } : player,
      )
    })
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
    setRollsThisTurn(0)
    setIsRolling(false)
    setShowFinishConfirm(false)
    setMessage('Tira los dados para comenzar el turno.')
  }

  function requestFinishGame() {
    setShowFinishConfirm(true)
  }

  function cancelFinishGame() {
    setShowFinishConfirm(false)
  }

  function confirmFinishGame() {
    setRoll(null)
    setAnswer('')
    setFeedback(null)
    setRollsThisTurn(0)
    setIsRolling(false)
    setShowFinishConfirm(false)
    setScreen('finished')
    setMessage('Partida terminada. Revisen el puntaje final.')
  }

  function rollDice() {
    if (!canRoll || !currentPlayer) {
      return
    }

    const nextRoll = makeRoll(difficulty, claimed)
    setFeedback(null)
    setAnswer('')
    setIsRolling(true)

    if (!nextRoll) {
      setRoll(null)
      setIsRolling(false)
      setMessage('No quedan casillas disponibles para esta dificultad.')
      setScreen('finished')
      return
    }

    setRoll(nextRoll)
    setRollsThisTurn((count) => Math.min(count + 1, MAX_ROLLS_PER_TURN))
    setMessage(`${currentPlayer.name}, resuelve la operación para marcar la casilla.`)
    window.setTimeout(() => setIsRolling(false), 720)
  }

  function submitAnswer() {
    if (!roll || !currentPlayer || isRolling || answer.trim() === '') {
      return
    }

    const numericAnswer = Number(answer)
    if (!Number.isFinite(numericAnswer) || numericAnswer !== roll.answer) {
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
      setFeedback('wrong')
      setRoll(null)
      setAnswer('')
      setRollsThisTurn(0)
      setIsRolling(false)
      setCurrentPlayerIndex(nextPlayerIndex)
      setMessage(`${currentPlayer.name} pierde el turno. Sigue ${players[nextPlayerIndex].name}.`)
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
    setRollsThisTurn(0)
    setIsRolling(false)

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
      <section
        className="board-game board-game-setup"
        style={{ '--board-tone': difficulty.tone } as CSSProperties}
      >
        <div className="board-setup-shell">
          <div className="board-hero">
            <span className="task-badge">Matemática en turnos</span>
            <h2>Tablero de Operaciones</h2>
            <p>
              Elige dificultad y participantes antes de comenzar la partida.
            </p>
          </div>

          <div className="board-setup-main">
            <article className="board-setup-section">
              <div className="board-section-heading">
                <span>Dificultad</span>
                <strong>{difficulty.description}</strong>
              </div>
              <div className="board-choice-grid" role="radiogroup" aria-label="Dificultad">
                {DIFFICULTIES.map((item) => {
                  const isSelected = item.key === difficultyKey

                  return (
                    <button
                      aria-checked={isSelected}
                      className={isSelected ? 'is-selected' : ''}
                      key={item.key}
                      onClick={() => setDifficultyKey(item.key)}
                      role="radio"
                      style={{ '--board-card-tone': item.tone } as CSSProperties}
                      type="button"
                    >
                      <span className="board-operation-icons" aria-hidden="true">
                        {item.operations.map((operation) => (
                          <span className="board-operation-chip" key={operation}>
                            {getOperationSymbol(operation)}
                          </span>
                        ))}
                      </span>
                      <strong>{item.label}</strong>
                      <span>{item.rangeLabel}</span>
                      <small>{getOperationCountLabel(item.operations.length)}</small>
                    </button>
                  )
                })}
              </div>
            </article>

            <article className="board-setup-section board-participants-section">
              <div className="board-section-heading">
                <span>Participantes</span>
                <strong>Nombres, colores y formas preestablecidas.</strong>
              </div>

              <div className="board-participants-layout">
                <div className="board-player-count" role="radiogroup" aria-label="Cantidad de participantes">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      aria-checked={count === playerCount}
                      className={count === playerCount ? 'is-selected' : ''}
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      role="radio"
                      type="button"
                    >
                      <UsersRound aria-hidden="true" size={22} strokeWidth={2.5} />
                      <strong>{count}</strong>
                      <span>{count === 2 ? 'duplas' : 'jugadores'}</span>
                    </button>
                  ))}
                </div>

                <div className="board-player-preview-grid" aria-label="Jugadores preestablecidos">
                  {selectedPlayerPresets.map((player, index) => (
                    <button
                      className="board-player-preview"
                      key={`${index}-${player.color}-${player.shape}`}
                      onClick={() => randomizePlayerName(index)}
                      type="button"
                      aria-label={`Cambiar nickname de Jugador ${index + 1}`}
                      style={{ '--player-color': player.color } as CSSProperties}
                    >
                      <span
                        className={`board-marker board-marker--${player.shape}`}
                        aria-hidden="true"
                      >
                        {shapeSymbol(player.shape)}
                      </span>
                      <div>
                        <small>Jugador {index + 1}</small>
                        <strong>{player.name}</strong>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <button className="primary-button board-start-button" onClick={startGame} type="button">
            Comenzar juego
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`board-game board-game-play board-game--${difficulty.key}`}
      style={{ '--board-tone': difficulty.tone } as CSSProperties}
    >
      <div className="activity-back-row board-back-row">
        <button className="activity-back-pill" onClick={resetGame} type="button">
          ← Volver al menú
        </button>
      </div>

      <div className="board-status-panel">
        <div className="board-status-copy">
          <h2>
            {screen === 'finished'
              ? 'Resultado final'
              : `Turno: ${currentPlayer?.name ?? 'jugador'}`}
          </h2>
          <p>{message}</p>
        </div>

        <div className="board-status-metrics" aria-label="Estado de la partida">
          <span>{claimedCount}/{totalCells} casillas</span>
          <span>Líneas de 3: +2 pts</span>
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
          <div className="board-table-topline">
            <span className="board-difficulty-pill">Dificultad {difficulty.label}</span>
            <span>{difficulty.rangeLabel}</span>
          </div>
          <OperationBoard numbers={numbers} claimed={claimed} />
        </article>

        <aside className="board-turn-panel">
          {screen === 'finished' ? (
            <FinishedPanel players={players} onRestart={resetGame} />
          ) : (
            <>
              <div className="board-turn-player" style={{ '--player-color': currentPlayer?.color } as CSSProperties}>
                {currentPlayer ? (
                  <>
                    <span className={`board-marker board-marker--${currentPlayer.shape}`}>
                      {shapeSymbol(currentPlayer.shape)}
                    </span>
                    <div>
                      <small>Jugador actual</small>
                      <strong>{currentPlayer.name}</strong>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="board-step-card board-dice-panel">
                <div className="board-step-heading">
                  <span className="board-step-number">1</span>
                  <strong>Tirar dados</strong>
                </div>
                <div className="board-dice-row">
                  <DiceValue label="Fila" value={roll?.row ?? '-'} />
                  <DiceValue label="Columna" value={roll?.col ?? '-'} />
                  <DiceValue label="Operación" value={roll ? formatOperation(roll.operation) : '-'} />
                </div>
                <div className="board-operation-roll" aria-live="polite">
                  <span>Dado de signo</span>
                  <strong className={isRolling ? 'is-rolling' : ''}>
                    {roll ? getOperationSymbol(roll.operation) : '?'}
                  </strong>
                  <small>{rollsThisTurn}/{MAX_ROLLS_PER_TURN} tiradas</small>
                </div>
                <button
                  className="primary-button board-roll-button"
                  disabled={!canRoll}
                  onClick={rollDice}
                  type="button"
                >
                  {rollButtonLabel}
                </button>
              </div>

              <div className={`board-step-card board-problem-card ${feedback ? `is-${feedback}` : ''}`}>
                <div className="board-step-heading">
                  <span className="board-step-number">2</span>
                  <strong>Resolver</strong>
                </div>
                <strong className={!roll ? 'board-turn-instruction' : undefined}>{resolverText}</strong>
                {isTurnFinished && currentPlayer ? (
                  <div
                    className="board-next-turn-card"
                    style={{ '--player-color': currentPlayer.color } as CSSProperties}
                  >
                    <span className={`board-marker board-marker--${currentPlayer.shape}`} aria-hidden="true">
                      {shapeSymbol(currentPlayer.shape)}
                    </span>
                    <div>
                      <small>Sigue</small>
                      <strong>{currentPlayer.name}</strong>
                      <span>Tira los dados.</span>
                    </div>
                  </div>
                ) : null}
                {roll ? (
                  <div className="board-answer-row">
                    <input
                      disabled={isRolling}
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
                    <button className="secondary-button" disabled={isRolling} onClick={submitAnswer} type="button">
                      Responder
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="board-step-card board-finish-step">
                <div className="board-step-heading">
                  <span className="board-step-number">3</span>
                  <strong>Finalizar</strong>
                </div>
                <button className="secondary-button board-end-button" onClick={requestFinishGame} type="button">
                  Terminar juego
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {showFinishConfirm ? (
        <div className="board-modal-backdrop" role="presentation">
          <section
            aria-labelledby="board-finish-title"
            aria-modal="true"
            className="board-confirm-modal"
            role="dialog"
          >
            <span className="task-badge">Terminar juego</span>
            <h3 id="board-finish-title">¿Seguro que quieres terminar?</h3>
            <p>Se cerrará la partida actual y se mostrarán los puntajes finales.</p>
            <div className="board-confirm-actions">
              <button className="secondary-button" onClick={cancelFinishGame} type="button">
                Seguir jugando
              </button>
              <button className="primary-button" onClick={confirmFinishGame} type="button">
                Sí, terminar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

function getOperationSymbol(operation: Operation) {
  const symbols: Record<Operation, string> = {
    '+': '+',
    '-': '-',
    x: '×',
    '/': '÷',
  }

  return symbols[operation]
}

function getOperationCountLabel(count: number) {
  return `${count} ${count === 1 ? 'signo aritmético' : 'signos aritméticos'}`
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
      <div className="board-axis board-corner" aria-label="Dados del tablero">
        <Dice5 aria-hidden="true" size={24} strokeWidth={2.6} />
      </div>
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
