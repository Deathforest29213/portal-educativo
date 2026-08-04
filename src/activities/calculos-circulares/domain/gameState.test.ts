import { describe, expect, it } from 'vitest'
import { createCircularGameState, circularGameReducer } from './gameState'
import { createCircularPuzzle } from './puzzle'
import { SeededRandomSource } from '../../../platform/random/RandomSource'

const random = new SeededRandomSource(17)
const puzzle = createCircularPuzzle({ maxNumber: 10, emptyCells: 3, operations: ['+'] }, random)

describe('circularGameReducer', () => {
  it('permite corregir una ronda equivocada y solo crea racha en una ronda perfecta', () => {
    let state = circularGameReducer(createCircularGameState(puzzle), { type: 'START_GAME', puzzle, sessionGoal: 5 })
    const [firstBlank, ...otherBlanks] = [...puzzle.blanks]

    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: firstBlank, value: '99' })
    otherBlanks.forEach((cellId) => {
      state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId, value: puzzle.values[cellId].toString() })
    })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    expect(state.screen).toBe('playing')
    expect(state.streak).toBe(0)
    expect(state.wrongCells.has(firstBlank)).toBe(true)
    expect(state.correctCells.size).toBe(otherBlanks.length)
    expect(state.feedbackVersion).toBe(1)

    const lockedCell = otherBlanks[0]
    const lockedValue = state.answers[lockedCell]
    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: lockedCell, value: '0' })
    expect(state.answers[lockedCell]).toBe(lockedValue)
    expect(state.correctCells.has(lockedCell)).toBe(true)

    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: firstBlank, value: puzzle.values[firstBlank].toString() })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    expect(state.screen).toBe('completed')
    expect(state.streak).toBe(0)
    expect(state.score).toBeGreaterThan(0)
    expect(state.correctCells).toEqual(puzzle.blanks)
    expect(state.feedbackVersion).toBe(2)
    expect(state.roundResults).toEqual(['effort'])
    expect(state.roundAttempts).toBe(2)
  })

  it('clasifica el resultado por los intentos y termina después de cinco círculos', () => {
    let state = circularGameReducer(createCircularGameState(puzzle), { type: 'START_GAME', puzzle, sessionGoal: 5 })

    for (let round = 0; round < 5; round += 1) {
      for (const cellId of puzzle.blanks) {
        state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId, value: puzzle.values[cellId].toString() })
      }
      state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })

      if (round < 4) {
        state = circularGameReducer(state, { type: 'NEXT_ROUND', puzzle })
      }
    }

    expect(state.roundResults).toEqual(['star', 'star', 'star', 'star', 'star'])
    expect(state.screen).toBe('session-completed')
  })

  it('no cuenta revisiones incompletas y registra Desafío desde el cuarto intento', () => {
    let state = circularGameReducer(createCircularGameState(puzzle), { type: 'START_GAME', puzzle, sessionGoal: 5 })
    const [firstBlank, ...otherBlanks] = [...puzzle.blanks]

    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    expect(state.roundAttempts).toBe(0)

    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: firstBlank, value: '99' })
    otherBlanks.forEach((cellId) => {
      state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId, value: puzzle.values[cellId].toString() })
    })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: firstBlank, value: puzzle.values[firstBlank].toString() })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })

    expect(state.roundAttempts).toBe(4)
    expect(state.roundResults).toEqual(['challenge'])
  })

  it('limita las opciones personalizadas al rango acordado', () => {
    let state = createCircularGameState(puzzle)
    state = circularGameReducer(state, { type: 'SET_CUSTOM_MAX_NUMBER', value: 99 })
    state = circularGameReducer(state, { type: 'SET_CUSTOM_EMPTY_CELLS', value: 1 })
    state = circularGameReducer(state, { type: 'SET_CUSTOM_SESSION_GOAL', value: 99 })

    expect(state.customMaxNumber).toBe(30)
    expect(state.customEmptyCells).toBe(3)
    expect(state.customSessionGoal).toBe(10)
  })

  it('cierra una sesión personalizada al alcanzar su meta', () => {
    let state = circularGameReducer(createCircularGameState(puzzle), { type: 'START_GAME', puzzle, sessionGoal: 2 })

    for (let round = 0; round < 2; round += 1) {
      for (const cellId of puzzle.blanks) {
        state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId, value: puzzle.values[cellId].toString() })
      }
      state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
      if (round === 0) state = circularGameReducer(state, { type: 'NEXT_ROUND', puzzle })
    }

    expect(state.sessionGoal).toBe(2)
    expect(state.screen).toBe('session-completed')
  })
})
