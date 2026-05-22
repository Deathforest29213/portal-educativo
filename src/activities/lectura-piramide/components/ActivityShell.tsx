import type { ReactNode } from 'react'

interface ActivityShellProps {
  children: ReactNode
}

export function ActivityShell({ children }: ActivityShellProps) {
  return (
    <div className="lp-shell">
      <main className="lp-page">{children}</main>
    </div>
  )
}
