import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from '../../../platform/random/RandomSource'
import { countCircularSolutions, createCircularPuzzle, evaluateLine, hasUniqueCircularSolution, isCircularPuzzleDeducible } from './puzzle'
import type { CircularCellId, CircularLine, CircularPuzzle, CircularSettings } from '../types'

const CELL_IDS: CircularCellId[] = [
  '0-0', '0-1', '0-2',
  '1-0', '1-1', '1-2',
  '2-0', '2-1', '2-2',
]

const MULTIPLICATION_LINES: CircularLine[] = [
  { id: 'row-0', cells: ['0-0', '0-1', '0-2'], operation: 'x' },
  { id: 'row-1', cells: ['1-0', '1-1', '1-2'], operation: 'x' },
  { id: 'row-2', cells: ['2-0', '2-1', '2-2'], operation: 'x' },
  { id: 'column-0', cells: ['0-0', '1-0', '2-0'], operation: 'x' },
  { id: 'column-1', cells: ['0-1', '1-1', '2-1'], operation: 'x' },
  { id: 'column-2', cells: ['0-2', '1-2', '2-2'], operation: 'x' },
]

const multiplicationFixture: CircularPuzzle = {
  values: {
    '0-0': 0, '0-1': 1, '0-2': 0,
    '1-0': 9, '1-1': 1, '1-2': 9,
    '2-0': 0, '2-1': 1, '2-2': 0,
  },
  lines: MULTIPLICATION_LINES,
  blanks: new Set(['0-1', '0-2', '1-0', '1-1', '1-2']),
}

describe('createCircularPuzzle', () => {
  it('genera seis ecuaciones conectadas con resultados naturales dentro del rango', () => {
    const settings: CircularSettings = { maxNumber: 30, emptyCells: 5, operations: ['+', '-', 'x', '/'] }
    const random = new SeededRandomSource(20260731)

    for (let index = 0; index < 20; index += 1) {
      const puzzle = createCircularPuzzle(settings, random)
      expect(puzzle.lines).toHaveLength(6)
      expect([...puzzle.blanks]).toHaveLength(5)
      expect(puzzle.lines.every((line) => evaluateLine(puzzle, line))).toBe(true)
      expect(Object.values(puzzle.values).every((value) => Number.isInteger(value) && value >= 0 && value <= 30)).toBe(true)
      expect(hasUniqueCircularSolution(puzzle, 30)).toBe(true)
      expect(isCircularPuzzleDeducible(puzzle, 30)).toBe(true)
    }
  })

  it('rechaza los círculos ambiguos o inconsistentes aunque cierren algunas ecuaciones', () => {
    expect(multiplicationFixture.lines.every((line) => evaluateLine(multiplicationFixture, line))).toBe(true)
    expect(countCircularSolutions(multiplicationFixture, 10)).toBe(2)
    expect(hasUniqueCircularSolution(multiplicationFixture, 10)).toBe(false)
    expect(isCircularPuzzleDeducible(multiplicationFixture, 10)).toBe(false)

    const inconsistentFixture: CircularPuzzle = {
      ...multiplicationFixture,
      values: { ...multiplicationFixture.values, '2-2': 1 },
    }
    expect(countCircularSolutions(inconsistentFixture, 10)).toBe(0)
    expect(isCircularPuzzleDeducible(inconsistentFixture, 10)).toBe(false)

    const nonNaturalFixture: CircularPuzzle = {
      ...multiplicationFixture,
      values: { ...multiplicationFixture.values, '2-2': -1 },
    }
    expect(countCircularSolutions(nonNaturalFixture, 10)).toBe(0)
  })

  it('clasifica las 336 posiciones posibles de tres a cinco casillas vacías', () => {
    const masks = [3, 4, 5].flatMap((emptyCells) => blankCombinations(CELL_IDS, emptyCells))
    let deducible = 0
    let rejected = 0

    for (const mask of masks) {
      const puzzle = { ...multiplicationFixture, blanks: new Set(mask) }
      const solutionCount = countCircularSolutions(puzzle, 10)
      const isDeducible = isCircularPuzzleDeducible(puzzle, 10)

      expect(hasUniqueCircularSolution(puzzle, 10)).toBe(solutionCount === 1)
      if (isDeducible) {
        deducible += 1
        expect(solutionCount).toBe(1)
      } else {
        rejected += 1
      }
    }

    expect(masks).toHaveLength(336)
    expect(deducible).toBe(166)
    expect(rejected).toBe(170)
  })

  it('mantiene solucionables 150 configuraciones de operaciones, rangos y semillas', () => {
    const operationSets = nonEmptyOperationSets()
    let generated = 0

    operationSets.forEach((operations, index) => {
      const settings: CircularSettings = {
        maxNumber: [10, 20, 30][index % 3],
        emptyCells: [3, 4, 5][index % 3],
        operations,
      }
      const random = new SeededRandomSource(2_026_080 + index)

      for (let round = 0; round < 10; round += 1) {
        const puzzle = createCircularPuzzle(settings, random)
        expect(puzzle.lines.every((line) => evaluateLine(puzzle, line))).toBe(true)
        expect(isCircularPuzzleDeducible(puzzle, settings.maxNumber)).toBe(true)
        expect(countCircularSolutions(puzzle, settings.maxNumber)).toBe(1)
        generated += 1
      }
    })

    expect(operationSets).toHaveLength(15)
    expect(generated).toBe(150)
  })

  it('no permite crear círculos con más de cinco casillas vacías', () => {
    expect(() => createCircularPuzzle({ maxNumber: 20, emptyCells: 6, operations: ['+'] }, new SeededRandomSource(1))).toThrow('entre 3 y 5')
  })
})

function blankCombinations(cells: CircularCellId[], size: number, start = 0, selected: CircularCellId[] = []): CircularCellId[][] {
  if (selected.length === size) return [selected]

  const combinations: CircularCellId[][] = []
  for (let index = start; index <= cells.length - (size - selected.length); index += 1) {
    combinations.push(...blankCombinations(cells, size, index + 1, [...selected, cells[index]]))
  }
  return combinations
}

function nonEmptyOperationSets() {
  const operations: CircularSettings['operations'] = ['+', '-', 'x', '/']
  const sets: CircularSettings['operations'][] = []

  for (let mask = 1; mask < 2 ** operations.length; mask += 1) {
    sets.push(operations.filter((_, index) => (mask & (1 << index)) !== 0))
  }
  return sets
}
