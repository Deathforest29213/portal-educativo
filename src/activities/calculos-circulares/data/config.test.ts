import { describe, expect, it } from 'vitest'
import { CIRCULAR_DIFFICULTIES, getCircularDifficulty } from './config'

describe('dificultades de Círculos mágicos', () => {
  it('asigna las operaciones acordadas a los niveles preestablecidos', () => {
    expect(CIRCULAR_DIFFICULTIES.find((difficulty) => difficulty.key === 'easy')?.operations).toEqual(['+', '-'])
    expect(CIRCULAR_DIFFICULTIES.find((difficulty) => difficulty.key === 'medium')?.operations).toEqual(['+', '-'])
    expect(CIRCULAR_DIFFICULTIES.find((difficulty) => difficulty.key === 'hard')?.operations).toEqual(['+', '-', 'x'])
  })

  it('mantiene en Personalizado solo las operaciones seleccionadas', () => {
    expect(getCircularDifficulty('custom', {
      emptyCells: 5,
      maxNumber: 20,
      operations: ['/', 'x'],
      sessionGoal: 5,
    }).operations).toEqual(['/', 'x'])
  })
})
