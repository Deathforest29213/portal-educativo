import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from '../../../platform/random/RandomSource'
import { generateProblem } from './problems'

describe('estrategia de problemas de Serpiente', () => {
  it('genera un problema reproducible e íntegro con una fuente inyectada', () => {
    const first = generateProblem(null, 'medium', new SeededRandomSource(42))
    const second = generateProblem(null, 'medium', new SeededRandomSource(42))

    expect(first).toEqual(second)
    expect(first.options).toContain(first.result)
    expect(first.options).toHaveLength(4)
    expect(first.result).toBeGreaterThanOrEqual(0)
    expect(first.result).toBeLessThanOrEqual(20)
  })
})
