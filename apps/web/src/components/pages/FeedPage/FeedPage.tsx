import { useEffect, useState } from 'react'
import { extractApiError } from '../../../services/auth'
import { listPosts, type PostSummary } from '../../../services/posts'
import { FeedFilterBar } from '../../organisms/FeedFilterBar'
import { PostGrid } from '../../organisms/PostGrid'
import { AppLayout } from '../../templates/AppLayout'

export function FeedPage() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listPosts({ q: query || undefined })
      .then((data) => {
        if (!cancelled) setPosts(data.items)
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractApiError(err, 'Não foi possível carregar o feed.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <AppLayout active="feed">
      <FeedFilterBar
        query={query}
        tags={[]}
        onQueryChange={setQuery}
        onRemoveTag={() => {}}
        onClearAll={() => setQuery('')}
      />

      <section className="flex flex-col gap-8">
        <header className="flex justify-center border-b border-divider pb-4">
          <h1 className="text-xl font-semibold text-primary underline underline-offset-4">
            Recentes
          </h1>
        </header>

        {error && (
          <p role="alert" className="text-sm text-foreground/90">
            {error}
          </p>
        )}

        {loading ? (
          <p role="status" className="text-center text-muted">
            Carregando publicações...
          </p>
        ) : (
          <PostGrid
            posts={posts}
            emptyMessage={
              query ? `Nenhum resultado para "${query}".` : 'Nenhum post publicado ainda.'
            }
          />
        )}
      </section>
    </AppLayout>
  )
}
