import type { ReactNode } from 'react'
import { Sidebar } from '../../organisms/Sidebar'

type AppLayoutProps = {
  active?: 'feed' | 'perfil' | 'sobre'
  children: ReactNode
}

// Layout compartilhado por Feed e Detalhes: sidebar fixa + coluna principal.
// Mantém a estrutura idêntica entre as páginas, evitando duplicação.
export function AppLayout({ active = 'feed', children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-8 px-4 py-14">
        <Sidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col gap-10">{children}</div>
      </div>
    </main>
  )
}
