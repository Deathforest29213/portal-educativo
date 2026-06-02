import { useEffect, useState } from 'react'
import type { Activity, ActivityModule, DownloadRecord } from '../../types'
import { loadDownloads, saveDownloads } from './downloadStore'

export function useActivityDownloads(activityModules: ActivityModule[]) {
  const activities = activityModules.map((module) => module.activity)
  const [downloads, setDownloads] = useState(() => loadDownloads(activities))

  useEffect(() => saveDownloads(downloads), [downloads])

  function updateDownload(activity: Activity, next: Partial<DownloadRecord>) {
    setDownloads((current) => ({
      ...current,
      [activity.id]: {
        ...current[activity.id],
        ...next,
      },
    }))
  }

  function downloadActivity(activityModule: ActivityModule) {
    updateDownload(activityModule.activity, { state: 'downloading' })

    navigator.serviceWorker?.controller?.postMessage({
      type: 'CACHE_ACTIVITY',
      activityId: activityModule.activity.id,
      version: activityModule.activity.version,
      assets: activityModule.assets,
    })

    window.setTimeout(() => {
      updateDownload(activityModule.activity, {
        downloadedAt: new Date().toISOString(),
        downloadedVersion: activityModule.activity.version,
        state: 'downloaded',
      })
    }, 900)
  }

  return {
    downloads,
    downloadActivity,
  }
}
