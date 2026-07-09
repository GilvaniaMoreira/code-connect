import type { ReactNode } from 'react'

type DividerProps = {
  children?: ReactNode
}

export function Divider({ children }: DividerProps) {
  if (!children) {
    return <hr className="border-divider" />
  }

  return (
    <div className="flex items-center gap-3 text-sm text-muted" role="separator">
      <span className="h-px flex-1 bg-divider" aria-hidden="true" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-divider" aria-hidden="true" />
    </div>
  )
}
