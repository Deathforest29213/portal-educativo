interface TopBarProps {
  label?: string
  backLabel?: string
  onBack?: () => void
}

export function TopBar({ label, backLabel = 'Volver a la lectura', onBack }: TopBarProps) {
  return (
    <div className="lp-topbar">
      {onBack ? (
        <button className="lp-back-button" type="button" onClick={onBack}>
          ← {backLabel}
        </button>
      ) : (
        <div />
      )}
      {label ? <div className="lp-pill">{label}</div> : null}
    </div>
  )
}
