import { useEffect, useRef, useState } from 'react'
import type { ActivityModule, DownloadRecord } from '../../types'
import { loadDownloads, saveDownloads } from './downloadStore'
import { createBrowserOfflineDownloadFacade, type OfflineDownloadFacade } from './offlineDownloadFacade'

export function useActivityDownloads(activityModules: ActivityModule[]) {
  const activities = activityModules.map((module) => module.activity)
  const [downloads, setDownloads] = useState(() => loadDownloads(activities))
  const facadeRef = useRef<OfflineDownloadFacade | null>(null)

  if (!facadeRef.current) {
    facadeRef.current = createBrowserOfflineDownloadFacade()
  }

  useEffect(() => saveDownloads(downloads), [downloads])

  useEffect(() => {
    const facade = facadeRef.current!

    return facade.subscribe((event) => {
      setDownloads((current) => {
        const record = current[event.activityId]
        if (!record) return current

        if (event.type === 'started') {
          const isUpdate = record.downloadedVersion !== null && record.downloadedVersion !== event.version
          return updateRecord(current, event.activityId, {
            errorMessage: null,
            state: isUpdate ? 'updating' : 'downloading',
          })
        }

        if (event.type === 'completed') {
          return updateRecord(current, event.activityId, {
            downloadedAt: new Date().toISOString(),
            downloadedVersion: event.version,
            errorMessage: null,
            state: 'downloaded',
          })
        }

        return updateRecord(current, event.activityId, {
          downloadedAt: null,
          downloadedVersion: null,
          errorMessage: event.error,
          state: 'error',
        })
      })
    })
  }, [])

  function downloadActivity(activityModule: ActivityModule) {
    void facadeRef.current?.download({
      activityId: activityModule.activity.id,
      version: activityModule.activity.version,
      assets: activityModule.assets,
    }).catch(() => undefined)
  }

  return {
    downloads,
    downloadActivity,
  }
}

function updateRecord(
  current: Record<string, DownloadRecord>,
  activityId: string,
  next: Partial<DownloadRecord>,
) {
  return {
    ...current,
    [activityId]: {
      ...current[activityId],
      ...next,
    },
  }
}
