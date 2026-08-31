import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { extractApiError } from '../../../services/auth'
import { getPost, updatePost, type PostDetail } from '../../../services/posts'
import {
  PostForm,
  toApiPayload,
  type PostFormValues,
} from '../../organisms/PostForm'
import { AppLayout } from '../../templates/AppLayout'

export function EditPostPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPost(slug)
      .then((data) => {
        if (cancelled) return
        if (!data.isAuthor) {
          setError('Você não tem permissão para editar este post.')
          setPost(null)
          return
        }
        setPost(data)
      })
      .catch((err) => {
        if (!cancelled) setError(extractApiError(err, 'Não foi possível carregar o post.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const handleSubmit = async (values: PostFormValues) => {
    try {
      const updated = await updatePost(slug, toApiPayload(values))
      navigate(`/post/${updated.slug}`)
    } catch (err) {
      throw new Error(extractApiError(err, 'Não foi possível salvar as alterações.'))
    }
  }

  return (
    <AppLayout>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Editar publicação</h1>
      </header>

      {loading && (
        <p role="status" className="text-muted">
          Carregando publicação...
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-foreground/90">
          {error}
        </p>
      )}

      {post && (
        <PostForm
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/post/${post.slug}`)}
          initialValues={{
            title: post.title,
            description: post.description,
            code: post.code,
            tags: post.tags.join(', '),
            thumbnail: post.thumbnail ?? '',
          }}
        />
      )}
    </AppLayout>
  )
}
