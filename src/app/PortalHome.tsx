import { AlertTriangle, ArrowRight, BookOpenText, Calculator, Wifi, WifiOff } from 'lucide-react'
import type { Activity, ActivityModule, DownloadRecord } from '../types'
import { ActionButton } from './components/ActionButton'
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
    <main className="app-shell portal-home">
      <Header isOnline={isOnline} />
      <section className="intro-section" aria-labelledby="page-title">
        <div>
          <div className="intro-title">
            <img alt="" className="intro-title-icon" src="/icons/aula-icon.svg" />
            <h1 id="page-title">Aula de Actividades</h1>
          </div>
          <p className="intro-copy">
            Elige un área y abre una actividad. Puedes descargarla para usarla sin internet.
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
    <header className="topbar topbar--connection">
      <div aria-live="polite" className={`connection-badge ${isOnline ? 'is-online' : 'is-offline'}`}>
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
  const family = area === 'Lenguaje' ? 'language' : 'math'
  const AreaIcon = area === 'Lenguaje' ? BookOpenText : Calculator

  return (
    <section className={`activity-section family-${family}`} aria-labelledby={`section-${family}`}>
      <div className="section-heading">
        <span aria-hidden="true" className="section-heading__icon"><AreaIcon size={22} /></span>
        <div>
          <p className="section-label">Actividades de</p>
          <h2 id={`section-${family}`}>{area}</h2>
        </div>
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
  const family = activity.area === 'Lenguaje' ? 'language' : 'math'

  return (
    <article className={`activity-card activity-card--${family} ui-card`}>
      <div className="card-topline">
        <span>{activity.level}</span>
        {needsUpdate ? (
          <span className="update-flag" title="Hay una versión más nueva">
            <AlertTriangle size={16} />
            Actualizar
          </span>
        ) : null}
      </div>
      <div className="activity-card__content">
        <h3>{activity.title}</h3>
        <p>{activity.description}</p>
      </div>
      <div className="card-actions">
        <ActionButton icon={<ArrowRight aria-hidden="true" size={18} />} onClick={onOpen}>
          Abrir actividad
        </ActionButton>
        <DownloadButton download={download} onDownload={onDownload} />
      </div>
      <small className="version-chip" aria-label={`Versión ${activity.version}`}>
        Versión {activity.version}
      </small>
    </article>
  )
}

function countDownloaded(downloads: Record<string, DownloadRecord>) {
  return Object.values(downloads).filter((download) => download.state === 'downloaded').length
}
