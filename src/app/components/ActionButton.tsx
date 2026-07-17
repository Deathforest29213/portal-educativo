import { LoaderCircle } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'quiet' | 'icon'

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean
  busyLabel?: string
  icon?: ReactNode
  variant?: ActionButtonVariant
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton({
  busy = false,
  busyLabel = 'Cargando',
  children,
  className = '',
  disabled,
  icon,
  type = 'button',
  variant = 'primary',
  ...props
}, ref) {
  const classes = ['action-button', `action-button--${variant}`, className].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      aria-busy={busy || undefined}
      className={classes}
      disabled={disabled || busy}
      ref={ref}
      type={type}
    >
      {busy ? <LoaderCircle aria-hidden="true" className="spin" size={18} /> : icon}
      {busy ? busyLabel : children}
    </button>
  )
})
