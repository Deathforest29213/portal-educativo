export interface RandomSource {
  next(): number
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
}

export class BrowserRandomSource implements RandomSource {
  next() {
    return Math.random()
  }

  int(min: number, max: number) {
    assertRange(min, max)
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(items: readonly T[]) {
    if (items.length === 0) throw new Error('No se puede elegir desde una lista vacía.')
    return items[this.int(0, items.length - 1)]
  }

  shuffle<T>(items: readonly T[]) {
    return shuffleWith(items, () => this.next())
  }
}

export class SeededRandomSource implements RandomSource {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  next() {
    this.state += 0x6d2b79f5
    let value = this.state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }

  int(min: number, max: number) {
    assertRange(min, max)
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(items: readonly T[]) {
    if (items.length === 0) throw new Error('No se puede elegir desde una lista vacía.')
    return items[this.int(0, items.length - 1)]
  }

  shuffle<T>(items: readonly T[]) {
    return shuffleWith(items, () => this.next())
  }
}

export const browserRandom = new BrowserRandomSource()

function shuffleWith<T>(items: readonly T[], next: () => number) {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }

  return result
}

function assertRange(min: number, max: number) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error(`Rango aleatorio inválido: ${min}..${max}`)
  }
}
