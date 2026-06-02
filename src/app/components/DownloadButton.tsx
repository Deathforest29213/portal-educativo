import { CheckCircle2, Download, LoaderCircle } from 'lucide-react'
import type { DownloadRecord } from '../../types'

type DownloadButtonProps = {
  download: DownloadRecord
  onDownload: () => void
}

export function DownloadButton({ download, onDownload }: DownloadButtonProps) {
  if (download.state === 'downloading') {
    return (
      <button className="secondary-button" disabled type="button">
        <LoaderCircle className="spin" size={17} />
        Descargando
      </button>
    )
  }

  if (download.state === 'downloaded') {
    return (
      <button className="secondary-button is-downloaded" onClick={onDownload} type="button">
        <CheckCircle2 size={17} />
        Descargada
      </button>
    )
  }

  return (
    <button className="secondary-button" onClick={onDownload} type="button">
      <Download size={17} />
      Descargar
    </button>
  )
}
