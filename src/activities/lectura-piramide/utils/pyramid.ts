import type { Minihistory } from '../types'

export function getLineParts(lines: Minihistory['lines'], index: number) {
  const current = lines[index]?.text ?? ''
  if (index === 0) {
    return { prefix: '', suffix: current }
  }

  const previous = lines[index - 1]?.text ?? ''
  if (!current.startsWith(previous)) {
    return { prefix: '', suffix: current }
  }

  return {
    prefix: previous,
    suffix: current.slice(previous.length).trim(),
  }
}

export function getLineWidth(total: number, index: number): string {
  if (total <= 1) return '82%'
  const start = 34
  const end = 100
  const value = start + ((end - start) * index) / (total - 1)
  return `${value}%`
}

export function getCurrentImage(story: Minihistory, index: number): string | null {
  for (let current = index; current >= 0; current -= 1) {
    const image = story.lines[current]?.image
    if (image) return image
  }

  return null
}
