import { BookOpenCheck, Sparkles } from 'lucide-react'
import type { ActivityArea } from '../../types'
import { activityLoading } from '../loading/ActivityLoadingSingleton'

export function ActivityLoadingScreen({ area, title }: { area: ActivityArea; title: string }) {
  const presentation = activityLoading.getPresentation(area, title)

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="activity-loading-screen"
      role="status"
    >
      <div aria-hidden="true" className="activity-loading-visual">
        <span className="activity-loading-orbit">
          <Sparkles size={24} />
        </span>
        <span className="activity-loading-book">
          <BookOpenCheck size={52} strokeWidth={1.8} />
        </span>
        <span className="activity-loading-dot activity-loading-dot--one" />
        <span className="activity-loading-dot activity-loading-dot--two" />
      </div>
      <span className="task-badge">{presentation.area}</span>
      <h2>{presentation.title}</h2>
      <p>{presentation.description}</p>
      <span aria-hidden="true" className="activity-loading-progress"><span /></span>
    </section>
  )
}
