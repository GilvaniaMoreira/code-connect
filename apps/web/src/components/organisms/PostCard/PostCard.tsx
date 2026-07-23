import type { ReactNode } from 'react'
import { Tag } from '../../atoms/Tag'
import { AuthorBadge } from '../../molecules/AuthorBadge'
import { PostStat } from '../../molecules/PostStat'
import { PostThumbnail } from '../../molecules/PostThumbnail'
import type { PostSummary } from '../../../services/posts'

type PostCardProps = {
  post: PostSummary
  variant?: 'feed' | 'detail'
  href?: string
  actions?: ReactNode
  likedByMe?: boolean
  onLikeToggle?: () => void
  onCommentClick?: () => void
  interactionsDisabled?: boolean
}

// Reaproveitado no feed (variant='feed', card clicável para o detalhe)
// e no topo da página de detalhe (variant='detail', com ações reais).
export function PostCard({
  post,
  variant = 'feed',
  href,
  actions,
  likedByMe = false,
  onLikeToggle,
  onCommentClick,
  interactionsDisabled = false,
}: PostCardProps) {
  const thumbSize = variant === 'detail' ? 'lg' : 'sm'
  const titleClass =
    variant === 'detail'
      ? 'text-2xl font-semibold text-foreground'
      : 'text-lg font-semibold text-foreground'

  const body = (
    <>
      <PostThumbnail post={post} size={thumbSize} />
      <div className="flex flex-col gap-4 rounded-b-lg bg-surface p-4">
        <div className="flex flex-col gap-2 break-words text-foreground">
          <h3 className={titleClass}>{post.title}</h3>
          <p className="text-sm text-foreground/80">{post.description}</p>
        </div>
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Tag label={tag} />
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {actions ?? (
              <>
                <PostStat
                  icon="code"
                  count={post.likesCount}
                  label={likedByMe ? 'Remover curtida' : 'Curtir post'}
                  active={likedByMe}
                  disabled={interactionsDisabled || !onLikeToggle}
                  onClick={onLikeToggle}
                  as={onLikeToggle ? 'button' : 'static'}
                />
                <PostStat icon="share" count={0} label="Compartilhar" as="static" />
                <PostStat
                  icon="chat"
                  count={post.commentsCount}
                  label="Comentar"
                  disabled={interactionsDisabled || !onCommentClick}
                  onClick={onCommentClick}
                  as={onCommentClick ? 'button' : 'static'}
                />
              </>
            )}
          </div>
          <AuthorBadge author={post.author} />
        </div>
      </div>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className="flex w-full max-w-lg flex-col rounded-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Abrir publicação: ${post.title}`}
      >
        {body}
      </a>
    )
  }

  return <article className="flex w-full flex-col rounded-lg">{body}</article>
}
