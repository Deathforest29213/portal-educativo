export type DifficultyKey = 'easy' | 'medium' | 'hard'
export type CellId = `${number}-${number}`
export type PyramidScreen = 'setup' | 'playing'
export type OperationMode = 'sum' | 'subtract'

export type Difficulty = {
  key: DifficultyKey
  label: string
  maxBaseValue: number
  rows: number
  numberRange: string
  maxValue: number
  revealRatio: number
  tone: string
  description: string
}

export type Puzzle = {
  clues: Set<CellId>
  operationMode: OperationMode
  solution: number[][]
}

export type ErrorMark = { remainingAnswers: number; token: number }
export type WrongAnswerMark = { token: number; value: string }

export type PyramidState = {
  screen: PyramidScreen
  difficultyKey: DifficultyKey
  puzzle: Puzzle
  answers: Record<CellId, string>
  accepted: Set<CellId>
  errorMarks: Record<CellId, ErrorMark>
  shakeMarks: Record<CellId, number>
  successMarks: Record<CellId, number>
  wrongAnswerMarks: Record<CellId, WrongAnswerMark>
  activeCell: CellId | null
  score: number
  streak: number
  bestStreak: number
  message: string
  showNewPuzzleConfirm: boolean
}

type ReviewPayload = Pick<
  PyramidState,
  | 'accepted'
  | 'answers'
  | 'errorMarks'
  | 'shakeMarks'
  | 'successMarks'
  | 'wrongAnswerMarks'
  | 'score'
  | 'streak'
  | 'bestStreak'
  | 'message'
>

export type PyramidCommand =
  | { type: 'SELECT_DIFFICULTY'; difficultyKey: DifficultyKey }
  | { type: 'START_GAME'; difficultyKey: DifficultyKey; puzzle: Puzzle; message: string }
  | { type: 'BACK_TO_MENU' }
  | { type: 'REQUEST_NEW_PUZZLE' }
  | { type: 'CANCEL_NEW_PUZZLE' }
  | { type: 'ANSWER_CHANGED'; cellId: CellId; value: string }
  | { type: 'SET_ACTIVE_CELL'; cellId: CellId | null }
  | { type: 'APPLY_REVIEW'; payload: ReviewPayload }
  | { type: 'CLEAR_SHAKES'; marks: Array<[CellId, number]> }
  | { type: 'CLEAR_SUCCESSES'; marks: Array<[CellId, number]> }
  | { type: 'EXPIRE_WRONG_ANSWERS'; marks: Array<[CellId, WrongAnswerMark]> }

export function createPyramidState(difficultyKey: DifficultyKey, puzzle: Puzzle): PyramidState {
  return {
    screen: 'setup',
    difficultyKey,
    puzzle,
    answers: {},
    accepted: new Set(),
    errorMarks: {},
    shakeMarks: {},
    successMarks: {},
    wrongAnswerMarks: {},
    activeCell: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
    message: 'Elige una dificultad para comenzar.',
    showNewPuzzleConfirm: false,
  }
}

export function pyramidReducer(state: PyramidState, command: PyramidCommand): PyramidState {
  switch (command.type) {
    case 'SELECT_DIFFICULTY':
      return { ...state, difficultyKey: command.difficultyKey }
    case 'START_GAME':
      return {
        ...createPyramidState(command.difficultyKey, command.puzzle),
        screen: 'playing',
        message: command.message,
      }
    case 'BACK_TO_MENU':
      return { ...state, screen: 'setup', message: 'Elige una dificultad para comenzar.' }
    case 'REQUEST_NEW_PUZZLE':
      return { ...state, showNewPuzzleConfirm: true }
    case 'CANCEL_NEW_PUZZLE':
      return { ...state, showNewPuzzleConfirm: false }
    case 'ANSWER_CHANGED': {
      const wrongAnswerMarks = { ...state.wrongAnswerMarks }
      delete wrongAnswerMarks[command.cellId]
      return {
        ...state,
        answers: { ...state.answers, [command.cellId]: command.value },
        wrongAnswerMarks,
      }
    }
    case 'SET_ACTIVE_CELL':
      return { ...state, activeCell: command.cellId }
    case 'APPLY_REVIEW':
      return { ...state, ...command.payload }
    case 'CLEAR_SHAKES':
      return { ...state, shakeMarks: clearMatchingMarks(state.shakeMarks, command.marks) }
    case 'CLEAR_SUCCESSES':
      return { ...state, successMarks: clearMatchingMarks(state.successMarks, command.marks) }
    case 'EXPIRE_WRONG_ANSWERS': {
      const answers = { ...state.answers }
      const wrongAnswerMarks = { ...state.wrongAnswerMarks }

      command.marks.forEach(([cellId, mark]) => {
        if (wrongAnswerMarks[cellId]?.token === mark.token) {
          if (answers[cellId] === mark.value) answers[cellId] = ''
          delete wrongAnswerMarks[cellId]
        }
      })

      return { ...state, answers, wrongAnswerMarks }
    }
    default:
      return state
  }
}

function clearMatchingMarks(
  current: Record<CellId, number>,
  marks: Array<[CellId, number]>,
) {
  const next = { ...current }
  marks.forEach(([cellId, token]) => {
    if (next[cellId] === token) delete next[cellId]
  })
  return next
}
