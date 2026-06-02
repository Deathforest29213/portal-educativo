export type DifficultyKey = 'easy' | 'medium' | 'hard'

export type Problem = {
  num1: number
  num2: number
  operator: '+' | '-'
  options: number[]
  result: number
}

export type DifficultySettings = {
  bg: string
  body: string
  bodyReverse: string
  decos: string[]
  exercises: number
  head: string
  icon: string
  key: DifficultyKey
  label: string
  maxVal: number
  optionsCount: number
  primary: string
  secondary: string
  skipOnError: boolean
  tail: string
}
