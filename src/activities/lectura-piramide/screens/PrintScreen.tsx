import { useEffect, useMemo, useState } from 'react'
import { PyramidStack } from '../components/PyramidStack'
import { TopBar } from '../components/TopBar'
import type { Minihistory } from '../types'
import { getCurrentImage } from '../utils/pyramid'

interface PrintScreenProps {
  stories: Minihistory[]
  onBack: () => void
}

export function PrintScreen({ stories, onBack }: PrintScreenProps) {
  const [selectedIds, setSelectedIds] = useState(() => stories.map((story) => story.id))
  const selectedStories = useMemo(
    () => stories.filter((story) => selectedIds.includes(story.id)),
    [selectedIds, stories],
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  function toggleStory(storyId: string) {
    setSelectedIds((current) =>
      current.includes(storyId)
        ? current.filter((currentId) => currentId !== storyId)
        : [...current, storyId],
    )
  }

  return (
    <section className="print-workspace">
      <div className="print-controls">
        <TopBar label="Preparar impresión" backLabel="Volver a historias" onBack={onBack} />

        <div className="print-panel glass">
          <div>
            <h2 className="section-title">Minihistorias para imprimir</h2>
            <p className="copy">
              Selecciona las láminas y luego guarda como PDF desde la ventana de impresión.
            </p>
          </div>

          <div className="print-action-row">
            <button className="secondary-button" type="button" onClick={() => setSelectedIds(stories.map((story) => story.id))}>
              Seleccionar todas
            </button>
            <button className="secondary-button" type="button" onClick={() => setSelectedIds([])}>
              Limpiar selección
            </button>
            <button
              className="result-button"
              disabled={selectedStories.length === 0}
              type="button"
              onClick={() => window.print()}
            >
              Imprimir / Guardar PDF
            </button>
          </div>

          <div className="print-selection-grid" aria-label="Selección de minihistorias">
            {stories.map((story) => {
              const finalImage = getCurrentImage(story, story.lines.length - 1)
              const isSelected = selectedIds.includes(story.id)

              return (
                <label className={`print-select-card soft ${isSelected ? 'is-selected' : ''}`} key={story.id}>
                  <input
                    checked={isSelected}
                    onChange={() => toggleStory(story.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{story.title}</strong>
                    <small>{story.badge}</small>
                  </span>
                  {finalImage ? <img alt="" loading="lazy" src={finalImage} /> : null}
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <div className="print-preview" aria-label="Vista previa de impresión">
        {selectedStories.length === 0 ? (
          <div className="print-empty glass">
            <h2 className="section-title">No hay minihistorias seleccionadas</h2>
            <p className="copy">Marca al menos una lámina para ver la vista previa.</p>
          </div>
        ) : (
          selectedStories.map((story) => <PrintableStory key={story.id} story={story} />)
        )}
      </div>
    </section>
  )
}

function PrintableStory({ story }: { story: Minihistory }) {
  const finalImage = getCurrentImage(story, story.lines.length - 1)

  return (
    <article className="print-story-page">
      <div className="print-cut-card">
        <header className="print-story-header">
          <span>{story.badge}</span>
          <h2>{story.title}</h2>
        </header>

        <div className="print-image-frame">
          {finalImage ? <img alt={story.title} src={finalImage} /> : <div>Imagen pendiente</div>}
        </div>

        <PyramidStack story={story} mode="print" />
      </div>
    </article>
  )
}
