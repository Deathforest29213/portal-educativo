import { PLAYER_PRESETS, getDifficulty } from '../data/config'
import { cellKey, getLineBonuses, makePlayers } from './board'
import type { ClaimedCell, DifficultyKey, Player, PlayerPreset, Roll } from '../types'

export type BoardScreen = 'setup' | 'playing' | 'finished'
export type BoardFeedback = 'correct' | 'wrong' | null

export type BoardGameState = {
  screen: BoardScreen
  difficultyKey: DifficultyKey
  playerCount: number
  playerPresets: PlayerPreset[]
  players: Player[]
  currentPlayerIndex: number
  claimed: Record<string, ClaimedCell>
  roll: Roll | null
  answer: string
  feedback: BoardFeedback
  message: string
  awardedLineKeys: Set<string>
  rollsThisTurn: number
  isRolling: boolean
  showFinishConfirm: boolean
}

export type BoardCommand =
  | { type: 'SELECT_DIFFICULTY'; difficultyKey: DifficultyKey }
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'SET_PLAYER_NAME'; playerIndex: number; name: string }
  | { type: 'START_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'REQUEST_FINISH' }
  | { type: 'CANCEL_FINISH' }
  | { type: 'CONFIRM_FINISH' }
  | { type: 'ROLL_REQUESTED'; roll: Roll | null }
  | { type: 'ROLL_ANIMATION_FINISHED' }
  | { type: 'ANSWER_CHANGED'; answer: string }
  | { type: 'SUBMIT_ANSWER' }

export function createBoardGameState(): BoardGameState {
  return {
    screen: 'setup',
    difficultyKey: 'easy',
    playerCount: 3,
    playerPresets: PLAYER_PRESETS,
    players: [],
    currentPlayerIndex: 0,
    claimed: {},
    roll: null,
    answer: '',
    feedback: null,
    message: 'Tira los dados para comenzar el turno.',
    awardedLineKeys: new Set(),
    rollsThisTurn: 0,
    isRolling: false,
    showFinishConfirm: false,
  }
}

export function boardGameReducer(state: BoardGameState, command: BoardCommand): BoardGameState {
  switch (command.type) {
    case 'SELECT_DIFFICULTY':
      return { ...state, difficultyKey: command.difficultyKey }
    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: command.count }
    case 'SET_PLAYER_NAME':
      return {
        ...state,
        playerPresets: state.playerPresets.map((player, index) =>
          index === command.playerIndex ? { ...player, name: command.name } : player,
        ),
      }
    case 'START_GAME':
      return startGame(state)
    case 'RESET_GAME':
      return returnToSetup(state)
    case 'REQUEST_FINISH':
      return { ...state, showFinishConfirm: true }
    case 'CANCEL_FINISH':
      return { ...state, showFinishConfirm: false }
    case 'CONFIRM_FINISH':
      return returnToSetup(state)
    case 'ROLL_REQUESTED':
      return requestRoll(state, command.roll)
    case 'ROLL_ANIMATION_FINISHED':
      return { ...state, isRolling: false }
    case 'ANSWER_CHANGED':
      return { ...state, answer: command.answer }
    case 'SUBMIT_ANSWER':
      return submitAnswer(state)
    default:
      return state
  }
}

function returnToSetup(state: BoardGameState): BoardGameState {
  return {
    ...createBoardGameState(),
    difficultyKey: state.difficultyKey,
    playerCount: state.playerCount,
    playerPresets: state.playerPresets,
  }
}

function startGame(state: BoardGameState): BoardGameState {
  const players = makePlayers(state.playerCount, state.playerPresets.slice(0, state.playerCount))

  return {
    ...state,
    screen: 'playing',
    players,
    currentPlayerIndex: 0,
    claimed: {},
    roll: null,
    answer: '',
    feedback: null,
    message: `${players[0].name} parte tirando los dados.`,
    awardedLineKeys: new Set(),
    rollsThisTurn: 0,
    isRolling: false,
    showFinishConfirm: false,
  }
}

function requestRoll(state: BoardGameState, roll: Roll | null): BoardGameState {
  const currentPlayer = state.players[state.currentPlayerIndex]
  if (!currentPlayer) return state

  if (!roll) {
    return {
      ...state,
      roll: null,
      answer: '',
      feedback: null,
      isRolling: false,
      screen: 'finished',
      message: 'No quedan casillas disponibles para esta dificultad.',
    }
  }

  return {
    ...state,
    roll,
    answer: '',
    feedback: null,
    isRolling: true,
    rollsThisTurn: Math.min(state.rollsThisTurn + 1, 2),
    message: `${currentPlayer.name}, resuelve la operación para marcar la casilla.`,
  }
}

function submitAnswer(state: BoardGameState): BoardGameState {
  const { roll } = state
  const currentPlayer = state.players[state.currentPlayerIndex]
  if (!roll || !currentPlayer || state.isRolling || state.answer.trim() === '') return state

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
  const numericAnswer = Number(state.answer)

  if (!Number.isFinite(numericAnswer) || numericAnswer !== roll.answer) {
    return {
      ...state,
      feedback: 'wrong',
      roll: null,
      answer: '',
      rollsThisTurn: 0,
      isRolling: false,
      currentPlayerIndex: nextPlayerIndex,
      message: `${currentPlayer.name} pierde el turno. Sigue ${state.players[nextPlayerIndex].name}.`,
    }
  }

  const difficulty = getDifficulty(state.difficultyKey)
  const nextClaimed = {
    ...state.claimed,
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
    state.awardedLineKeys,
  )
  const bonusPoints = bonusLines.length * 2
  const nextPlayers = state.players.map((player) =>
    player.id === currentPlayer.id ? { ...player, score: player.score + 1 + bonusPoints } : player,
  )
  const nextAwarded = new Set(state.awardedLineKeys)
  bonusLines.forEach((bonusKey) => nextAwarded.add(bonusKey))
  const boardIsComplete = Object.keys(nextClaimed).length >= (difficulty.maxNumber + 1) ** 2

  return {
    ...state,
    claimed: nextClaimed,
    players: nextPlayers,
    awardedLineKeys: nextAwarded,
    feedback: 'correct',
    roll: null,
    answer: '',
    rollsThisTurn: 0,
    isRolling: false,
    screen: boardIsComplete ? 'finished' : state.screen,
    currentPlayerIndex: boardIsComplete ? state.currentPlayerIndex : nextPlayerIndex,
    message: boardIsComplete
      ? 'Tablero completo. Revisen el puntaje final.'
      : bonusPoints > 0
        ? `${currentPlayer.name} gana ${1 + bonusPoints} puntos. Sigue ${nextPlayers[nextPlayerIndex].name}.`
        : `${currentPlayer.name} marca la casilla. Sigue ${nextPlayers[nextPlayerIndex].name}.`,
  }
}
