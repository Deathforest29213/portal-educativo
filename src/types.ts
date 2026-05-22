export type ActivityArea = 'Lenguaje' | 'Matemática'

export type DownloadState = 'available' | 'downloading' | 'downloaded' | 'error'

export type Activity = {
  area: ActivityArea
  description: string
  id: string
  level: string
  source: string
  title: string
  version: string
}

export type DownloadRecord = {
  activityId: string
  availableVersion: string
  downloadedAt: string | null
  downloadedVersion: string | null
  state: DownloadState
}

export type ActivityQuestion = {
  answer: string
  badge?: string
  image?: string
  options: string[]
  prompt: string
  readingText?: string[]
  readingTitle?: string
  skill?: string
}
