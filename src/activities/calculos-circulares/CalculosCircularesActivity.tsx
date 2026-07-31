import { CircleHelp, Sparkles, Trophy } from 'lucide-react'
import { useEffect, useMemo, useReducer, useState, type CSSProperties, type ReactNode } from 'react'
import { ActionButton } from '../../app/components/ActionButton'
import { FeedbackBanner } from '../../app/components/FeedbackBanner'
import { ProgressBadge } from '../../app/components/ProgressBadge'
import { CIRCULAR_DIFFICULTIES, MAX_CIRCULAR_NUMBER, MAX_EMPTY_CELLS, MIN_CIRCULAR_NUMBER, MIN_EMPTY_CELLS, getCircularDifficulty } from './data/config'
import { createCircularGameState, circularGameReducer } from './domain/gameState'
import { createCircularPuzzle, getOperationSymbol, getRelatedLines } from './domain/puzzle'
import type { CircularCellId, CircularLine, CircularLineId, CircularOperation } from './types'
import './calculos-circulares.css'

const OPERATIONS: CircularOperation[] = ['+', '-', 'x', '/']

export default function CalculosCircularesActivity() {
  const initialDifficulty = CIRCULAR_DIFFICULTIES[0]
  const [state, dispatch] = useReducer(
    circularGameReducer,
    undefined,
    () => createCircularGameState(createCircularPuzzle(initialDifficulty)),
  )
  const [activeCell, setActiveCell] = useState<CircularCellId | null>(null)
  const {
    answers,
    bestStreak,
    completedRounds,
    customEmptyCells,
    customMaxNumber,
    customOperations,
    difficultyKey,
    hintedLine,
    message,
    puzzle,
    score,
    screen,
    streak,
    wrongCells,
  } = state
  const difficulty = getCircularDifficulty(difficultyKey, {
    emptyCells: customEmptyCells,
    maxNumber: customMaxNumber,
    operations: customOperations,
  })
  const solvedCount = [...puzzle.blanks].filter((cellId) => answers[cellId]?.trim() !== '').length
  const canStartCustom = customOperations.length > 0
  const isCompleted = screen === 'completed'

  useEffect(() => {
    if (!hintedLine) return

    const timeoutId = window.setTimeout(() => dispatch({ type: 'CLEAR_HINT' }), 1_650)
    return () => window.clearTimeout(timeoutId)
  }, [hintedLine])

  const suggestedLine = useMemo(() => getSuggestedLine(activeCell, puzzle.lines, puzzle.blanks, answers), [activeCell, answers, puzzle.blanks, puzzle.lines])

  function startGame() {
    if (difficultyKey === 'custom' && !canStartCustom) return
    dispatch({ type: 'START_GAME', puzzle: createCircularPuzzle(difficulty) })
    setActiveCell(null)
  }

  function nextRound() {
    dispatch({ type: 'NEXT_ROUND', puzzle: createCircularPuzzle(difficulty) })
    setActiveCell(null)
  }

  function showHint() {
    if (suggestedLine) dispatch({ type: 'SHOW_HINT', lineId: suggestedLine.id })
  }

  if (screen === 'setup') {
    return (
      <section className="circular-calculations circular-calculations--setup" style={{ '--circular-tone': difficulty.tone } as CSSProperties}>
        <div className="circular-setup-shell">
          <div className="circular-hero">
            <span className="task-badge">Matemática conectada</span>
            <h2>Cálculos circulares</h2>
            <p>Completa los números que conectan las operaciones horizontales y verticales.</p>
          </div>

          <article className="circular-settings-card">
            <div className="circular-section-heading">
              <span>Dificultad</span>
              <strong>{difficulty.description}</strong>
            </div>
            <div className="circular-difficulty-grid" role="radiogroup" aria-label="Dificultad">
              {CIRCULAR_DIFFICULTIES.map((item) => {
                const selected = item.key === difficultyKey
                const cardDifficulty = item.key === 'custom' && selected ? difficulty : item

                return (
                  <button
                    aria-checked={selected}
                    className={selected ? 'is-selected' : ''}
                    key={item.key}
                    onClick={() => dispatch({ type: 'SELECT_DIFFICULTY', difficultyKey: item.key })}
                    role="radio"
                    style={{ '--card-tone': item.tone } as CSSProperties}
                    type="button"
                  >
                    <CircularPreview operations={cardDifficulty.operations} />
                    <strong>{item.label}</strong>
                    <span>{cardDifficulty.rangeLabel}</span>
                    <small>{cardDifficulty.emptyCells} casillas por completar</small>
                  </button>
                )
              })}
            </div>

            {difficultyKey === 'custom' ? (
              <div className="circular-custom-settings" aria-label="Configuración personalizada">
                <label>
                  <span>Rango de números</span>
                  <div>
                    <small>De 0 a</small>
                    <input
                      aria-label="Número máximo del rango personalizado"
                      max={MAX_CIRCULAR_NUMBER}
                      min={MIN_CIRCULAR_NUMBER}
                      onChange={(event) => dispatch({ type: 'SET_CUSTOM_MAX_NUMBER', value: Number(event.target.value) })}
                      type="number"
                      value={customMaxNumber}
                    />
                  </div>
                </label>
                <fieldset>
                  <legend>Operaciones</legend>
                  <div className="circular-operation-picker">
                    {OPERATIONS.map((operation) => {
                      const selected = customOperations.includes(operation)
                      return (
                        <button
                          aria-pressed={selected}
                          className={selected ? 'is-selected' : ''}
                          key={operation}
                          onClick={() => dispatch({ type: 'TOGGLE_CUSTOM_OPERATION', operation })}
                          type="button"
                        >
                          {getOperationSymbol(operation)}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <label>
                  <span>Casillas vacías</span>
                  <div>
                    <small>De {MIN_EMPTY_CELLS} a {MAX_EMPTY_CELLS}</small>
                    <input
                      aria-label="Cantidad de casillas vacías"
                      max={MAX_EMPTY_CELLS}
                      min={MIN_EMPTY_CELLS}
                      onChange={(event) => dispatch({ type: 'SET_CUSTOM_EMPTY_CELLS', value: Number(event.target.value) })}
                      type="number"
                      value={customEmptyCells}
                    />
                  </div>
                </label>
                {!canStartCustom ? <small className="circular-warning">Selecciona al menos una operación.</small> : null}
              </div>
            ) : null}
          </article>

          <ActionButton disabled={difficultyKey === 'custom' && !canStartCustom} onClick={startGame}>
            Comenzar actividad
          </ActionButton>
        </div>
      </section>
    )
  }

  return (
    <section className="circular-calculations circular-calculations--play" style={{ '--circular-tone': difficulty.tone } as CSSProperties}>
      <div className="activity-back-row">
        <ActionButton onClick={() => dispatch({ type: 'BACK_TO_MENU' })} variant="quiet">
          ← Volver al menú
        </ActionButton>
      </div>

      <header className="circular-status-panel">
        <div>
          <span className="task-badge">Cálculo mental</span>
          <h2>{isCompleted ? '¡Círculo resuelto!' : 'Cálculos circulares'}</h2>
          <p>{message}</p>
        </div>
        <div className="circular-score-grid" aria-label="Progreso de la actividad">
          <ScoreItem icon={<Trophy aria-hidden="true" />} label="Puntos" value={score} />
          <ScoreItem icon={<Sparkles aria-hidden="true" />} label="Racha" value={streak} />
          <ScoreItem icon={<CircleHelp aria-hidden="true" />} label="Mejor racha" value={bestStreak} />
        </div>
      </header>

      <div className="circular-game-layout">
        <article className={`circular-workspace ${isCompleted ? 'is-completed' : ''}`}>
          <div className="circular-workspace-heading">
            <div>
              <span className="circular-difficulty-pill">{difficulty.label}</span>
              <strong>{difficulty.rangeLabel}</strong>
            </div>
            <ProgressBadge current={solvedCount} label="Casillas" total={puzzle.blanks.size} />
          </div>

          <CircularBoard
            activeCell={activeCell}
            answers={answers}
            hintedLine={hintedLine}
            onAnswerChange={(cellId, value) => dispatch({ type: 'ANSWER_CHANGED', cellId, value })}
            onCellFocus={setActiveCell}
            puzzle={puzzle}
            wrongCells={wrongCells}
          />
        </article>

        <aside className="circular-side-panel">
          <section className="circular-instruction-card">
            <h3>Cómo resolver</h3>
            <ol>
              <li>Relaciona cada fila y columna.</li>
              <li>Completa todas las casillas vacías.</li>
              <li>Envía la ronda para revisar el círculo completo.</li>
            </ol>
          </section>
          {!isCompleted ? (
            <>
              <ActionButton disabled={!suggestedLine} onClick={showHint} variant="secondary">
                <CircleHelp aria-hidden="true" size={19} />
                Destacar ecuación
              </ActionButton>
              <ActionButton onClick={() => dispatch({ type: 'SUBMIT_ROUND' })}>
                Revisar círculo
              </ActionButton>
              {wrongCells.size > 0 ? <FeedbackBanner title="Aún puedes corregir" tone="danger">Las casillas marcadas necesitan otro número. La racha se reinició, pero la ronda sigue abierta.</FeedbackBanner> : null}
            </>
          ) : (
            <section className="circular-completion-card">
              <Sparkles aria-hidden="true" size={32} />
              <h3>{streak > 0 ? `Racha de ${streak}` : 'Ronda superada'}</h3>
              <p>Has resuelto {completedRounds} {completedRounds === 1 ? 'círculo' : 'círculos'} en esta sesión.</p>
              <ActionButton onClick={nextRound}>Nuevo círculo</ActionButton>
            </section>
          )}
        </aside>
      </div>
    </section>
  )
}

function CircularBoard({
  activeCell,
  answers,
  hintedLine,
  onAnswerChange,
  onCellFocus,
  puzzle,
  wrongCells,
}: {
  activeCell: CircularCellId | null
  answers: Record<CircularCellId, string>
  hintedLine: CircularLineId | null
  onAnswerChange: (cellId: CircularCellId, value: string) => void
  onCellFocus: (cellId: CircularCellId) => void
  puzzle: ReturnType<typeof createCircularPuzzle>
  wrongCells: Set<CircularCellId>
}) {
  return (
    <div className="circular-board" aria-label="Cuadrícula de cálculos circulares">
      <div className="circular-grid">
        {puzzle.lines.map((line) => <LineSymbols highlighted={hintedLine === line.id} key={line.id} line={line} />)}
        {Object.entries(puzzle.values).map(([cellId, value]) => {
          const id = cellId as CircularCellId
          const isBlank = puzzle.blanks.has(id)
          const isWrong = wrongCells.has(id)
          const isActive = activeCell === id
          return (
            <label
              className={`circular-number-cell ${isBlank ? 'is-blank' : 'is-clue'} ${isWrong ? 'is-wrong' : ''} ${isActive ? 'is-active' : ''}`}
              key={id}
              style={cellGridPosition(id)}
              title={isBlank ? 'Una pista puede destacar una ecuación conectada a esta casilla.' : 'Número de apoyo'}
            >
              {isBlank ? (
                <input
                  aria-label={`Casilla ${id}`}
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(event) => onAnswerChange(id, event.target.value)}
                  onFocus={() => onCellFocus(id)}
                  pattern="[0-9]*"
                  type="text"
                  value={answers[id] ?? ''}
                />
              ) : <strong>{value}</strong>}
            </label>
          )
        })}
      </div>
    </div>
  )
}

function LineSymbols({ highlighted, line }: { highlighted: boolean; line: CircularLine }) {
  const [first, second, third] = line.cells
  const vertical = line.id.startsWith('column')
  return (
    <>
      <span className={`circular-symbol ${highlighted ? 'is-hinted' : ''}`} style={symbolPosition(first, second, vertical)}>{getOperationSymbol(line.operation)}</span>
      <span className={`circular-symbol circular-equals ${highlighted ? 'is-hinted' : ''}`} style={symbolPosition(second, third, vertical)}>=</span>
    </>
  )
}

function CircularPreview({ operations }: { operations: CircularOperation[] }) {
  return (
    <span className="circular-preview" aria-hidden="true">
      <span>●</span><em>{getOperationSymbol(operations[0] ?? '+')}</em><span>●</span>
      <em>{getOperationSymbol(operations[1] ?? '+')}</em><span>●</span><em>=</em>
      <span>●</span><em>=</em><span>●</span>
    </span>
  )
}

function ScoreItem({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>
}

function getSuggestedLine(
  activeCell: CircularCellId | null,
  lines: CircularLine[],
  blanks: Set<CircularCellId>,
  answers: Record<CircularCellId, string>,
) {
  const candidates = activeCell ? getRelatedLines(activeCell, lines) : lines
  return [...candidates].sort((first, second) => knownCellCount(second, blanks, answers) - knownCellCount(first, blanks, answers))[0]
}

function knownCellCount(line: CircularLine, blanks: Set<CircularCellId>, answers: Record<CircularCellId, string>) {
  return line.cells.filter((cellId) => !blanks.has(cellId) || answers[cellId]?.trim()).length
}

function cellGridPosition(cellId: CircularCellId) {
  const [row, column] = cellId.split('-').map(Number)
  return { gridColumn: column * 2 + 1, gridRow: row * 2 + 1 }
}

function symbolPosition(first: CircularCellId, second: CircularCellId, vertical: boolean) {
  const [firstRow, firstColumn] = first.split('-').map(Number)
  const [secondRow, secondColumn] = second.split('-').map(Number)
  return vertical
    ? { gridColumn: firstColumn * 2 + 1, gridRow: Math.min(firstRow, secondRow) * 2 + 2 }
    : { gridColumn: Math.min(firstColumn, secondColumn) * 2 + 2, gridRow: firstRow * 2 + 1 }
}
