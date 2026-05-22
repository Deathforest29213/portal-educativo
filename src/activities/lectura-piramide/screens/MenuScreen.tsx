import { APP_VERSION } from '../data/appVersion'

interface MenuScreenProps {
  hasStories: boolean
  inactiveStoryCount: number
  onStartRandom: () => void
  onOpenCollection: () => void
}

export function MenuScreen({
  hasStories,
  inactiveStoryCount,
  onStartRandom,
  onOpenCollection,
}: MenuScreenProps) {
  return (
    <section className="menu-stage">
      <div className="menu-window">
        <div className="menu-deco d1">🔺</div>
        <div className="menu-deco d2">📖</div>
        <div className="menu-deco d3">✨</div>
        <div className="menu-deco d4">💡</div>

        <div className="menu-content">
          <h1 className="menu-title">
            <span className="menu-title-accent">Lectura </span>
            <span className="menu-title-base">en Pirámide</span>
          </h1>

          <p className="menu-copy">
            A medida que bajas en la pirámide, la historia crece y la imagen
            cambia contigo.
          </p>

          <div className="version-badge">Versión {APP_VERSION}</div>

          {hasStories ? (
            <div className="menu-grid">
              <button className="menu-option-card red" type="button" onClick={onStartRandom}>
                <div className="menu-icon-bubble red">
                  <span>🎲</span>
                </div>
                <h2 className="menu-option-title">Historia al azar</h2>
                <p className="menu-option-copy">
                  Comienza de inmediato con una lectura sorpresa.
                </p>
                <span className="menu-option-cta red">Empezar</span>
              </button>

              <button
                className="menu-option-card yellow"
                type="button"
                onClick={onOpenCollection}
              >
                <div className="menu-icon-bubble yellow">
                  <span>📚</span>
                </div>
                <h2 className="menu-option-title">Colección</h2>
                <p className="menu-option-copy">
                  Revisa las minihistorias y elige cuál leer hoy.
                </p>
                <span className="menu-option-cta yellow">Explorar</span>
              </button>
            </div>
          ) : (
            <div className="empty-state">
              No hay historias listas para iniciar. Revisa los textos e imágenes
              fuente.
            </div>
          )}

          {inactiveStoryCount > 0 ? (
            <p className="source-note">
              Hay {inactiveStoryCount} historias fuente pendientes de imágenes o
              preguntas.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
