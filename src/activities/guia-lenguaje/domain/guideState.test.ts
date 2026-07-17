import { describe, expect, it } from 'vitest'
import { createGuideState, getResultTaskKeys, guideReducer, type TaskResult } from './guideState'

const result: TaskResult = {
  answer: 'respuesta',
  correct: true,
  id: 'q1',
  label: 'Pregunta 1',
  maxPoints: 1,
  points: 1,
  selected: 'respuesta',
}

describe('guideReducer', () => {
  it('registra resultados sin modificar los otros bloques', () => {
    const initial = createGuideState([['A', 'B']])
    const next = guideReducer(initial, { type: 'REGISTER_RESULT', task: 'task1', result })

    expect(next.results.task1).toEqual([result])
    expect(next.results.task2).toEqual([])
    expect(initial.results.task1).toEqual([])
  })

  it('reinicia el flujo con una secuencia y alternativas nuevas', () => {
    const dirty = guideReducer(createGuideState([]), { type: 'SET_TASK3_SELECTED', selected: 'x' })
    const next = guideReducer(dirty, {
      type: 'RESET',
      stage: 'task2',
      sequence: ['task2', 'task1'],
      selection: 'all',
      task2Choices: [['nueva']],
    })

    expect(next.stage).toBe('task2')
    expect(next.sequence).toEqual(['task2', 'task1'])
    expect(next.selection).toBe('all')
    expect(next.task2Choices).toEqual([['nueva']])
    expect(next.task3Selected).toBe('')
  })

  it('limita el resumen a la tarea elegida y conserva el resumen global', () => {
    expect(getResultTaskKeys('task1')).toEqual(['task1'])
    expect(getResultTaskKeys('all')).toEqual(['task1', 'task2', 'task3'])
    expect(getResultTaskKeys(null)).toEqual([])
  })
})
