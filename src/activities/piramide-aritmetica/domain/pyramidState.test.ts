import { describe, expect, it } from 'vitest'
import { createPyramidState, pyramidReducer, type Puzzle } from './pyramidState'

const puzzle: Puzzle = {
  clues: new Set(['0-0']),
  operationMode: 'sum',
  solution: [[1, 2], [3]],
}

describe('pyramidReducer', () => {
  it('inicia una partida y conserva el estado como transición pura', () => {
    const initial = createPyramidState('easy', puzzle)
    const next = pyramidReducer(initial, {
      type: 'START_GAME',
      difficultyKey: 'medium',
      puzzle,
      message: 'Completa la pirámide.',
    })

    expect(next.screen).toBe('playing')
    expect(next.difficultyKey).toBe('medium')
    expect(next.message).toBe('Completa la pirámide.')
    expect(initial.screen).toBe('setup')
  })

  it('conserva la respuesta incorrecta hasta que la persona la corrija', () => {
    let state = createPyramidState('easy', puzzle)
    state = pyramidReducer(state, { type: 'ANSWER_CHANGED', cellId: '1-0', value: '7' })
    state = {
      ...state,
      wrongAnswerMarks: { '1-0': { token: 10 } },
    }

    const corrected = pyramidReducer(state, { type: 'ANSWER_CHANGED', cellId: '1-0', value: '3' })

    expect(state.answers['1-0']).toBe('7')
    expect(state.wrongAnswerMarks['1-0']).toEqual({ token: 10 })
    expect(corrected.answers['1-0']).toBe('3')
    expect(corrected.wrongAnswerMarks['1-0']).toBeUndefined()
  })
})
