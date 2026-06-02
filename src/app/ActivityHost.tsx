import { AlertTriangle, ArrowLeft } from 'lucide-react'
import type { ActivityModule, DownloadRecord } from '../types'
import { DownloadButton } from './components/DownloadButton'

type ActivityHostProps = {
  activityModule: ActivityModule
  download: DownloadRecord
  isOnline: boolean
  onBack: () => void
  onDownload: () => void
}

export function ActivityHost({
  activityModule,
  download,
  isOnline,
  onBack,
  onDownload,
}: ActivityHostProps) {
  const { activity, Component } = activityModule
  const canUseOffline = isOnline || download.state === 'downloaded'
  const areaClass = activity.area === 'Lenguaje' ? 'language' : 'math'

  return (
    <main className={`app-shell activity-view activity-view--${areaClass}`}>
      <header className="activity-header">
        <div className="activity-title-block">
          <h1>{activity.title}</h1>
        </div>
        <div className="activity-header-actions">
          <span className="activity-area-label">{activity.area}</span>
          <DownloadButton download={download} onDownload={onDownload} />
          <button className="back-button" onClick={onBack} type="button">
            <ArrowLeft size={19} />
            Inicio
          </button>
        </div>
      </header>

      {!canUseOffline ? (
        <section className="activity-panel">
          <AlertTriangle size={28} />
          <h2>Actividad no descargada</h2>
          <p>Conéctate o descarga esta actividad antes de usarla sin internet.</p>
        </section>
      ) : activity.id === 'lectura-piramide' ? (
        <section className="activity-stage activity-stage--lectura">
          <Component />
        </section>
      ) : (
        <Component />
      )}
    </main>
  )
}
