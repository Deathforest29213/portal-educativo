import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ActionButton } from './ActionButton'
import { ConfirmDialog } from './ConfirmDialog'
import { FeedbackBanner } from './FeedbackBanner'
import { ProgressBadge } from './ProgressBadge'

describe('shared visual components', () => {
  it('exposes an explicit busy action state', () => {
    const markup = renderToStaticMarkup(<ActionButton busy busyLabel="Preparando">Abrir</ActionButton>)

    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('disabled')
    expect(markup).toContain('Preparando')
  })

  it('uses live semantics and redundant status content', () => {
    const markup = renderToStaticMarkup(
      <FeedbackBanner title="No se pudo guardar" tone="danger">Inténtalo de nuevo.</FeedbackBanner>,
    )

    expect(markup).toContain('role="alert"')
    expect(markup).toContain('feedback-banner--danger')
    expect(markup).toContain('No se pudo guardar')
    expect(markup).toContain('Inténtalo de nuevo')
  })

  it('allows a contextual icon without changing the live semantics', () => {
    const markup = renderToStaticMarkup(
      <FeedbackBanner icon={<span aria-hidden="true">↑</span>}>Sigue hacia arriba.</FeedbackBanner>,
    )

    expect(markup).toContain('role="status"')
    expect(markup).toContain('↑')
    expect(markup).toContain('Sigue hacia arriba')
  })

  it('communicates progress as text and a native value', () => {
    const markup = renderToStaticMarkup(<ProgressBadge current={3} label="Pregunta" total={5} />)

    expect(markup).toContain('Pregunta: 3 de 5')
    expect(markup).toContain('<progress')
    expect(markup).toContain('value="3"')
    expect(markup).toContain('max="5"')
  })

  it('renders a labelled native modal with safe and explicit actions', () => {
    const markup = renderToStaticMarkup(
      <ConfirmDialog
        confirmLabel="Terminar partida"
        description="Se conservará el puntaje actual."
        onCancel={() => undefined}
        onConfirm={() => undefined}
        open
        title="¿Terminar la partida?"
        tone="danger"
      />,
    )

    expect(markup).toContain('<dialog')
    expect(markup).toContain('aria-labelledby="confirm-dialog-title"')
    expect(markup).toContain('Seguir aquí')
    expect(markup).toContain('Terminar partida')
  })

  it('uses native modal behavior for focus, Escape and background blocking', () => {
    const source = readFileSync(new URL('./ConfirmDialog.tsx', import.meta.url), 'utf8')

    expect(source).toContain('dialog.showModal()')
    expect(source).toContain('cancelRef.current?.focus()')
    expect(source).toContain('onCancel={(event) =>')
    expect(source).toContain('event.preventDefault()')
    expect(source).toContain('dialog.close()')
  })
})
