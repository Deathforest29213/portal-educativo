import miniStoriesSource from '../docs/mini_historias.md?raw'
import questionsSource from '../docs/preguntas.md?raw'
import type { Minihistory } from '../types'
import { parseMinihistories } from './parseMinihistories'
import { parseQuestions } from './parseQuestions'
import { STORY_META } from './storyMeta'

const questionsByStory = parseQuestions(questionsSource)
const parsedStories = parseMinihistories(miniStoriesSource, STORY_META)

export const STORIES: Minihistory[] = parsedStories
  .map((story) => ({
    ...story,
    questions: questionsByStory[story.id] ?? [],
  }))
  .filter(hasUsableAssets)
  .filter((story) => story.questions.length > 0)

export const TOTAL_SOURCE_STORIES = parsedStories.length
export const INACTIVE_SOURCE_STORIES = TOTAL_SOURCE_STORIES - STORIES.length

function hasUsableAssets(story: Minihistory): boolean {
  return story.lines.length > 0 && story.lines.some((line) => Boolean(line.image))
}
