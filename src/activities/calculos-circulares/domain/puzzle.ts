import { browserRandom, type RandomSource } from '../../../platform/random/RandomSource'
import type {
  CircularCellId,
  CircularLine,
  CircularLineId,
  CircularOperation,
  CircularPuzzle,
  CircularSettings,
} from '../types'

const CELL_IDS: CircularCellId[] = [
  '0-0', '0-1', '0-2',
  '1-0', '1-1', '1-2',
  '2-0', '2-1', '2-2',
]

const LINE_CELLS: Record<CircularLineId, [CircularCellId, CircularCellId, CircularCellId]> = {
  'row-0': ['0-0', '0-1', '0-2'],
  'row-1': ['1-0', '1-1', '1-2'],
  'row-2': ['2-0', '2-1', '2-2'],
  'column-0': ['0-0', '1-0', '2-0'],
  'column-1': ['0-1', '1-1', '2-1'],
  'column-2': ['0-2', '1-2', '2-2'],
}

const LINE_IDS = Object.keys(LINE_CELLS) as CircularLineId[]

export function createCircularPuzzle(settings: CircularSettings, random: RandomSource = browserRandom): CircularPuzzle {
  if (settings.operations.length === 0) {
    throw new Error('Selecciona al menos una operación para crear un cálculo circular.')
  }

  for (let attempt = 0; attempt < 2_400; attempt += 1) {
    const operations = LINE_IDS.map(() => random.pick(settings.operations))
    const values = createValues(settings.maxNumber, operations, random)
    if (!values) continue

    const puzzle = {
      values,
      lines: createLines(operations),
      blanks: pickBlanks(settings.emptyCells, random),
    }
    if (hasUniqueCircularSolution(puzzle, settings.maxNumber)) return puzzle
  }

  for (let attempt = 0; attempt < 1_200; attempt += 1) {
    const fallbackOperation = random.pick(settings.operations)
    const fallback = createFallbackValues(settings.maxNumber, fallbackOperation, random)
    const puzzle = {
      values: fallback,
      lines: createLines(LINE_IDS.map(() => fallbackOperation)),
      blanks: pickBlanks(settings.emptyCells, random),
    }
    if (hasUniqueCircularSolution(puzzle, settings.maxNumber)) return puzzle
  }

  throw new Error('No se pudo crear un círculo con una solución única para esta configuración.')
}

export function evaluateLine(puzzle: CircularPuzzle, line: CircularLine) {
  const [first, second, result] = line.cells
  return applyOperation(puzzle.values[first], puzzle.values[second], line.operation) === puzzle.values[result]
}

export function getRelatedLines(cellId: CircularCellId, lines: CircularLine[]) {
  return lines.filter((line) => line.cells.includes(cellId))
}

export function getOperationSymbol(operation: CircularOperation) {
  return operation === 'x' ? '×' : operation === '/' ? '÷' : operation
}

export function hasUniqueCircularSolution(puzzle: CircularPuzzle, maxNumber: number) {
  const visibleValues: Partial<Record<CircularCellId, number>> = {}
  for (const cellId of CELL_IDS) {
    if (!puzzle.blanks.has(cellId)) visibleValues[cellId] = puzzle.values[cellId]
  }

  let solutions = 0

  function lineMatches(line: CircularLine, values: Partial<Record<CircularCellId, number>>) {
    const [first, second, result] = line.cells.map((cellId) => values[cellId])
    if (first === undefined || second === undefined || result === undefined) return null
    return applyOperation(first, second, line.operation, maxNumber) === result
  }

  function propagate(values: Partial<Record<CircularCellId, number>>) {
    let changed = true

    while (changed) {
      changed = false
      for (const line of puzzle.lines) {
        const unknown = line.cells.filter((cellId) => values[cellId] === undefined)
        const completeLine = lineMatches(line, values)
        if (completeLine === false) return null
        if (unknown.length !== 1) continue

        const cellId = unknown[0]
        const possibilities: number[] = []
        for (let value = 0; value <= maxNumber; value += 1) {
          if (lineMatches(line, { ...values, [cellId]: value })) possibilities.push(value)
        }
        if (possibilities.length === 0) return null
        if (possibilities.length === 1) {
          values[cellId] = possibilities[0]
          changed = true
        }
      }
    }

    return values
  }

  function search(values: Partial<Record<CircularCellId, number>>) {
    if (solutions > 1) return

    const propagated = propagate({ ...values })
    if (!propagated) return

    const unresolved = [...puzzle.blanks].filter((cellId) => propagated[cellId] === undefined)
    if (unresolved.length === 0) {
      solutions += 1
      return
    }

    const nextCell = unresolved.sort((first, second) => relatedKnownCount(second, propagated) - relatedKnownCount(first, propagated))[0]
    for (let value = 0; value <= maxNumber; value += 1) {
      search({ ...propagated, [nextCell]: value })
      if (solutions > 1) return
    }
  }

  function relatedKnownCount(cellId: CircularCellId, values: Partial<Record<CircularCellId, number>>) {
    return getRelatedLines(cellId, puzzle.lines).reduce((count, line) => count + line.cells.filter((id) => id !== cellId && values[id] !== undefined).length, 0)
  }

  search(visibleValues)
  return solutions === 1
}

function createValues(maxNumber: number, operations: CircularOperation[], random: RandomSource) {
  const [rowTop, rowMiddle, rowBottom, columnLeft, columnMiddle, columnRight] = operations
  const topLeft = random.int(0, maxNumber)
  const topMiddle = random.int(0, maxNumber)
  const middleLeft = random.int(0, maxNumber)
  const middle = random.int(0, maxNumber)
  const topRight = applyOperation(topLeft, topMiddle, rowTop, maxNumber)
  const middleRight = applyOperation(middleLeft, middle, rowMiddle, maxNumber)
  const bottomLeft = applyOperation(topLeft, middleLeft, columnLeft, maxNumber)
  const bottomMiddle = applyOperation(topMiddle, middle, columnMiddle, maxNumber)

  if (topRight === null || middleRight === null || bottomLeft === null || bottomMiddle === null) {
    return null
  }

  const fromBottomRow = applyOperation(bottomLeft, bottomMiddle, rowBottom, maxNumber)
  const fromRightColumn = applyOperation(topRight, middleRight, columnRight, maxNumber)
  if (fromBottomRow === null || fromBottomRow !== fromRightColumn) return null

  return {
    '0-0': topLeft,
    '0-1': topMiddle,
    '0-2': topRight,
    '1-0': middleLeft,
    '1-1': middle,
    '1-2': middleRight,
    '2-0': bottomLeft,
    '2-1': bottomMiddle,
    '2-2': fromBottomRow,
  } satisfies Record<CircularCellId, number>
}

function createFallbackValues(maxNumber: number, operation: CircularOperation, random: RandomSource) {
  if (operation === '+') {
    const limit = Math.max(1, Math.floor(maxNumber / 4))
    const a = random.int(0, limit)
    const b = random.int(0, limit)
    const d = random.int(0, limit)
    const e = random.int(0, limit)
    return matrix(a, b, a + b, d, e, d + e, a + d, b + e, a + b + d + e)
  }

  if (operation === 'x') {
    const factors = [1, 2]
    const a = random.pick(factors)
    const b = random.pick(factors)
    const d = random.pick(factors)
    const e = random.pick(factors)
    return matrix(a, b, a * b, d, e, d * e, a * d, b * e, a * b * d * e)
  }

  if (operation === '-') {
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const a = random.int(0, maxNumber)
      const b = random.int(0, a)
      const d = random.int(0, a)
      const e = random.int(0, Math.min(b, d))
      const c = a - b
      const f = d - e
      const g = a - d
      const h = b - e
      const i = c - f
      if (i >= 0 && g - h === i) return matrix(a, b, c, d, e, f, g, h, i)
    }
  }

  const base = random.int(1, 2)
  const horizontalFactor = random.int(1, 2)
  const verticalFactor = random.int(1, 2)
  const resultFactor = random.int(1, 2)
  const topLeft = base * horizontalFactor * verticalFactor * resultFactor
  const topMiddle = base * horizontalFactor
  const middleLeft = base * verticalFactor
  const middle = base
  return matrix(
    topLeft,
    topMiddle,
    verticalFactor * resultFactor,
    middleLeft,
    middle,
    verticalFactor,
    horizontalFactor * resultFactor,
    horizontalFactor,
    resultFactor,
  )
}

function matrix(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
) {
  return {
    '0-0': a,
    '0-1': b,
    '0-2': c,
    '1-0': d,
    '1-1': e,
    '1-2': f,
    '2-0': g,
    '2-1': h,
    '2-2': i,
  } satisfies Record<CircularCellId, number>
}

function createLines(operations: CircularOperation[]) {
  return LINE_IDS.map((id, index) => ({
    id,
    cells: LINE_CELLS[id],
    operation: operations[index],
  }))
}

function pickBlanks(emptyCells: number, random: RandomSource) {
  const selected = random.shuffle(CELL_IDS).slice(0, emptyCells)
  return new Set(selected)
}

function applyOperation(first: number, second: number, operation: CircularOperation, maxNumber = Number.MAX_SAFE_INTEGER) {
  let result: number

  if (operation === '+') result = first + second
  else if (operation === '-') result = first - second
  else if (operation === 'x') result = first * second
  else {
    if (second === 0 || first % second !== 0) return null
    result = first / second
  }

  return Number.isInteger(result) && result >= 0 && result <= maxNumber ? result : null
}
