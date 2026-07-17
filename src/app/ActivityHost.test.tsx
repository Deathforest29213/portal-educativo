import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ActivityModule, DownloadRecord, DownloadState } from '../types'
import { ActivityHost } from './ActivityHost'

function activityModule(): ActivityModule {
  return {
    activity: {
      area: 'Lenguaje',
      description: 'Actividad de prueba',
      id: 'lectura-prueba',
      level: 'Nivel inicial',
      migrationStatus: 'mvp',
      source: 'Prueba',
      title: 'Lectura de prueba',
      version: '1',
    },
    assets: [],
    Component: (() => <p>Contenido de la actividad</p>) as never,
    load: async () => ({ default: () => <p>Contenido de la actividad</p> }),
  }
}

function download(state: DownloadState): DownloadRecord {
  return {
    activityId: 'lectura-prueba',
    availableVersion: '1',
    downloadedAt: state === 'downloaded' ? '2026-07-15T00:00:00.000Z' : null,
    downloadedVersion: state === 'downloaded' ? '1' : null,
    errorMessage: null,
    state,
  }
}

describe('ActivityHost offline state', () => {
  it('blocks an unavailable activity and explains how to recover', () => {
    const markup = renderToStaticMarkup(
      <ActivityHost
        activityModule={activityModule()}
        download={download('available')}
        isOnline={false}
        onBack={() => undefined}
        onDownload={() => undefined}
      />,
    )

    expect(markup).toContain('Actividad no disponible sin internet')
    expect(markup).toContain('Conéctate y descárgala antes de volver a intentarlo.')
    expect(markup).toContain('aria-label="Cerrar actividad"')
    expect(markup).toContain('title="Cerrar actividad y volver al portal"')
    expect(markup).not.toContain('Contenido de la actividad')
  })

  it('ubica el cierre de la actividad después de la acción de descarga', () => {
    const markup = renderToStaticMarkup(
      <ActivityHost
        activityModule={activityModule()}
        download={download('available')}
        isOnline
        onBack={() => undefined}
        onDownload={() => undefined}
      />,
    )

    expect(markup).toContain('action-button--danger activity-header__close')
    expect(markup.indexOf('Descargar')).toBeLessThan(markup.indexOf('aria-label="Cerrar actividad"'))
  })

  it('keeps downloaded activity content available without a connection', () => {
    const markup = renderToStaticMarkup(
      <ActivityHost
        activityModule={activityModule()}
        download={download('downloaded')}
        isOnline={false}
        onBack={() => undefined}
        onDownload={() => undefined}
      />,
    )

    expect(markup).toContain('Contenido de la actividad')
    expect(markup).not.toContain('Actividad no disponible sin internet')
  })
})
