import { describe, expect, it } from 'vitest'
import { boardGameReducer, createBoardGameState } from './gameState'
import type { Roll } from '../types'

const roll: Roll = { row: 1, col: 2, operation: '+', answer: 3, prompt: '1 + 2' }

describe('boardGameReducer', () => {
  it('recorre el turno correcto mediante comandos', () => {
    let state = boardGameReducer(createBoardGameState(), { type: 'START_GAME' })
    state = boardGameReducer(state, { type: 'ROLL_REQUESTED', roll })
    expect(state.isRolling).toBe(true)

    state = boardGameReducer(state, { type: 'ROLL_ANIMATION_FINISHED' })
    state = boardGameReducer(state, { type: 'ANSWER_CHANGED', answer: '3' })
    state = boardGameReducer(state, { type: 'SUBMIT_ANSWER' })

    expect(state.feedback).toBe('correct')
    expect(state.claimed['1-2']?.playerId).toBe(state.players[0].id)
    expect(state.players[0].score).toBe(1)
    expect(state.currentPlayerIndex).toBe(1)
  })

  it('cede el turno después de una respuesta incorrecta', () => {
    let state = boardGameReducer(createBoardGameState(), { type: 'START_GAME' })
    state = boardGameReducer(state, { type: 'ROLL_REQUESTED', roll })
    state = boardGameReducer(state, { type: 'ROLL_ANIMATION_FINISHED' })
    state = boardGameReducer(state, { type: 'ANSWER_CHANGED', answer: '99' })
    state = boardGameReducer(state, { type: 'SUBMIT_ANSWER' })

    expect(state.feedback).toBe('wrong')
    expect(state.currentPlayerIndex).toBe(1)
    expect(state.claimed).toEqual({})
  })

  it('requiere confirmación y vuelve al menú al terminar una partida', () => {
    let state = boardGameReducer(createBoardGameState(), {
      type: 'SELECT_DIFFICULTY',
      difficultyKey: 'expert',
    })
    state = boardGameReducer(state, { type: 'SET_PLAYER_COUNT', count: 4 })
    state = boardGameReducer(state, { type: 'START_GAME' })

    state = boardGameReducer(state, { type: 'REQUEST_FINISH' })
    expect(state.screen).toBe('playing')
    expect(state.showFinishConfirm).toBe(true)

    state = boardGameReducer(state, { type: 'CANCEL_FINISH' })
    expect(state.screen).toBe('playing')
    expect(state.showFinishConfirm).toBe(false)

    state = boardGameReducer(state, { type: 'REQUEST_FINISH' })
    state = boardGameReducer(state, { type: 'CONFIRM_FINISH' })
    expect(state.screen).toBe('setup')
    expect(state.showFinishConfirm).toBe(false)
    expect(state.players).toEqual([])
    expect(state.claimed).toEqual({})
    expect(state.difficultyKey).toBe('expert')
    expect(state.playerCount).toBe(4)
  })

  it('conserva la configuración personalizada y exige al menos una operación', () => {
    let state = boardGameReducer(createBoardGameState(), {
      type: 'SELECT_DIFFICULTY',
      difficultyKey: 'custom',
    })
    state = boardGameReducer(state, { type: 'TOGGLE_CUSTOM_OPERATION', operation: '+' })
    state = boardGameReducer(state, { type: 'START_GAME' })
    expect(state.screen).toBe('setup')

    state = boardGameReducer(state, { type: 'TOGGLE_CUSTOM_OPERATION', operation: '-' })
    state = boardGameReducer(state, { type: 'SET_CUSTOM_MAX_NUMBER', maxNumber: 99 })
    expect(state.customMaxNumber).toBe(9)
    state = boardGameReducer(state, { type: 'SET_CUSTOM_MAX_NUMBER', maxNumber: 8 })
    state = boardGameReducer(state, { type: 'START_GAME' })
    expect(state.screen).toBe('playing')

    state = boardGameReducer(state, { type: 'RESET_GAME' })
    expect(state.difficultyKey).toBe('custom')
    expect(state.customMaxNumber).toBe(8)
    expect(state.customOperations).toEqual(['-'])
  })

  it('rechaza respuestas que no sean enteros no negativos', () => {
    let state = boardGameReducer(createBoardGameState(), { type: 'START_GAME' })
    state = boardGameReducer(state, { type: 'ROLL_REQUESTED', roll })
    state = boardGameReducer(state, { type: 'ROLL_ANIMATION_FINISHED' })
    state = boardGameReducer(state, { type: 'ANSWER_CHANGED', answer: '-3' })

    expect(state.answer).toBe('')
  })
})
