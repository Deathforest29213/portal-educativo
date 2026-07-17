import { AlertCircle, CheckCircle2, Download, LoaderCircle, RefreshCw } from 'lucide-react'
import type { DownloadRecord } from '../../types'
import { ActionButton } from './ActionButton'

type DownloadButtonProps = {
  download: DownloadRecord
  onDownload: () => void
}

export function DownloadButton({ download, onDownload }: DownloadButtonProps) {
  if (download.state === 'downloading' || download.state === 'updating') {
    return (
      <ActionButton
        busy
        busyLabel={download.state === 'updating' ? 'Actualizando' : 'Descargando'}
        icon={<LoaderCircle aria-hidden="true" className="spin" size={17} />}
        variant="secondary"
      />
    )
  }

  if (download.state === 'downloaded') {
    const needsUpdate = download.downloadedVersion !== download.availableVersion

    return (
      <ActionButton
        className="is-downloaded"
        icon={needsUpdate ? <RefreshCw aria-hidden="true" size={17} /> : <CheckCircle2 aria-hidden="true" size={17} />}
        onClick={onDownload}
        variant="secondary"
      >
        {needsUpdate ? 'Actualizar' : 'Descargada'}
      </ActionButton>
    )
  }

  if (download.state === 'error') {
    return (
      <ActionButton
        aria-label={download.errorMessage ? `Reintentar descarga. ${download.errorMessage}` : 'Reintentar descarga'}
        icon={<AlertCircle aria-hidden="true" size={17} />}
        onClick={onDownload}
        title={download.errorMessage ?? undefined}
        variant="secondary"
      >
        Reintentar
      </ActionButton>
    )
  }

  return (
    <ActionButton icon={<Download aria-hidden="true" size={17} />} onClick={onDownload} variant="secondary">
      Descargar
    </ActionButton>
  )
}
