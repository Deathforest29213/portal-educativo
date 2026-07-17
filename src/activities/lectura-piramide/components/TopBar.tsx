interface TopBarProps {
  label?: string
  backLabel?: string
  onBack?: () => void
}

export function TopBar({ label, backLabel = 'Volver a la lectura', onBack }: TopBarProps) {
  return (
    <div className="lp-topbar">
      {onBack ? (
        <ActionButton className="lp-back-button" onClick={onBack} variant="quiet">
          ← {backLabel}
        </ActionButton>
      ) : (
        <div />
      )}
      {label ? <div className="lp-pill">{label}</div> : null}
    </div>
  )
}
import { ActionButton } from '../../../app/components/ActionButton'
