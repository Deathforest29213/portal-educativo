import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActivityLoadingScreen } from '../components/ActivityLoadingScreen'
import { ActivityLoadingSingleton, activityLoading } from './ActivityLoadingSingleton'

describe('ActivityLoadingSingleton', () => {
  it('entrega una única instancia compartida', () => {
    expect(ActivityLoadingSingleton.getInstance()).toBe(activityLoading)
    expect(ActivityLoadingSingleton.getInstance()).toBe(ActivityLoadingSingleton.getInstance())
  })

  it('presenta un estado de carga animable y accesible para cada actividad', () => {
    const markup = renderToStaticMarkup(
      <ActivityLoadingScreen area="Lenguaje" title="Guía de Lenguaje" />,
    )

    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('role="status"')
    expect(markup).toContain('Preparando Guía de Lenguaje')
    expect(markup).toContain('activity-loading-progress')
  })
})
