import type { ComprehensionQuestion } from '../types'

export function parseQuestions(
  source: string,
): Record<string, ComprehensionQuestion[]> {
  const markdownQuestions = parseMarkdownQuestions(source)
  if (hasQuestions(markdownQuestions)) return markdownQuestions

  return parseGuideQuestions(source)
}

function parseMarkdownQuestions(source: string): Record<string, ComprehensionQuestion[]> {
  const questionsByStory: Record<string, ComprehensionQuestion[]> = {}
  let currentStoryId = ''
  let currentQuestion: ComprehensionQuestion | null = null

  const finishQuestion = () => {
    if (!currentStoryId || !currentQuestion) return
    if (currentQuestion.options.length < 2) return
    if (currentQuestion.correct < 0) return
    questionsByStory[currentStoryId].push(currentQuestion)
    currentQuestion = null
  }

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const storyHeading = line.match(/^##\s+([a-z0-9-]+)$/i)
    if (storyHeading) {
      finishQuestion()
      currentStoryId = storyHeading[1]
      questionsByStory[currentStoryId] = []
      continue
    }

    const questionHeading = line.match(/^###\s+(.+)$/)
    if (questionHeading) {
      finishQuestion()
      currentQuestion = {
        q: questionHeading[1],
        options: [],
        correct: -1,
        explanation: '',
      }
      continue
    }

    const option = line.match(/^-\s+\[(x| )\]\s+(.+)$/i)
    if (option && currentQuestion) {
      if (option[1].toLowerCase() === 'x') {
        currentQuestion.correct = currentQuestion.options.length
      }
      currentQuestion.options.push(option[2])
      continue
    }

    const explanation = line.match(/^Explicacion:\s+(.+)$/i)
    if (explanation && currentQuestion) {
      currentQuestion.explanation = explanation[1]
    }
  }

  finishQuestion()
  return questionsByStory
}

function parseGuideQuestions(source: string): Record<string, ComprehensionQuestion[]> {
  const questionsByStory: Record<string, ComprehensionQuestion[]> = {}
  let currentStoryId = ''
  let currentQuestion: ComprehensionQuestion | null = null

  const finishQuestion = () => {
    if (!currentStoryId || !currentQuestion) return
    if (currentQuestion.options.length < 2) return
    if (currentQuestion.correct < 0) return
    const correctOption = currentQuestion.options[currentQuestion.correct]
    currentQuestion.explanation = `Respuesta correcta: ${correctOption}`
    questionsByStory[currentStoryId].push(currentQuestion)
    currentQuestion = null
  }

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const storyHeading = line.match(/^Texto\s*:\s*(\d+)$/i)
    if (storyHeading) {
      finishQuestion()
      currentStoryId = STORY_ID_BY_TEXT_NUMBER[storyHeading[1]] ?? ''
      if (currentStoryId) questionsByStory[currentStoryId] = []
      continue
    }

    const questionHeading = line.match(/^(\d+)\.-\s+(.+)$/)
    if (questionHeading) {
      finishQuestion()
      currentQuestion = {
        q: cleanQuestion(questionHeading[2]),
        options: [],
        correct: -1,
        explanation: '',
      }
      continue
    }

    const option = line.match(/^([a-z])\)\s+(.+)$/i)
    if (option && currentQuestion) {
      const isCorrect = /\(\s*Correcta\s*\)/i.test(option[2])
      if (isCorrect) currentQuestion.correct = currentQuestion.options.length
      currentQuestion.options.push(cleanOption(option[2]))
    }
  }

  finishQuestion()
  return questionsByStory
}

function hasQuestions(questionsByStory: Record<string, ComprehensionQuestion[]>) {
  return Object.values(questionsByStory).some((questions) => questions.length > 0)
}

function cleanQuestion(value: string) {
  return value
    .replace(/\s+(Expl[ií]cita|Impl[ií]cita)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanOption(value: string) {
  return value
    .replace(/\s*\(\s*Correcta\s*\)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const STORY_ID_BY_TEXT_NUMBER: Record<string, string> = {
  '1': 'alicia',
  '2': 'astronauta',
  '3': 'camion',
  '4': 'perro',
  '5': 'policia',
  '6': 'martina',
  '7': 'tren',
  '8': 'tortuga',
  '9': 'panadero',
  '10': 'sofia',
  '11': 'barco',
}
