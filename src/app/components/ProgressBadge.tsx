type ProgressBadgeProps = {
  current: number
  label: string
  showBar?: boolean
  total: number
}

export function ProgressBadge({ current, label, showBar = true, total }: ProgressBadgeProps) {
  const safeTotal = Math.max(total, 1)
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal)

  return (
    <span className="progress-badge">
      <span>{label}: {safeCurrent} de {safeTotal}</span>
      {showBar ? <progress aria-label={`${label}: ${safeCurrent} de ${safeTotal}`} max={safeTotal} value={safeCurrent} /> : null}
    </span>
  )
}
