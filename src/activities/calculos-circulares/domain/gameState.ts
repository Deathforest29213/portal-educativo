import { CIRCULAR_SESSION_ROUNDS, CUSTOM_CIRCULAR_DEFAULTS, MAX_CIRCULAR_NUMBER, MAX_EMPTY_CELLS, MIN_CIRCULAR_NUMBER, MIN_EMPTY_CELLS } from '../data/config'
import type {
  CircularCellId,
  CircularDifficultyKey,
  CircularLineId,
  CircularOperation,
  CircularPuzzle,
} from '../types'

export type CircularScreen = 'setup' | 'playing' | 'completed' | 'session-completed'
export type CircularRoundResult = 'star' | 'effort' | 'challenge'

export type CircularGameState = {
  answers: Record<CircularCellId, string>
  bestStreak: number
  completedRounds: number
  correctCells: Set<CircularCellId>
  customEmptyCells: number
  customMaxNumber: number
  customOperations: CircularOperation[]
  difficultyKey: CircularDifficultyKey
  feedbackVersion: number
  hadError: boolean
  hintedLine: CircularLineId | null
  message: string
  puzzle: CircularPuzzle
  roundAttempts: number
  roundResults: CircularRoundResult[]
  score: number
  screen: CircularScreen
  streak: number
  wrongCells: Set<CircularCellId>
}

export type CircularCommand =
  | { type: 'SELECT_DIFFICULTY'; difficultyKey: CircularDifficultyKey }
  | { type: 'SET_CUSTOM_MAX_NUMBER'; value: number }
  | { type: 'SET_CUSTOM_EMPTY_CELLS'; value: number }
  | { type: 'TOGGLE_CUSTOM_OPERATION'; operation: CircularOperation }
  | { type: 'START_GAME'; puzzle: CircularPuzzle }
  | { type: 'ANSWER_CHANGED'; cellId: CircularCellId; value: string }
  | { type: 'SUBMIT_ROUND' }
  | { type: 'SHOW_HINT'; lineId: CircularLineId }
  | { type: 'CLEAR_HINT' }
  | { type: 'NEXT_ROUND'; puzzle: CircularPuzzle }
  | { type: 'BACK_TO_MENU' }

export function createCircularGameState(puzzle: CircularPuzzle): CircularGameState {
  return {
    screen: 'setup',
    difficultyKey: 'easy',
    customMaxNumber: CUSTOM_CIRCULAR_DEFAULTS.maxNumber,
    customEmptyCells: CUSTOM_CIRCULAR_DEFAULTS.emptyCells,
    customOperations: CUSTOM_CIRCULAR_DEFAULTS.operations,
    puzzle,
    answers: {} as Record<CircularCellId, string>,
    correctCells: new Set(),
    wrongCells: new Set(),
    feedbackVersion: 0,
    hintedLine: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
    completedRounds: 0,
    roundAttempts: 0,
    roundResults: [],
    hadError: false,
    message: 'Elige una dificultad para comenzar.',
  }
}

export function circularGameReducer(state: CircularGameState, command: CircularCommand): CircularGameState {
  switch (command.type) {
    case 'SELECT_DIFFICULTY':
      return { ...state, difficultyKey: command.difficultyKey }
    case 'SET_CUSTOM_MAX_NUMBER':
      return { ...state, customMaxNumber: clamp(command.value, MIN_CIRCULAR_NUMBER, MAX_CIRCULAR_NUMBER) }
    case 'SET_CUSTOM_EMPTY_CELLS':
      return { ...state, customEmptyCells: clamp(command.value, MIN_EMPTY_CELLS, MAX_EMPTY_CELLS) }
    case 'TOGGLE_CUSTOM_OPERATION':
      return {
        ...state,
        customOperations: state.customOperations.includes(command.operation)
          ? state.customOperations.filter((operation) => operation !== command.operation)
          : [...state.customOperations, command.operation],
      }
    case 'START_GAME':
      return {
        ...state,
        screen: 'playing',
        puzzle: command.puzzle,
        answers: {} as Record<CircularCellId, string>,
        correctCells: new Set(),
        wrongCells: new Set(),
        feedbackVersion: 0,
        hintedLine: null,
        score: 0,
        streak: 0,
        bestStreak: 0,
        completedRounds: 0,
        roundAttempts: 0,
        roundResults: [],
        hadError: false,
        message: 'Completa todas las casillas y revisa las operaciones conectadas.',
      }
    case 'ANSWER_CHANGED': {
      const cleanValue = /^\d{0,2}$/.test(command.value) ? command.value : state.answers[command.cellId] ?? ''
      const wrongCells = new Set(state.wrongCells)
      const correctCells = new Set(state.correctCells)
      wrongCells.delete(command.cellId)
      correctCells.delete(command.cellId)
      return {
        ...state,
        answers: { ...state.answers, [command.cellId]: cleanValue },
        wrongCells,
        correctCells,
        hintedLine: null,
      }
    }
    case 'SUBMIT_ROUND':
      return reviewRound(state)
    case 'SHOW_HINT':
      return { ...state, hintedLine: command.lineId, message: 'Observa la ecuación destacada y relaciónala con sus tres casillas.' }
    case 'CLEAR_HINT':
      return { ...state, hintedLine: null }
    case 'NEXT_ROUND':
      return {
        ...state,
        screen: 'playing',
        puzzle: command.puzzle,
        answers: {} as Record<CircularCellId, string>,
        correctCells: new Set(),
        wrongCells: new Set(),
        feedbackVersion: 0,
        hintedLine: null,
        roundAttempts: 0,
        hadError: false,
        message: 'Nueva ronda: completa todas las casillas antes de revisar.',
      }
    case 'BACK_TO_MENU':
      return {
        ...state,
        screen: 'setup',
        hintedLine: null,
        correctCells: new Set(),
        wrongCells: new Set(),
        roundAttempts: 0,
        roundResults: [],
        message: 'Elige una dificultad para comenzar.',
      }
    default:
      return state
  }
}

function reviewRound(state: CircularGameState): CircularGameState {
  const blankCells = [...state.puzzle.blanks]
  const missing = blankCells.filter((cellId) => !state.answers[cellId]?.trim())
  if (missing.length > 0) {
    return {
      ...state,
      message: `Faltan ${missing.length} ${missing.length === 1 ? 'casilla' : 'casillas'} por completar.`,
    }
  }

  const wrongCells = new Set(blankCells.filter((cellId) => Number(state.answers[cellId]) !== state.puzzle.values[cellId]))
  const correctCells = new Set(blankCells.filter((cellId) => !wrongCells.has(cellId)))
  if (wrongCells.size > 0) {
    return {
      ...state,
      correctCells,
      feedbackVersion: state.feedbackVersion + 1,
      wrongCells,
      hintedLine: null,
      hadError: true,
      roundAttempts: state.roundAttempts + 1,
      streak: 0,
      message: `${wrongCells.size} ${wrongCells.size === 1 ? 'casilla necesita' : 'casillas necesitan'} corrección. ¡Puedes intentarlo otra vez!`,
    }
  }

  const cleanRound = !state.hadError
  const attempts = state.roundAttempts + 1
  const roundResult = getRoundResult(attempts)
  const roundResults = [...state.roundResults, roundResult]
  const streak = cleanRound ? state.streak + 1 : 0
  const roundPoints = state.puzzle.blanks.size * 10 + (cleanRound ? streak * 5 : 0)

  return {
    ...state,
    screen: roundResults.length >= CIRCULAR_SESSION_ROUNDS ? 'session-completed' : 'completed',
    correctCells,
    feedbackVersion: state.feedbackVersion + 1,
    wrongCells: new Set(),
    hintedLine: null,
    score: state.score + roundPoints,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    completedRounds: state.completedRounds + 1,
    roundAttempts: attempts,
    roundResults,
    message: cleanRound
      ? `¡Círculo perfecto! Ganas ${roundPoints} puntos y tu racha crece.`
      : `¡Círculo resuelto! Ganas ${roundPoints} puntos; la próxima ronda puede recuperar la racha.`,
  }
}

function getRoundResult(attempts: number): CircularRoundResult {
  if (attempts === 1) return 'star'
  if (attempts <= 3) return 'effort'
  return 'challenge'
}

function clamp(value: number, minimum: number, maximum: number) {
  const safeValue = Number.isFinite(value) ? Math.trunc(value) : minimum
  return Math.max(minimum, Math.min(maximum, safeValue))
}
