import { useEffect, useRef } from 'react'
import { ActionButton } from './ActionButton'

type ConfirmDialogProps = {
  cancelLabel?: string
  confirmLabel: string
  description: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
  tone?: 'primary' | 'danger'
}

export function ConfirmDialog({
  cancelLabel = 'Seguir aquí',
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  open,
  title,
  tone = 'primary',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      cancelRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="confirm-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      ref={dialogRef}
    >
      <div className="confirm-dialog__body">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>
        <div className="confirm-dialog__actions">
          <ActionButton onClick={onCancel} ref={cancelRef} variant="secondary">
            {cancelLabel}
          </ActionButton>
          <ActionButton onClick={onConfirm} variant={tone === 'danger' ? 'danger' : 'primary'}>
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </dialog>
  )
}
