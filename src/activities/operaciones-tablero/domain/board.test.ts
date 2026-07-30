import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from '../../../platform/random/RandomSource'
import { makeRoll } from './board'
import type { Difficulty } from '../types'

const subtractionOnly: Difficulty = {
  key: 'custom',
  label: 'Personalizado',
  description: 'Solo restas.',
  maxNumber: 8,
  operations: ['-'],
  rangeLabel: 'Números de 0 a 8',
  tone: '#7e57c2',
}

describe('makeRoll', () => {
  it('solo genera restas con resultado entero no negativo', () => {
    const random = new SeededRandomSource(42)

    for (let index = 0; index < 40; index += 1) {
      const roll = makeRoll(subtractionOnly, {}, random)
      expect(roll).not.toBeNull()
      expect(roll?.operation).toBe('-')
      expect(roll?.row).toBeGreaterThanOrEqual(roll?.col ?? 0)
      expect(roll?.answer).toBeGreaterThanOrEqual(0)
    }
  })
})
