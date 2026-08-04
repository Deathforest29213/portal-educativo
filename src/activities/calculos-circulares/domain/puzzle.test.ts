import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from '../../../platform/random/RandomSource'
import { createCircularPuzzle, evaluateLine, hasUniqueCircularSolution } from './puzzle'
import type { CircularSettings } from '../types'

const settings: CircularSettings = {
  maxNumber: 30,
  emptyCells: 7,
  operations: ['+', '-', 'x', '/'],
}

describe('createCircularPuzzle', () => {
  it('genera seis ecuaciones conectadas con resultados naturales dentro del rango', () => {
    const random = new SeededRandomSource(20260731)

    for (let index = 0; index < 20; index += 1) {
      const puzzle = createCircularPuzzle(settings, random)
      expect(puzzle.lines).toHaveLength(6)
      expect([...puzzle.blanks]).toHaveLength(7)
      expect(puzzle.lines.every((line) => evaluateLine(puzzle, line))).toBe(true)
      expect(Object.values(puzzle.values).every((value) => Number.isInteger(value) && value >= 0 && value <= 30)).toBe(true)
      expect(hasUniqueCircularSolution(puzzle, 30)).toBe(true)
    }
  })

  it('mantiene una sola solución en las configuraciones disponibles', () => {
    const configurations: CircularSettings[] = [
      { maxNumber: 10, emptyCells: 3, operations: ['+', '-'] },
      { maxNumber: 20, emptyCells: 5, operations: ['+', '-', 'x'] },
      { maxNumber: 30, emptyCells: 7, operations: ['+', '-', 'x', '/'] },
      { maxNumber: 20, emptyCells: 5, operations: ['+', '-', 'x'] },
      { maxNumber: 10, emptyCells: 7, operations: ['+'] },
    ]

    configurations.forEach((configuration, configurationIndex) => {
      const random = new SeededRandomSource(420 + configurationIndex)
      for (let index = 0; index < 6; index += 1) {
        const puzzle = createCircularPuzzle(configuration, random)
        expect(hasUniqueCircularSolution(puzzle, configuration.maxNumber)).toBe(true)
      }
    })
  })
})
