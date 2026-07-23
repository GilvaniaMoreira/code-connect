import { useEffect, useState } from 'react'
import { useIsAuthenticated } from '../../../lib/session'
import { extractApiError } from '../../../services/auth'
import {
  commentOnPost,
  getPost,
  likePost,
  unlikePost,
  type PostDetail,
} from '../../../services/posts'
import { CodeBlock } from '../../organisms/CodeBlock'
import { CommentSection } from '../../organisms/CommentSection'
import { PostCard } from '../../organisms/PostCard'
import { AppLayout } from '../../templates/AppLayout'

type PostDetailPageProps = {
  slug: string
}

export function PostDetailPage({ slug }: PostDetailPageProps) {
  const isAuthenticated = useIsAuthenticated()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <AppLayout active="feed">
      <a
        href="#/feed"
        className="text-sm text-muted underline underline-offset-4 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ← Voltar ao feed
      </a>

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
