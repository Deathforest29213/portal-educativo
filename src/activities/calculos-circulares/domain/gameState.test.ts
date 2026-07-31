import { describe, expect, it } from 'vitest'
import { createCircularGameState, circularGameReducer } from './gameState'
import { createCircularPuzzle } from './puzzle'
import { SeededRandomSource } from '../../../platform/random/RandomSource'

const random = new SeededRandomSource(17)
const puzzle = createCircularPuzzle({ maxNumber: 10, emptyCells: 3, operations: ['+'] }, random)

describe('circularGameReducer', () => {
  it('permite corregir una ronda equivocada y solo crea racha en una ronda perfecta', () => {
    let state = circularGameReducer(createCircularGameState(puzzle), { type: 'START_GAME', puzzle })
    const [firstBlank, ...otherBlanks] = [...puzzle.blanks]

    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: firstBlank, value: '99' })
    otherBlanks.forEach((cellId) => {
      state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId, value: puzzle.values[cellId].toString() })
    })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    expect(state.screen).toBe('playing')
    expect(state.streak).toBe(0)
    expect(state.wrongCells.has(firstBlank)).toBe(true)

    state = circularGameReducer(state, { type: 'ANSWER_CHANGED', cellId: firstBlank, value: puzzle.values[firstBlank].toString() })
    state = circularGameReducer(state, { type: 'SUBMIT_ROUND' })
    expect(state.screen).toBe('completed')
    expect(state.streak).toBe(0)
    expect(state.score).toBeGreaterThan(0)
  })

  it('limita las opciones personalizadas al rango acordado', () => {
    let state = createCircularGameState(puzzle)
    state = circularGameReducer(state, { type: 'SET_CUSTOM_MAX_NUMBER', value: 99 })
    state = circularGameReducer(state, { type: 'SET_CUSTOM_EMPTY_CELLS', value: 1 })

    expect(state.customMaxNumber).toBe(30)
    expect(state.customEmptyCells).toBe(3)
  })
})
