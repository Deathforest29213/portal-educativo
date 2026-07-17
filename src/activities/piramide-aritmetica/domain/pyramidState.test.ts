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

  it('elimina una respuesta vencida solo si coincide con su marca', () => {
    let state = createPyramidState('easy', puzzle)
    state = pyramidReducer(state, { type: 'ANSWER_CHANGED', cellId: '1-0', value: '7' })
    state = {
      ...state,
      wrongAnswerMarks: { '1-0': { token: 10, value: '7' } },
    }

    const stale = pyramidReducer(state, {
      type: 'EXPIRE_WRONG_ANSWERS',
      marks: [['1-0', { token: 9, value: '7' }]],
    })
    const expired = pyramidReducer(state, {
      type: 'EXPIRE_WRONG_ANSWERS',
      marks: [['1-0', { token: 10, value: '7' }]],
    })

    expect(stale.answers['1-0']).toBe('7')
    expect(expired.answers['1-0']).toBe('')
    expect(expired.wrongAnswerMarks['1-0']).toBeUndefined()
  })
})
