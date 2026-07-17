import { X } from 'lucide-react'
import { Suspense } from 'react'
import type { ActivityModule, DownloadRecord } from '../types'
import { ActionButton } from './components/ActionButton'
import { ActivityLoadingScreen } from './components/ActivityLoadingScreen'
import { DownloadButton } from './components/DownloadButton'
import { FeedbackBanner } from './components/FeedbackBanner'

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
  const activityClass = activity.id.replace(/[^a-z0-9-]/gi, '-')

  return (
    <main className={`app-shell activity-view family-${areaClass} activity-view--${areaClass} activity-view--${activityClass}`}>
      <header className="activity-header">
        <div className="activity-title-block">
          <span className="activity-area-label">{activity.area}</span>
          <h1>{activity.title}</h1>
        </div>
        <div className="activity-header-actions">
          <DownloadButton download={download} onDownload={onDownload} />
          <ActionButton
            aria-label="Cerrar actividad"
            className="activity-header__close"
            icon={<X aria-hidden="true" size={22} strokeWidth={2.6} />}
            onClick={onBack}
            title="Cerrar actividad y volver al portal"
            variant="danger"
          />
        </div>
      </header>

      {!canUseOffline ? (
        <FeedbackBanner className="activity-panel" title="Actividad no disponible sin internet" tone="warning">
          <p>Conéctate y descárgala antes de volver a intentarlo.</p>
        </FeedbackBanner>
      ) : (
        <Suspense fallback={<ActivityLoadingScreen area={activity.area} title={activity.title} />}>
          <section className="activity-stage">
            <Component />
          </section>
        </Suspense>
      )}
    </main>
  )
}
