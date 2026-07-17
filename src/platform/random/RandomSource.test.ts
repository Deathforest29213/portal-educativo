import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from './RandomSource'

describe('SeededRandomSource', () => {
  it('reproduce la misma secuencia para una semilla', () => {
    const first = new SeededRandomSource(2026)
    const second = new SeededRandomSource(2026)

    expect(Array.from({ length: 8 }, () => first.next())).toEqual(
      Array.from({ length: 8 }, () => second.next()),
    )
  })

  it('respeta rangos enteros y no muta al mezclar', () => {
    const source = new SeededRandomSource(7)
    const original = [1, 2, 3, 4, 5]
    const values = Array.from({ length: 50 }, () => source.int(2, 4))
    const shuffled = source.shuffle(original)

    expect(values.every((value) => Number.isInteger(value) && value >= 2 && value <= 4)).toBe(true)
    expect(original).toEqual([1, 2, 3, 4, 5])
    expect([...shuffled].sort()).toEqual(original)
  })
})
