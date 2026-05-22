import type { Activity, DownloadRecord } from '../types'

const DOWNLOADS_KEY = 'aula-actividades:downloads:v1'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadDownloads(activities: Activity[]) {
  const stored = safeParse<Record<string, DownloadRecord>>(localStorage.getItem(DOWNLOADS_KEY), {})

  return activities.reduce<Record<string, DownloadRecord>>((records, activity) => {
    records[activity.id] = stored[activity.id] ?? {
      activityId: activity.id,
      availableVersion: activity.version,
      downloadedAt: null,
      downloadedVersion: null,
      state: 'available',
    }

    records[activity.id].availableVersion = activity.version
    return records
  }, {})
}

export function saveDownloads(downloads: Record<string, DownloadRecord>) {
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads))
}
