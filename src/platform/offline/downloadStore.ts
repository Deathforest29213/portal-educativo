import type { Activity, DownloadRecord } from '../../types'

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
    const previous = stored[activity.id]
    records[activity.id] = {
      activityId: activity.id,
      availableVersion: activity.version,
      downloadedAt: previous?.downloadedAt ?? null,
      downloadedVersion: previous?.downloadedVersion ?? null,
      errorMessage: previous?.errorMessage ?? null,
      state: previous?.state === 'downloading' || previous?.state === 'updating'
        ? 'available'
        : previous?.state ?? 'available',
    }
    return records
  }, {})
}

export function saveDownloads(downloads: Record<string, DownloadRecord>) {
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads))
}
