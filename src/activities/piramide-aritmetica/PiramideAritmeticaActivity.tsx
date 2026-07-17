import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useReducer, type CSSProperties } from 'react'
import { ActionButton } from '../../app/components/ActionButton'
import { ConfirmDialog } from '../../app/components/ConfirmDialog'
import { FeedbackBanner } from '../../app/components/FeedbackBanner'
import { ProgressBadge } from '../../app/components/ProgressBadge'
import { browserRandom, type RandomSource } from '../../platform/random/RandomSource'
import './piramide-aritmetica.css'
import {
  createPyramidState,
  pyramidReducer,
  type CellId,
  type Difficulty,
  type DifficultyKey,
  type ErrorMark,
  type OperationMode,
  type Puzzle,
  type WrongAnswerMark,
} from './domain/pyramidState'

const DIFFICULTIES: Difficulty[] = [
  {
    key: 'easy',
    label: 'Fácil',
    maxBaseValue: 10,
    rows: 4,
    numberRange: '1 al 10',
    maxValue: 100,
    revealRatio: 0.58,
    tone: '#2f9e44',
    description: 'Cuatro filas para practicar con calma.',
  },
  {
    key: 'medium',
    label: 'Intermedio',
    maxBaseValue: 40,
    rows: 5,
    numberRange: '1 al 40',
    maxValue: 100,
    revealRatio: 0.5,
    tone: '#1971c2',
    description: 'Cinco filas y más casillas para deducir.',
  },
  {
    key: 'hard',
    label: 'Difícil',
    maxBaseValue: 100,
    rows: 7,
    numberRange: '1 al 100',
    maxValue: 100,
    revealRatio: 0.36,
    tone: '#c2410c',
    description: 'Siete filas, errores marcados y más desafío.',
  },
]

const BLOCK_COLORS: Record<DifficultyKey, string[]> = {
  easy: ['#5ec6b5', '#f3d990', '#f89f82', '#37a191', '#e8bf5c', '#8fd7c8', '#f6c8ad'],
  medium: ['#5aa9e6', '#8fd7c8', '#f3d990', '#3f8fd2', '#7cc3ef', '#37a191', '#c6e4ff'],
  hard: ['#f89f82', '#e8bf5c', '#e79585', '#c86f5b', '#f3d990', '#d8896f', '#ffc0aa'],
}
const BLOCK_SHADOWS: Record<DifficultyKey, string[]> = {
  easy: ['#3f9a8a', '#d4ae58', '#c77a5f', '#26796e', '#c19a3f', '#5bb5a6', '#d79d7f'],
  medium: ['#3c82bb', '#5bb5a6', '#d4ae58', '#2c6fa7', '#559fc8', '#26796e', '#8dbfe4'],
  hard: ['#c77a5f', '#c19a3f', '#bf6e61', '#9d4e3e', '#d4ae58', '#a95f4d', '#d98c76'],
}

export default function PiramideAritmeticaActivity() {
  const [state, dispatch] = useReducer(
    pyramidReducer,
    undefined,
    () => createPyramidState('easy', createPuzzle(DIFFICULTIES[0])),
  )
  const {
    screen,
    difficultyKey,
    puzzle,
    answers,
    accepted,
    errorMarks,
    shakeMarks,
    successMarks,
    wrongAnswerMarks,
    activeCell,
    score,
    streak,
    bestStreak,
    message,
    showNewPuzzleConfirm,
  } = state
  const difficulty = getDifficulty(difficultyKey)

  const editableCells = useMemo(() => getEditableCells(puzzle), [puzzle])
  const completedCount = accepted.size
  const totalEditable = editableCells.length
  const isComplete = totalEditable > 0 && completedCount === totalEditable
  const hasErrors = Object.keys(wrongAnswerMarks).length > 0 || Object.keys(errorMarks).length > 0
  const operationLabel = puzzle.operationMode === 'sum' ? 'Suma' : 'Resta'
  const operationSymbol = puzzle.operationMode === 'sum' ? '+' : '−'

  useEffect(() => {
    const activeShakeMarks = Object.entries(shakeMarks)

    if (activeShakeMarks.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_SHAKES', marks: activeShakeMarks as Array<[CellId, number]> })
    }, 460)

    return () => window.clearTimeout(timeoutId)
  }, [shakeMarks])

  useEffect(() => {
    const activeSuccessMarks = Object.entries(successMarks)

    if (activeSuccessMarks.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_SUCCESSES', marks: activeSuccessMarks as Array<[CellId, number]> })
    }, 520)

    return () => window.clearTimeout(timeoutId)
  }, [successMarks])

  useEffect(() => {
    const activeWrongAnswerMarks = Object.entries(wrongAnswerMarks)

    if (activeWrongAnswerMarks.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({
        type: 'EXPIRE_WRONG_ANSWERS',
        marks: activeWrongAnswerMarks as Array<[CellId, WrongAnswerMark]>,
      })
    }, 1500)

    return () => window.clearTimeout(timeoutId)
  }, [wrongAnswerMarks])

  function startGame(nextDifficulty = difficulty) {
    const nextPuzzle = createPuzzle(nextDifficulty)
    dispatch({
      type: 'START_GAME',
      difficultyKey: nextDifficulty.key,
      puzzle: nextPuzzle,
      message: nextPuzzle.operationMode === 'sum'
        ? 'Completa cada bloque sumando los dos de abajo.'
        : 'Resta al bloque de arriba el número conocido.',
    })
  }

  function backToMenu() {
    dispatch({ type: 'BACK_TO_MENU' })
  }

  function startNewPuzzle() {
    dispatch({ type: 'REQUEST_NEW_PUZZLE' })
  }

  function cancelNewPuzzle() {
    dispatch({ type: 'CANCEL_NEW_PUZZLE' })
  }

  function confirmNewPuzzle() {
    startGame(difficulty)
  }

  function updateAnswer(cellId: CellId, value: string) {
    const cleanValue = value.replace(/[^\d]/g, '').slice(0, 3)
    dispatch({ type: 'ANSWER_CHANGED', cellId, value: cleanValue })

    const expectedValue = getCellValue(puzzle.solution, cellId)
    const expectedLength = expectedValue.toString().length

    if (cleanValue.length >= expectedLength) {
      reviewCells([cellId], { [cellId]: cleanValue })
    }
  }

  function reviewCells(cellIds: CellId[], answerOverrides: Record<CellId, string> = {}) {
    let nextScore = score
    let nextStreak = streak
    let nextBestStreak = bestStreak
    let correctCount = 0
    let wrongCount = 0
    const nextAccepted = new Set(accepted)
    let nextAnswers = { ...answers, ...answerOverrides }
    let nextErrorMarks = tickErrorMarks(errorMarks, cellIds.length)
    let nextShakeMarks = { ...shakeMarks }
    let nextSuccessMarks = { ...successMarks }
    let nextWrongAnswerMarks = { ...wrongAnswerMarks }

    cellIds.forEach((cellId) => {
      if (puzzle.clues.has(cellId) || nextAccepted.has(cellId)) {
        return
      }

      const answer = Number(nextAnswers[cellId])
      if (!Number.isFinite(answer) || nextAnswers[cellId]?.trim() === '') {
        return
      }

      if (answer === getCellValue(puzzle.solution, cellId)) {
        nextAccepted.add(cellId)
        delete nextErrorMarks[cellId]
        delete nextShakeMarks[cellId]
        delete nextWrongAnswerMarks[cellId]
        nextSuccessMarks[cellId] = Date.now() + correctCount + 1
        correctCount += 1
        nextStreak += 1
        nextBestStreak = Math.max(nextBestStreak, nextStreak)
        nextScore += nextStreak * 10
        return
      }

      wrongCount += 1
      nextStreak = 0
      delete nextSuccessMarks[cellId]
      nextShakeMarks[cellId] = Date.now() + wrongCount

      if (difficulty.key === 'hard') {
        delete nextWrongAnswerMarks[cellId]
        nextErrorMarks[cellId] = {
          remainingAnswers: 2,
          token: Date.now() + wrongCount,
        }
      } else {
        nextWrongAnswerMarks[cellId] = {
          token: Date.now() + wrongCount,
          value: nextAnswers[cellId] ?? '',
        }
      }
    })

    const nextMessage = correctCount > 0 && wrongCount === 0
      ? correctCount === 1 ? '¡Bien! Esa casilla está correcta.' : '¡Bien! Esas casillas están correctas.'
      : correctCount > 0 && wrongCount > 0
        ? 'Hay aciertos y también casillas para corregir.'
        : wrongCount > 0 && difficulty.key === 'hard'
          ? 'Revisa las casillas marcadas y sigue intentando.'
          : wrongCount > 0
            ? 'La respuesta se borró para intentarlo de nuevo.'
            : 'Completa una casilla antes de revisar.'

    dispatch({
      type: 'APPLY_REVIEW',
      payload: {
        accepted: nextAccepted,
        answers: nextAnswers,
        errorMarks: nextErrorMarks,
        shakeMarks: nextShakeMarks,
        successMarks: nextSuccessMarks,
        wrongAnswerMarks: nextWrongAnswerMarks,
        score: nextScore,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        message: nextMessage,
      },
    })
  }

  if (screen === 'setup') {
    return (
      <section
        className="arithmetic-pyramid board-game board-game-setup pyramid-setup"
        style={{ '--board-tone': difficulty.tone, '--pyramid-tone': difficulty.tone } as CSSProperties}
      >
        <div className="board-setup-shell pyramid-setup-shell">
          <div className="board-hero">
            <span className="task-badge">Suma y resta</span>
            <h2>Pirámide Aritmética</h2>
            <p>Elige dificultad y completa los bloques usando las relaciones entre casillas.</p>
          </div>

          <article className="board-setup-section">
            <div className="board-section-heading">
              <span>Dificultad</span>
              <strong>{difficulty.description}</strong>
            </div>

            <div className="board-choice-grid pyramid-difficulty-grid" role="radiogroup" aria-label="Dificultad">
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
                    <span className="pyramid-difficulty-topline">
                      <strong>{item.label}</strong>
                      <small>{item.numberRange}</small>
                    </span>
                    <DifficultyPyramidPreview rows={item.rows} />
                  </button>
                )
              })}
            </div>
          </article>

          <ActionButton className="board-start-button pyramid-start-button" onClick={() => startGame()}>
            Comenzar actividad
          </ActionButton>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`arithmetic-pyramid board-game arithmetic-pyramid-play arithmetic-pyramid--${difficulty.key}`}
      style={{ '--board-tone': difficulty.tone, '--pyramid-tone': difficulty.tone } as CSSProperties}
    >
      <div className="activity-back-row">
        <ActionButton onClick={backToMenu} variant="quiet">
          ← Volver al menú
        </ActionButton>
      </div>

      <div className="pyramid-layout">
        <div className="pyramid-workspace">
          <div
            className="pyramid-board"
            style={{ '--pyramid-rows': difficulty.rows } as CSSProperties}
            aria-label="Pirámide aritmética"
          >
            {puzzle.solution.map((row, rowIndex) => (
              <div className="pyramid-row-group" key={`row-${rowIndex}`}>
                <div className="pyramid-row">
                  {row.map((value, colIndex) => {
                    const cellId = makeCellId(rowIndex, colIndex)
                    const isClue = puzzle.clues.has(cellId)
                    const isAccepted = accepted.has(cellId)
                    const hasHardError = Boolean(errorMarks[cellId])
                    const hasSoftError = Boolean(wrongAnswerMarks[cellId])
                    const hasShake = Boolean(shakeMarks[cellId])
                    const hasSuccessPulse = Boolean(successMarks[cellId])
                    const isActive = activeCell === cellId
                    const blockColors = BLOCK_COLORS[difficulty.key]
                    const blockShadows = BLOCK_SHADOWS[difficulty.key]
                    const blockColor = blockColors[rowIndex % blockColors.length]
                    const blockShadow = blockShadows[rowIndex % blockShadows.length]

                    return (
                      <label
                        className={[
                          'pyramid-block',
                          isClue ? 'is-clue' : '',
                          isAccepted ? 'is-accepted' : '',
                          hasHardError || hasSoftError ? 'is-error' : '',
                          hasShake ? 'is-shaking' : '',
                          hasSuccessPulse ? 'is-success-pulse' : '',
                          isActive ? 'is-active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        key={cellId}
                        style={{ '--block-color': blockColor, '--block-shadow': blockShadow } as CSSProperties}
                      >
                        {isClue || isAccepted ? (
                          <strong>{value}</strong>
                        ) : (
                          <input
                            aria-label={`Casilla fila ${rowIndex + 1}, posición ${colIndex + 1}`}
                            inputMode="numeric"
                            onChange={(event) => updateAnswer(cellId, event.target.value)}
                            onFocus={() => dispatch({ type: 'SET_ACTIVE_CELL', cellId })}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                dispatch({ type: 'SET_ACTIVE_CELL', cellId })
                                reviewCells([cellId])
                              }
                            }}
                            type="text"
                            value={answers[cellId] ?? ''}
                          />
                        )}
                        <span className="sr-only">
                          {isClue ? 'Pista' : isAccepted ? 'Respuesta correcta' : hasHardError || hasSoftError ? 'Respuesta incorrecta' : 'Respuesta pendiente'}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {rowIndex < puzzle.solution.length - 1 ? (
                  <div className="pyramid-sign-row" aria-hidden="true">
                    {row.map((_, signIndex) => (
                      <span className={`pyramid-operation-sign pyramid-operation-sign--${puzzle.operationMode}`} key={signIndex}>
                        {operationSymbol}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

        </div>

        <aside className="pyramid-info-panel">
          <div className="pyramid-info-heading">
            <span className="task-badge">Dificultad {difficulty.label}</span>
            <h2>Completa la pirámide</h2>
            <FeedbackBanner
              className={!isComplete && !hasErrors ? 'pyramid-instruction' : ''}
              icon={!isComplete && !hasErrors
                ? puzzle.operationMode === 'sum'
                  ? <ArrowUp aria-hidden="true" size={18} />
                  : <ArrowDown aria-hidden="true" size={18} />
                : undefined}
              title={isComplete ? '¡Pirámide completa!' : hasErrors ? 'Revisa la respuesta' : undefined}
              tone={isComplete ? 'success' : hasErrors ? 'danger' : 'info'}
            >
              {message}
            </FeedbackBanner>
          </div>

          <div className="pyramid-info-pills" aria-label="Datos del ejercicio">
            <span>{operationLabel}</span>
            <span>{difficulty.rows} filas</span>
          </div>

          <div className="pyramid-score-grid pyramid-info-score-grid" aria-label="Puntaje">
            <ScoreCard label="Puntaje" value={score.toString()} />
            <ScoreCard label="Racha" value={streak.toString()} />
            <ScoreCard label="Mejor" value={bestStreak.toString()} />
            <ScoreCard label="Avance" value={`${completedCount}/${totalEditable}`} />
          </div>

          <ProgressBadge current={completedCount} label="Casillas completas" total={totalEditable} />

          {isComplete ? (
            <div className="pyramid-complete-note">
              <strong>¡Pirámide completa!</strong>
              <span>Puntaje final: {score} pts</span>
            </div>
          ) : null}

          <ActionButton className="pyramid-new-button" icon={<RotateCcw aria-hidden="true" size={18} />} onClick={startNewPuzzle} variant="secondary">
            Nueva pirámide
          </ActionButton>
        </aside>
      </div>

      <ConfirmDialog
        confirmLabel="Cambiar pirámide"
        description="Se perderán las respuestas y el puntaje de esta ronda."
        onCancel={cancelNewPuzzle}
        onConfirm={confirmNewPuzzle}
        open={showNewPuzzleConfirm}
        title="¿Cambiar la pirámide?"
        tone="danger"
      />
    </section>
  )
}

function DifficultyPyramidPreview({ rows }: { rows: number }) {
  return (
    <span className="pyramid-preview" aria-hidden="true">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <span className="pyramid-preview-row" key={rowIndex}>
          {Array.from({ length: rowIndex + 1 }, (_, blockIndex) => (
            <span className="pyramid-preview-block" key={blockIndex} />
          ))}
        </span>
      ))}
    </span>
  )
}

function ScoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="pyramid-score-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function getDifficulty(key: DifficultyKey) {
  return DIFFICULTIES.find((difficulty) => difficulty.key === key) ?? DIFFICULTIES[0]
}

function createPuzzle(difficulty: Difficulty, random: RandomSource = browserRandom): Puzzle {
  const solution = createSolution(difficulty, random)
  const totalCells = solution.reduce((total, row) => total + row.length, 0)
  const clueCount = Math.max(difficulty.rows, Math.round(totalCells * difficulty.revealRatio))
  const allCells = solution.flatMap((row, rowIndex) => row.map((_, colIndex) => makeCellId(rowIndex, colIndex)))
  const operationMode: OperationMode = random.next() > 0.5 ? 'sum' : 'subtract'
  const clues =
    operationMode === 'sum'
      ? createSumClues(solution, clueCount, random)
      : createSubtractClues(solution, totalCells - clueCount, random)

  return { clues, operationMode, solution }
}

function createSolution(difficulty: Difficulty, random: RandomSource) {
  const coefficients = getBaseCoefficients(difficulty.rows)
  const base = Array.from({ length: difficulty.rows }, () => 1)
  const targetTopValue = getTargetTopValue(difficulty, random)
  let remaining = targetTopValue - coefficients.reduce((total, coefficient) => total + coefficient, 0)

  while (remaining > 0) {
    const candidates = coefficients
      .map((coefficient, index) => ({ coefficient, index }))
      .filter(({ coefficient, index }) => coefficient <= remaining && base[index] < difficulty.maxBaseValue)

    if (candidates.length === 0) {
      break
    }

    const candidate = random.pick(candidates)
    base[candidate.index] += 1
    remaining -= candidate.coefficient
  }

  const rowsFromBase = [base]

  while (rowsFromBase[rowsFromBase.length - 1].length > 1) {
    const previous = rowsFromBase[rowsFromBase.length - 1]
    rowsFromBase.push(previous.slice(0, -1).map((value, index) => value + previous[index + 1]))
  }

  return rowsFromBase.reverse()
}

function getTargetTopValue(difficulty: Difficulty, random: RandomSource) {
  if (difficulty.key === 'easy') {
    return 10
  }

  if (difficulty.key === 'medium') {
    return random.int(33, 40)
  }

  return random.int(85, 100)
}

function getEditableCells(puzzle: Puzzle) {
  return puzzle.solution
    .flatMap((row, rowIndex) => row.map((_, colIndex) => makeCellId(rowIndex, colIndex)))
    .filter((cellId) => !puzzle.clues.has(cellId))
}

function createSumClues(solution: number[][], clueCount: number, random: RandomSource) {
  const baseRowIndex = solution.length - 1
  const clues = new Set<CellId>(solution[baseRowIndex].map((_, colIndex) => makeCellId(baseRowIndex, colIndex)))
  const upperCells = solution
    .slice(0, -1)
    .flatMap((row, rowIndex) => row.map((_, colIndex) => makeCellId(rowIndex, colIndex)))

  random.shuffle(upperCells).forEach((cellId) => {
    if (clues.size < clueCount) {
      clues.add(cellId)
    }
  })

  return clues
}

function createSubtractClues(solution: number[][], targetHiddenCount: number, random: RandomSource) {
  const allCells = solution.flatMap((row, rowIndex) => row.map((_, colIndex) => makeCellId(rowIndex, colIndex)))
  const candidates = allCells.filter((cellId) => !cellId.startsWith('0-'))
  let hidden = new Set<CellId>()

  for (let attempt = 0; attempt < 90; attempt += 1) {
    const nextHidden = new Set<CellId>()

    random.shuffle(candidates).forEach((cellId) => {
      if (nextHidden.size >= targetHiddenCount) {
        return
      }

      nextHidden.add(cellId)
      if (!canSolveEveryHiddenCell(solution, nextHidden)) {
        nextHidden.delete(cellId)
      }
    })

    if (nextHidden.size > hidden.size) {
      hidden = nextHidden
    }

    if (hidden.size >= targetHiddenCount) {
      break
    }
  }

  return new Set(allCells.filter((cellId) => !hidden.has(cellId)))
}

function canSolveEveryHiddenCell(solution: number[][], hidden: Set<CellId>) {
  return [...hidden].every((cellId) => canSolveHiddenCellWithSubtraction(solution, cellId, hidden))
}

function canSolveHiddenCellWithSubtraction(solution: number[][], cellId: CellId, hidden: Set<CellId>) {
  const [row, col] = cellId.split('-').map(Number)

  if (row === 0 || !solution[row]) {
    return false
  }

  const rightParent = makeCellId(row - 1, col)
  const rightSibling = makeCellId(row, col + 1)
  const canUseRightPair =
    col < solution[row - 1].length &&
    col + 1 < solution[row].length &&
    !hidden.has(rightParent) &&
    !hidden.has(rightSibling)

  const leftParent = makeCellId(row - 1, col - 1)
  const leftSibling = makeCellId(row, col - 1)
  const canUseLeftPair =
    col > 0 &&
    col - 1 < solution[row - 1].length &&
    !hidden.has(leftParent) &&
    !hidden.has(leftSibling)

  return canUseRightPair || canUseLeftPair
}

function getBaseCoefficients(rows: number) {
  const coefficients = [1]

  while (coefficients.length < rows) {
    const next = [1]
    for (let index = 0; index < coefficients.length - 1; index += 1) {
      next.push(coefficients[index] + coefficients[index + 1])
    }
    next.push(1)
    coefficients.splice(0, coefficients.length, ...next)
  }

  return coefficients
}

function makeCellId(row: number, col: number): CellId {
  return `${row}-${col}`
}

function getCellValue(solution: number[][], cellId: CellId) {
  const [row, col] = cellId.split('-').map(Number)
  return solution[row]?.[col]
}

function tickErrorMarks(errorMarks: Record<CellId, ErrorMark>, answerCount: number) {
  const nextMarks: Record<CellId, ErrorMark> = {}

  Object.entries(errorMarks).forEach(([cellId, mark]) => {
    const remainingAnswers = mark.remainingAnswers - answerCount
    if (remainingAnswers > 0) {
      nextMarks[cellId as CellId] = { ...mark, remainingAnswers }
    }
  })

  return nextMarks
}
