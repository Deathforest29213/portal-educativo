import { useEffect, useState } from 'react'
import { activityModules, activities, findActivityModule } from '../activities/registry'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useActivityDownloads } from '../platform/offline/useActivityDownloads'
import { ActivityHost } from './ActivityHost'
import { PortalHome } from './PortalHome'
import { getActivityIdFromHash, navigateHome, navigateToActivity } from './routes'

function App() {
  const isOnline = useOnlineStatus()
  const [selectedId, setSelectedId] = useState<string | null>(() => getActivityIdFromHash(activities))
  const { downloads, downloadActivity } = useActivityDownloads(activityModules)
  const selectedModule = findActivityModule(selectedId)

  useEffect(() => {
    const syncFromHash = () => setSelectedId(getActivityIdFromHash(activities))

    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  if (selectedModule) {
    return (
      <ActivityHost
        activityModule={selectedModule}
        download={downloads[selectedModule.activity.id]}
        isOnline={isOnline}
        onBack={navigateHome}
        onDownload={() => downloadActivity(selectedModule)}
      />
    )
  }

  return (
    <PortalHome
      activityModules={activityModules}
      downloads={downloads}
      isOnline={isOnline}
      onDownload={downloadActivity}
      onOpen={navigateToActivity}
    />
  )
}

export default App
