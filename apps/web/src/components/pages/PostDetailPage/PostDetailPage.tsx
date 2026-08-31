import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useIsAuthenticated } from '../../../lib/session'
import { extractApiError } from '../../../services/auth'
import {
  commentOnPost,
  deletePost,
  getPost,
  likePost,
  unlikePost,
  type PostDetail,
} from '../../../services/posts'
import { Button } from '../../atoms/Button'
import { CodeBlock } from '../../organisms/CodeBlock'
import { CommentSection } from '../../organisms/CommentSection'
import { PostCard } from '../../organisms/PostCard'
import { AppLayout } from '../../templates/AppLayout'

export function PostDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPost(slug)
      .then((data) => {
        if (!cancelled) setPost(data)
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractApiError(err, 'Não foi possível carregar o post.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const handleLikeToggle = async () => {
    if (!post) return
    try {
      const result = post.likedByMe ? await unlikePost(post.slug) : await likePost(post.slug)
      setPost({ ...post, likesCount: result.likesCount, likedByMe: result.likedByMe })
    } catch (err) {
      setError(extractApiError(err, 'Não foi possível registrar sua curtida.'))
    }
  }

  const handleComment = async (content: string) => {
    if (!post) return
    const created = await commentOnPost(post.slug, content)
    setPost({
      ...post,
      comments: [...post.comments, created],
      commentsCount: post.commentsCount + 1,
    })
  }

  const handleDelete = async () => {
    if (!post || deleting) return
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este post? Essa ação não pode ser desfeita.',
    )
    if (!confirmed) return
    setDeleting(true)
    try {
      await deletePost(post.slug)
      navigate('/feed')
    } catch (err) {
      setError(extractApiError(err, 'Não foi possível excluir o post.'))
      setDeleting(false)
    }
  }

  return (
    <AppLayout active="feed">
      <Link
        to="/feed"
        className="text-sm text-muted underline underline-offset-4 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ← Voltar ao feed
      </Link>

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
        <>
          <PostCard
            post={post}
            variant="detail"
            likedByMe={post.likedByMe}
            onLikeToggle={isAuthenticated ? handleLikeToggle : undefined}
            interactionsDisabled={!isAuthenticated}
          />

          {post.isAuthor && (
            <div className="flex gap-3">
              <Link
                to={`/post/${post.slug}/editar`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-divider bg-transparent px-4 py-3 text-base font-semibold text-foreground transition hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Editar
              </Link>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          )}

          <CodeBlock code={post.code} />

          <CommentSection
            comments={post.comments}
            canComment={isAuthenticated}
            onSubmit={handleComment}
          />
        </>
      )}
    </AppLayout>
  )
}
