import { useIsAuthenticated } from '../../../lib/session'
import { clearToken } from '../../../lib/token'
import { MaterialIcon } from '../../atoms/MaterialIcon'

type SidebarProps = {
  active?: 'feed' | 'perfil' | 'sobre'
}

type MenuItem = {
  id: 'feed' | 'perfil' | 'sobre'
  icon: string
  label: string
  href: string
}

const items: MenuItem[] = [
  { id: 'feed', icon: 'feed', label: 'Feed', href: '#/feed' },
  { id: 'perfil', icon: 'account_circle', label: 'Perfil', href: '#/perfil' },
  { id: 'sobre', icon: 'info', label: 'Sobre nós', href: '#/sobre' },
]

export function Sidebar({ active = 'feed' }: SidebarProps) {
  const isAuthenticated = useIsAuthenticated()

  const handleLogout = () => {
    clearToken()
    window.location.hash = '#/feed'
  }

  return (
    <aside className="flex w-44 shrink-0 flex-col items-center gap-20 self-stretch rounded-lg bg-surface p-4">
      <a href="#/feed" aria-label="Ir para o feed">
        <Logo />
      </a>

      <nav className="flex w-full flex-col items-center gap-10">
        {isAuthenticated && (
          <a
            href="#/publicar"
            className="flex w-full items-center justify-center rounded-lg border border-primary px-4 py-3 text-lg text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Publicar
          </a>
        )}

        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={item.id === active ? 'page' : undefined}
            className={`flex flex-col items-center gap-2 rounded-md px-4 py-2 text-lg transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              item.id === active ? 'text-foreground' : 'text-muted'
            }`}
          >
            <MaterialIcon name={item.icon} size="lg" />
            <span>{item.label}</span>
          </a>
        ))}

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-md px-4 py-2 text-lg text-muted transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MaterialIcon name="logout" size="lg" />
            <span>Sair</span>
          </button>
        ) : (
          <a
            href="#/login"
            className="flex flex-col items-center gap-2 rounded-md px-4 py-2 text-lg text-muted transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MaterialIcon name="login" size="lg" />
            <span>Login</span>
          </a>
        )}
      </nav>
    </aside>
  )
}

function Logo() {
  return (
    <span className="flex items-center gap-2 text-primary">
      <MaterialIcon name="code" size="xl" />
      <span className="flex flex-col font-semibold leading-none">
        <span>code</span>
        <span>connect</span>
      </span>
    </span>
  )
}
