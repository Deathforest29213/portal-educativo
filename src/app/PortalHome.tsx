import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import type { Activity, ActivityModule, DownloadRecord } from '../types'
import { DownloadButton } from './components/DownloadButton'

type PortalHomeProps = {
  activityModules: ActivityModule[]
  downloads: Record<string, DownloadRecord>
  isOnline: boolean
  onDownload: (activityModule: ActivityModule) => void
  onOpen: (activityId: string) => void
}

export function PortalHome({
  activityModules,
  downloads,
  isOnline,
  onDownload,
  onOpen,
}: PortalHomeProps) {
  return (
    <main className="app-shell">
      <Header isOnline={isOnline} />
      <section className="intro-section" aria-labelledby="page-title">
        <div>
          <p className="section-label">Portal educativo</p>
          <h1 id="page-title">Aula de Actividades</h1>
          <p className="intro-copy">
            Actividades listas para trabajar en vivo, con descarga para usarlas sin conexión.
          </p>
        </div>
        <div className="summary-strip" aria-label="Resumen del portal">
          <SummaryItem label="Actividades" value={activityModules.length.toString()} />
          <SummaryItem label="Descargadas" value={countDownloaded(downloads).toString()} />
        </div>
      </section>

      <ActivitySection
        activityModules={activityModules}
        area="Lenguaje"
        downloads={downloads}
        onDownload={onDownload}
        onOpen={onOpen}
      />
      <ActivitySection
        activityModules={activityModules}
        area="Matemática"
        downloads={downloads}
        onDownload={onDownload}
        onOpen={onOpen}
      />
    </main>
  )
}

function Header({ isOnline }: { isOnline: boolean }) {
  return (
    <header className="topbar">
      <div className="brand-mark" aria-hidden="true">
        A
      </div>
      <div>
        <strong>Aula de Actividades</strong>
        <span>Prototipo local</span>
      </div>
      <div className={`connection-badge ${isOnline ? 'is-online' : 'is-offline'}`}>
        {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        {isOnline ? 'Con conexión' : 'Sin conexión'}
      </div>
    </header>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type ActivitySectionProps = {
  activityModules: ActivityModule[]
  area: Activity['area']
  downloads: Record<string, DownloadRecord>
  onDownload: (activityModule: ActivityModule) => void
  onOpen: (activityId: string) => void
}

function ActivitySection({
  activityModules,
  area,
  downloads,
  onDownload,
  onOpen,
}: ActivitySectionProps) {
  const sectionModules = activityModules.filter((module) => module.activity.area === area)

  return (
    <section className="activity-section" aria-labelledby={`section-${area}`}>
      <div className="section-heading">
        <p className="section-label">Sección</p>
        <h2 id={`section-${area}`}>{area}</h2>
      </div>
      <div className="activity-grid">
        {sectionModules.map((activityModule) => (
          <ActivityCard
            activityModule={activityModule}
            download={downloads[activityModule.activity.id]}
            key={activityModule.activity.id}
            onDownload={() => onDownload(activityModule)}
            onOpen={() => onOpen(activityModule.activity.id)}
          />
        ))}
      </div>
    </section>
  )
}

type ActivityCardProps = {
  activityModule: ActivityModule
  download: DownloadRecord
  onDownload: () => void
  onOpen: () => void
}

function ActivityCard({ activityModule, download, onDownload, onOpen }: ActivityCardProps) {
  const { activity } = activityModule
  const needsUpdate =
    download.downloadedVersion !== null && download.downloadedVersion !== activity.version

  return (
    <article className={`activity-card activity-card--${activity.area.toLowerCase()}`}>
      <div className="card-topline">
        <span>{activity.level}</span>
        {needsUpdate ? (
          <span className="update-flag" title="Hay una versión más nueva">
            <AlertTriangle size={16} />
            Actualizar
          </span>
        ) : null}
      </div>
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
      <div className="card-actions">
        <button className="primary-button" onClick={onOpen} type="button">
          Abrir
        </button>
        <span className="version-chip" aria-label={`Versión ${activity.version}`}>
          v{activity.version}
        </span>
        <DownloadButton download={download} onDownload={onDownload} />
      </div>
    </article>
  )
}

function countDownloaded(downloads: Record<string, DownloadRecord>) {
  return Object.values(downloads).filter((download) => download.state === 'downloaded').length
}
