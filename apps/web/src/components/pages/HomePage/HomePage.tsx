import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../atoms/Button'
import { clearToken } from '../../../lib/token'
import { extractApiError, getMe, type PublicUser } from '../../../services/auth'

export function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractApiError(err, 'Sessão expirada. Faça login novamente.'))
        clearToken()
        navigate('/login')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-surface p-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-foreground">Início</h1>
          <p className="text-base text-foreground/90">
            {loading ? 'Carregando seus dados...' : user ? `Olá, ${user.nome}!` : 'Sessão encerrada.'}
          </p>
        </header>

        {user && (
          <dl className="flex flex-col gap-2 text-sm text-foreground/90">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">ID</dt>
              <dd className="truncate">{user.id}</dd>
            </div>
          </dl>
        )}

        {error && (
          <p role="alert" className="text-sm text-foreground/90">
            {error}
          </p>
        )}

        <Button type="button" onClick={handleLogout} className="w-full">
          Sair
        </Button>
      </section>
    </main>
  )
}
