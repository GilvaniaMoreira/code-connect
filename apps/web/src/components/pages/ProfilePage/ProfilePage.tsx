import { useEffect, useState } from 'react'
import { extractApiError, getMe, type PublicUser } from '../../../services/auth'
import { listPosts, type PostSummary } from '../../../services/posts'
import { Avatar } from '../../atoms/Avatar'
import { PostGrid } from '../../organisms/PostGrid'
import { AppLayout } from '../../templates/AppLayout'

export function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([getMe(), listPosts({ pageSize: 50 })])
      .then(([me, feed]) => {
        if (cancelled) return
        setUser(me)
        setPosts(feed.items.filter((post) => post.author.id === me.id))
      })
      .catch((err) => {
        if (!cancelled) setError(extractApiError(err, 'Não foi possível carregar o perfil.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AppLayout active="perfil">
      {loading && (
        <p role="status" className="text-muted">
          Carregando perfil...
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-foreground/90">
          {error}
        </p>
      )}

      {user && (
        <>
          <section className="flex items-center gap-4 rounded-lg bg-surface p-6">
            <Avatar name={user.nome} size="md" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-foreground">{user.nome}</h1>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <header className="flex justify-center border-b border-divider pb-4">
              <h2 className="text-xl font-semibold text-primary underline underline-offset-4">
                Minhas publicações
              </h2>
            </header>
            <PostGrid
              posts={posts}
              emptyMessage="Você ainda não publicou nada. Que tal começar agora?"
            />
          </section>
        </>
      )}
    </AppLayout>
  )
}
