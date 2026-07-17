import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Activity, ActivityModule, DownloadRecord } from '../types'
import { PortalHome } from './PortalHome'

function activity(id: string, area: Activity['area'], title: string): ActivityModule {
  return {
    activity: {
      area,
      description: `Descripción de ${title}`,
      id,
      level: 'Nivel inicial',
      migrationStatus: 'mvp',
      source: 'Prueba',
      title,
      version: '1',
    },
    assets: [],
    Component: (() => null) as never,
    load: async () => ({ default: () => null }),
  }
}

function download(activityId: string): DownloadRecord {
  return {
    activityId,
    availableVersion: '1',
    downloadedAt: null,
    downloadedVersion: null,
    errorMessage: null,
    state: 'available',
  }
}

describe('PortalHome', () => {
  it('presents one portal with clear Language and Mathematics families', () => {
    const modules = [
      activity('lectura', 'Lenguaje', 'Lectura'),
      activity('serpiente', 'Matemática', 'Serpiente'),
    ]
    const markup = renderToStaticMarkup(
      <PortalHome
        activityModules={modules}
        downloads={{ lectura: download('lectura'), serpiente: download('serpiente') }}
        isOnline
        onDownload={() => undefined}
        onOpen={() => undefined}
      />,
    )

    expect(markup).toContain('Aula de Actividades')
    expect(markup).toContain('family-language')
    expect(markup).toContain('family-math')
    expect(markup).toContain('Actividades de')
    expect(markup).toContain('Abrir actividad')
    expect(markup).not.toContain('Prototipo local')
  })

  it('communicates connection state in a live region', () => {
    const module = activity('lectura', 'Lenguaje', 'Lectura')
    const markup = renderToStaticMarkup(
      <PortalHome
        activityModules={[module]}
        downloads={{ lectura: download('lectura') }}
        isOnline={false}
        onDownload={() => undefined}
        onOpen={() => undefined}
      />,
    )

    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('Sin conexión')
  })
})
