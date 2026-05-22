import type { Minihistory } from '../types'
import { TopBar } from '../components/TopBar'

interface CollectionScreenProps {
  stories: Minihistory[]
  onBack: () => void
  onSelectStory: (storyId: string) => void
}

export function CollectionScreen({
  stories,
  onBack,
  onSelectStory,
}: CollectionScreenProps) {
  return (
    <>
      <TopBar label="Colección completa" onBack={onBack} />

      <section className="hero-card glass">
        <h2 className="section-title">Minihistorias disponibles</h2>
        <p className="copy">
          Cada historia está armada para que la imagen y la pirámide avancen
          juntas.
        </p>

        <div className="collection-grid">
          {stories.map((story) => {
            const finalLine = story.lines[story.lines.length - 1]
            return (
              <button
                key={story.id}
                className="story-card soft"
                type="button"
                onClick={() => onSelectStory(story.id)}
              >
                <div className="eyebrow">{story.badge}</div>
                <strong>{story.title}</strong>
                {finalLine.image ? (
                  <img src={finalLine.image} alt={story.title} loading="lazy" />
                ) : null}
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}
