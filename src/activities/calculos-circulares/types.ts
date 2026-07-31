export type CircularDifficultyKey = 'easy' | 'medium' | 'hard' | 'custom'
export type CircularOperation = '+' | '-' | 'x' | '/'
export type CircularCellId = `${0 | 1 | 2}-${0 | 1 | 2}`
export type CircularLineId = `row-${0 | 1 | 2}` | `column-${0 | 1 | 2}`

export type CircularDifficulty = {
  description: string
  emptyCells: number
  key: CircularDifficultyKey
  label: string
  maxNumber: number
  operations: CircularOperation[]
  rangeLabel: string
  tone: string
}

export type CircularSettings = Pick<CircularDifficulty, 'emptyCells' | 'maxNumber' | 'operations'>

export type CircularLine = {
  cells: [CircularCellId, CircularCellId, CircularCellId]
  id: CircularLineId
  operation: CircularOperation
}

export type CircularPuzzle = {
  blanks: Set<CircularCellId>
  lines: CircularLine[]
  values: Record<CircularCellId, number>
}
