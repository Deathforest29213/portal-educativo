import type { ComponentType, LazyExoticComponent } from 'react'

export type ActivityArea = 'Lenguaje' | 'Matemática'

export type DownloadState = 'available' | 'downloading' | 'downloaded' | 'updating' | 'error'

export type ActivityMigrationStatus = 'mvp' | 'planned' | 'archived'

export type Activity = {
  area: ActivityArea
  description: string
  id: string
  level: string
  migrationStatus: ActivityMigrationStatus
  source: string
  title: string
  version: string
}

export type ActivityLoader = () => Promise<{ default: ComponentType }>

export type ActivityDefinition = {
  activity: Activity
  assets: string[]
  load: ActivityLoader
}

export type ActivityModule = ActivityDefinition & {
  Component: LazyExoticComponent<ComponentType>
}

export type DownloadRecord = {
  activityId: string
  availableVersion: string
  downloadedAt: string | null
  downloadedVersion: string | null
  errorMessage: string | null
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
