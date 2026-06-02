export type DifficultyKey = 'easy' | 'medium' | 'hard' | 'expert'
export type Operation = '+' | '-' | 'x' | '/'
export type Shape = 'circle' | 'star' | 'heart' | 'triangle' | 'diamond'

export type Difficulty = {
  description: string
  key: DifficultyKey
  label: string
  maxNumber: number
  operations: Operation[]
  rangeLabel: string
  tone: string
}

export type Player = {
  color: string
  id: string
  name: string
  score: number
  shape: Shape
}

export type PlayerPreset = Pick<Player, 'color' | 'name' | 'shape'>

export type ClaimedCell = {
  playerId: string
  shape: Shape
  color: string
}

export type Roll = {
  row: number
  col: number
  operation: Operation
  answer: number
  prompt: string
}
