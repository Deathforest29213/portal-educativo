export type CacheActivityRequest = {
  type: 'CACHE_ACTIVITY'
  requestId: string
  activityId: string
  version: string
  assets: string[]
}

export type CacheActivityResult = {
  type: 'CACHE_ACTIVITY_RESULT'
  requestId: string
  activityId: string
  version: string
  ok: boolean
  error?: string
}

export type OfflineDownloadEvent =
  | {
      type: 'started'
      activityId: string
      version: string
    }
  | {
      type: 'completed'
      activityId: string
      version: string
    }
  | {
      type: 'failed'
      activityId: string
      version: string
      error: string
    }

export type OfflineDownloadRequest = {
  activityId: string
  version: string
  assets: string[]
}
