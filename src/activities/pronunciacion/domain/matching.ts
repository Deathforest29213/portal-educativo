export type WordMatch = {
  expected: string
  spoken: string | null
  state: 'correct' | 'wrong'
}

export type PronunciationComparison = {
  accepted: boolean
  extraWords: string[]
  score: number
  wordMatches: WordMatch[]
}

const CLEANUP_PATTERN = /[^\p{L}\p{N}\s]/gu

export function comparePronunciation(expected: string, spoken: string): PronunciationComparison {
  const expectedWords = splitWords(expected)
  const spokenWords = splitWords(spoken)
  const alignment = alignWords(expectedWords.normalized, spokenWords.normalized)

  const wordMatches = expectedWords.original.map((word, index) => {
    const spokenIndex = alignment[index]
    const spokenWord = spokenIndex === null ? null : spokenWords.original[spokenIndex]
    const expectedClean = expectedWords.normalized[index]
    const spokenClean = spokenIndex === null ? '' : spokenWords.normalized[spokenIndex]
    const similarity = getSimilarity(expectedClean, spokenClean)

    return {
      expected: word,
      spoken: spokenWord,
      state: similarity >= 0.74 ? 'correct' : 'wrong',
    } satisfies WordMatch
  })

  const usedSpoken = new Set(alignment.filter((item): item is number => item !== null))
  const extraWords = spokenWords.original.filter((_, index) => !usedSpoken.has(index))
  const wordScore =
    wordMatches.length === 0
      ? 0
      : wordMatches.filter((match) => match.state === 'correct').length / wordMatches.length
  const sentenceScore = getSimilarity(expectedWords.normalized.join(' '), spokenWords.normalized.join(' '))
  const score = Math.round((wordScore * 0.58 + sentenceScore * 0.42) * 100)

  return {
    accepted: score >= 82 && wordScore >= 0.68,
    extraWords,
    score,
    wordMatches,
  }
}

export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(CLEANUP_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitWords(text: string) {
  const original = text.replace(CLEANUP_PATTERN, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const normalized = normalizeText(text).split(' ').filter(Boolean)
  return { original, normalized }
}

function alignWords(expected: string[], spoken: string[]) {
  const used = new Set<number>()

  return expected.map((expectedWord, expectedIndex) => {
    let bestIndex: number | null = null
    let bestScore = 0
    const start = Math.max(0, expectedIndex - 2)
    const end = Math.min(spoken.length - 1, expectedIndex + 2)

    for (let index = start; index <= end; index += 1) {
      if (used.has(index)) continue

      const score = getSimilarity(expectedWord, spoken[index])
      if (score > bestScore) {
        bestIndex = index
        bestScore = score
      }
    }

    if (bestIndex !== null && bestScore >= 0.45) {
      used.add(bestIndex)
      return bestIndex
    }

    return null
  })
}

function getSimilarity(left: string, right: string) {
  if (!left && !right) return 1
  if (!left || !right) return 0

  const distance = getLevenshteinDistance(left, right)
  return 1 - distance / Math.max(left.length, right.length)
}

function getLevenshteinDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  const current = Array.from({ length: right.length + 1 }, () => 0)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      current[rightIndex] = Math.min(previous[rightIndex] + 1, current[rightIndex - 1] + 1, substitution)
    }

    previous.splice(0, previous.length, ...current)
  }

  return previous[right.length]
}
