import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export type FeedbackTone = 'info' | 'success' | 'warning' | 'danger'

type FeedbackBannerProps = {
  action?: ReactNode
  children: ReactNode
  className?: string
  icon?: ReactNode
  title?: string
  tone?: FeedbackTone
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
}

export function FeedbackBanner({ action, children, className = '', icon, title, tone = 'info' }: FeedbackBannerProps) {
  const Icon = icons[tone]
  const role = tone === 'danger' ? 'alert' : 'status'

  return (
    <section className={`feedback-banner feedback-banner--${tone} ${className}`.trim()} role={role}>
      {icon ?? <Icon aria-hidden="true" size={22} />}
      <div className="feedback-banner__content">
        {title ? <strong>{title}</strong> : null}
        <div>{children}</div>
        {action}
      </div>
    </section>
  )
}
