import type { Minihistory, StoryMeta } from '../types'
import { getImageUrl } from './imageUrls'
import { SOURCE_TITLE_TO_ID } from './storyMeta'

interface DraftStory {
  number: string
  sourceTitle: string
  lines: Array<{ text: string; imageName: string; image?: string }>
}

export function parseMinihistories(
  source: string,
  metaById: Record<string, StoryMeta>,
): Minihistory[] {
  const drafts: DraftStory[] = []
  let current: DraftStory | null = null

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const heading = line.match(/^HISTORIA\s+(\d+)\s+-\s+(.+)$/i)
    if (heading) {
      if (current) drafts.push(current)
      current = {
        number: heading[1],
        sourceTitle: heading[2],
        lines: [],
      }
      continue
    }

    const base = line.match(/^(.*?)\s+\(([^)]+\.png)\)$/i)
    if (!current || !base) continue

    const imageName = base[2]
    current.lines.push({
      text: base[1],
      imageName,
      image: getImageUrl(imageName),
    })
  }

  if (current) drafts.push(current)

  return drafts.map((draft) => {
    const id = resolveStoryId(draft.sourceTitle)
    const meta = metaById[id]

    return {
      id,
      badge: `Historia ${draft.number}`,
      sourceTitle: draft.sourceTitle,
      title: meta?.title ?? toDisplayTitle(draft.sourceTitle),
      emoji: meta?.emoji ?? '📖',
      lines: draft.lines,
      questions: [],
    }
  })
}

function resolveStoryId(sourceTitle: string): string {
  const normalized = normalizeKey(sourceTitle)
  return SOURCE_TITLE_TO_ID[normalized] ?? normalized.replaceAll(' ', '-')
}

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function toDisplayTitle(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
