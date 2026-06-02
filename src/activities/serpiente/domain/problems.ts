import { difficulties } from '../data/difficulties'
import type { DifficultyKey, DifficultySettings, Problem } from '../types'

export function makeStartNumber(settings: DifficultySettings) {
  return Math.floor(Math.random() * Math.max(settings.maxVal - 2, 1)) + 1
}

export function generateProblem(startNumber: number | null, difficulty: DifficultyKey): Problem {
  const settings = difficulties[difficulty]
  const currentStart = startNumber ?? makeStartNumber(settings)
  const isAddition = Math.random() > 0.5
  let num2 = 0
  let operator: '+' | '-' = '+'
  let result = currentStart

  if (isAddition) {
    if (currentStart >= settings.maxVal) {
      operator = '-'
      num2 = Math.floor(Math.random() * Math.max(currentStart - 1, 1)) + 1
      result = currentStart - num2
    } else {
      operator = '+'
      num2 = Math.floor(Math.random() * (settings.maxVal - currentStart)) + 1
      result = currentStart + num2
    }
  } else if (currentStart <= 1) {
    operator = '+'
    num2 = Math.floor(Math.random() * (settings.maxVal - currentStart)) + 1
    result = currentStart + num2
  } else {
    operator = '-'
    num2 = Math.floor(Math.random() * currentStart)
    result = currentStart - num2
  }

  const options = new Set<number>([result])
  while (options.size < settings.optionsCount) {
    const fake = result + Math.floor(Math.random() * 5) - 2
    if (fake >= 0 && fake <= settings.maxVal && fake !== result) {
      options.add(fake)
    } else {
      options.add(Math.floor(Math.random() * (settings.maxVal + 1)))
    }
  }

  return {
    num1: currentStart,
    num2,
    operator,
    result,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  }
}
