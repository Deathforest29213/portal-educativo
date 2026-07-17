import { Dice5, UsersRound } from 'lucide-react'
import { useMemo, useReducer, type CSSProperties } from 'react'
import { ActionButton } from '../../app/components/ActionButton'
import { ConfirmDialog } from '../../app/components/ConfirmDialog'
import { FeedbackBanner } from '../../app/components/FeedbackBanner'
import { browserRandom } from '../../platform/random/RandomSource'
import { DIFFICULTIES, PLAYER_NICKNAMES, getDifficulty } from './data/config'
import { cellKey, makeRoll, shapeSymbol } from './domain/board'
import { boardGameReducer, createBoardGameState } from './domain/gameState'
import type { ClaimedCell, Operation, Player } from './types'

const MAX_ROLLS_PER_TURN = 2

export default function OperacionesTableroActivity() {
  const [state, dispatch] = useReducer(boardGameReducer, undefined, createBoardGameState)
  const {
    screen,
    difficultyKey,
    playerCount,
    playerPresets,
    players,
    currentPlayerIndex,
    claimed,
    roll,
    answer,
    feedback,
    message,
    rollsThisTurn,
    isRolling,
    showFinishConfirm,
  } = state

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
    dispatch({ type: 'START_GAME' })
  }

  function randomizePlayerName(playerIndex: number) {
    const usedNames = new Set(playerPresets.map((player) => player.name))
    const availableNames = PLAYER_NICKNAMES.filter((name) => !usedNames.has(name))
    if (availableNames.length === 0) return

    const name = browserRandom.pick(availableNames)
    dispatch({ type: 'SET_PLAYER_NAME', playerIndex, name })
  }

  function resetGame() {
    dispatch({ type: 'RESET_GAME' })
  }

  function returnToMenu() {
    if (screen === 'playing') {
      requestFinishGame()
      return
    }

    resetGame()
  }

  function requestFinishGame() {
    dispatch({ type: 'REQUEST_FINISH' })
  }

  function cancelFinishGame() {
    dispatch({ type: 'CANCEL_FINISH' })
  }

  function confirmFinishGame() {
    dispatch({ type: 'CONFIRM_FINISH' })
  }

  function rollDice() {
    if (!canRoll || !currentPlayer) {
      return
    }

    const nextRoll = makeRoll(difficulty, claimed)
    dispatch({ type: 'ROLL_REQUESTED', roll: nextRoll })
    if (nextRoll) {
      window.setTimeout(() => dispatch({ type: 'ROLL_ANIMATION_FINISHED' }), 720)
    }
  }

  function submitAnswer() {
    dispatch({ type: 'SUBMIT_ANSWER' })
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
                      onClick={() => dispatch({ type: 'SELECT_DIFFICULTY', difficultyKey: item.key })}
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
                      onClick={() => dispatch({ type: 'SET_PLAYER_COUNT', count })}
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

          <ActionButton className="board-start-button" onClick={startGame}>
            Comenzar juego
          </ActionButton>
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
        <ActionButton onClick={returnToMenu} variant="quiet">
          ← Volver al menú
        </ActionButton>
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
              <section className="board-points-card" aria-labelledby="board-points-title">
                <div className="board-points-heading">
                  <strong id="board-points-title">Puntos y progreso</strong>
                </div>
                <div className="board-points-summary">
                  <div>
                    <strong>+1</strong>
                    <span>Casilla</span>
                  </div>
                  <div>
                    <strong>+2</strong>
                    <span>Línea de 3</span>
                  </div>
                  <div>
                    <strong>{claimedCount}/{totalCells}</strong>
                    <span>Marcadas</span>
                  </div>
                </div>
              </section>

              <div className="board-step-card board-dice-panel">
                <div className="board-step-heading">
                  <span className="board-step-number">1</span>
                  <strong>Tirar dados</strong>
                </div>
                <div className="board-dice-row" aria-live="polite">
                  <DiceValue label="Fila" value={roll?.row ?? '-'} />
                  <DiceValue label="Columna" value={roll?.col ?? '-'} />
                  <DiceValue label="Operación" value={roll ? formatOperation(roll.operation) : '-'} />
                </div>
                <ActionButton
                  busy={isRolling}
                  busyLabel="Tirando dados"
                  className="board-roll-button"
                  disabled={!canRoll}
                  onClick={rollDice}
                >
                  {rollButtonLabel}
                </ActionButton>
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
                      onChange={(event) => dispatch({ type: 'ANSWER_CHANGED', answer: event.target.value })}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          submitAnswer()
                        }
                      }}
                      placeholder="Respuesta"
                      type="number"
                      value={answer}
                    />
                    <ActionButton disabled={isRolling || answer.trim() === ''} onClick={submitAnswer} variant="secondary">
                      Responder
                    </ActionButton>
                  </div>
                ) : null}
                {feedback === 'correct' ? <FeedbackBanner title="Respuesta correcta" tone="success">La casilla quedó marcada. Sigue el próximo turno.</FeedbackBanner> : null}
                {feedback === 'wrong' ? <FeedbackBanner title="Respuesta incorrecta" tone="danger">El turno terminó. Sigue el próximo jugador.</FeedbackBanner> : null}
              </div>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        cancelLabel="Seguir jugando"
        confirmLabel="Terminar partida"
        description="Se cerrará la partida actual y volverás al menú de configuración."
        onCancel={cancelFinishGame}
        onConfirm={confirmFinishGame}
        open={showFinishConfirm}
        title="¿Terminar la partida?"
        tone="danger"
      />
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
      <ActionButton onClick={onRestart}>
        Jugar otra vez
      </ActionButton>
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
