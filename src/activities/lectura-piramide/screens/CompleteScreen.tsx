import { TopBar } from '../components/TopBar'

interface CompleteScreenProps {
  onBackToMenu: () => void
  onRestart: () => void
  onStartRandom: () => void
  onOpenCollection: () => void
}

const CONFETTI_COLORS = ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#f58b69', '#8a9cf8']

export function CompleteScreen({
  onBackToMenu,
  onRestart,
  onStartRandom,
  onOpenCollection,
}: CompleteScreenProps) {
  return (
    <>
      <TopBar label="Actividad finalizada" onBack={onBackToMenu} />

      <section className="result-card glass">
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, index) => (
            <span
              key={`confetti-${index}`}
              style={{
                left: `${(index * 9) % 100}%`,
                background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                animationDuration: `${4 + (index % 5) * 0.35}s`,
                animationDelay: `${(index % 7) * 0.18}s`,
              }}
            />
          ))}
        </div>

        <div className="eyebrow">🏆 Lectura completada</div>
        <h2 className="result-title">Actividad finalizada</h2>
        <p className="copy result-copy">
          Muy bien. Ya terminaste la lectura y sus preguntas.
        </p>

        <div className="score-orb" aria-hidden="true">
          <div>
            <strong>✓</strong>
            <div className="muted">listo</div>
          </div>
        </div>

        <div className="burst center-burst" aria-hidden="true">
          <span>✨</span>
          <span>🎊</span>
          <span>🎉</span>
          <span>✨</span>
        </div>

        <div className="result-actions">
          <button className="result-button" type="button" onClick={onRestart}>
            Repetir historia
          </button>
          <button className="secondary-button" type="button" onClick={onStartRandom}>
            Otra al azar
          </button>
          <button className="secondary-button" type="button" onClick={onOpenCollection}>
            Ver colección
          </button>
        </div>
      </section>
    </>
  )
}
