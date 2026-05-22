import { PyramidStack } from '../components/PyramidStack'
import { TopBar } from '../components/TopBar'
import type { Minihistory } from '../types'
import type { CSSProperties } from 'react'
import { getCurrentImage } from '../utils/pyramid'

interface ExerciseScreenProps {
  story: Minihistory
  lineIndex: number
  sourceView: 'menu' | 'collection'
  onBack: () => void
  onRestart: () => void
}

export function ExerciseScreen({
  story,
  lineIndex,
  sourceView,
  onBack,
  onRestart,
}: ExerciseScreenProps) {
  const currentLine = story.lines[lineIndex]
  const currentImage = getCurrentImage(story, lineIndex)
  const progress = ((lineIndex + 1) / story.lines.length) * 100

  return (
    <div className="reading-wrap">
      <TopBar
        backLabel={sourceView === 'collection' ? 'Volver a historias' : 'Volver a la lectura'}
        onBack={onBack}
      />

      <section className="reading-grid">
        <div className="visual-panel glass">
          <div className="story-badges">
            <div className="badge">{story.badge}</div>
            <div className="badge">
              Paso {lineIndex + 1} de {story.lines.length}
            </div>
          </div>

          <h2 className="story-title">{story.title}</h2>

          <div className="progress" style={{ '--progress': `${progress}%` } as CSSProperties}>
            <span />
          </div>

          <div className="image-stage">
            <div className="image-frame">
              {currentImage ? (
                <img
                  key={`${story.id}-${lineIndex}`}
                  className="reveal"
                  src={currentImage}
                  alt={currentLine.text}
                />
              ) : (
                <div className="image-placeholder">Imagen pendiente</div>
              )}
            </div>
          </div>
        </div>

        <div className="pyramid-panel glass">
          <div className="eyebrow">
            <span>🔺</span>
            <span>Pirámide de lectura</span>
          </div>

          <h3 className="section-title">Lectura guiada</h3>
          <PyramidStack story={story} visibleCount={lineIndex + 1} />

          <div className="controls">
            <button className="secondary-button" type="button" onClick={onRestart}>
              Reiniciar lectura
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
