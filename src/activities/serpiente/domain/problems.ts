import { difficulties } from '../data/difficulties'
import type { DifficultyKey, DifficultySettings, Problem } from '../types'
import { browserRandom, type RandomSource } from '../../../platform/random/RandomSource'

export function makeStartNumber(settings: DifficultySettings, random: RandomSource = browserRandom) {
  return random.int(1, Math.max(settings.maxVal - 2, 1))
}

export function generateProblem(
  startNumber: number | null,
  difficulty: DifficultyKey,
  random: RandomSource = browserRandom,
): Problem {
  const settings = difficulties[difficulty]
  const currentStart = startNumber ?? makeStartNumber(settings, random)
  const isAddition = random.next() > 0.5
  let num2 = 0
  let operator: '+' | '-' = '+'
  let result = currentStart

  if (isAddition) {
    if (currentStart >= settings.maxVal) {
      operator = '-'
      num2 = random.int(1, Math.max(currentStart - 1, 1))
      result = currentStart - num2
    } else {
      operator = '+'
      num2 = random.int(1, settings.maxVal - currentStart)
      result = currentStart + num2
    }
  } else if (currentStart <= 1) {
    operator = '+'
    num2 = random.int(1, settings.maxVal - currentStart)
    result = currentStart + num2
  } else {
    operator = '-'
    num2 = random.int(0, currentStart - 1)
    result = currentStart - num2
  }

  const options = new Set<number>([result])
  while (options.size < settings.optionsCount) {
    const fake = result + random.int(-2, 2)
    if (fake >= 0 && fake <= settings.maxVal && fake !== result) {
      options.add(fake)
    } else {
      options.add(random.int(0, settings.maxVal))
    }
  }

  return {
    num1: currentStart,
    num2,
    operator,
    result,
    options: random.shuffle(Array.from(options)),
  }
}
