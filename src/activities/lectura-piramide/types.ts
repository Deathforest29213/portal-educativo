export type AppView = 'menu' | 'collection' | 'exercise' | 'quiz' | 'complete' | 'print'

export interface PyramidLine {
  text: string
  imageName: string
  image?: string
}

export interface ComprehensionQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
}

export interface Minihistory {
  id: string
  badge: string
  sourceTitle: string
  title: string
  emoji: string
  lines: PyramidLine[]
  questions: ComprehensionQuestion[]
}

export interface StoryMeta {
  id: string
  title: string
  emoji: string
}

export interface QuestionFeedback {
  selected: number
  isCorrect: boolean
}
