import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../atoms/Avatar'
import { Button } from '../../atoms/Button'
import type { PostComment } from '../../../services/posts'

type CommentSectionProps = {
  comments: PostComment[]
  canComment: boolean
  onSubmit?: (content: string) => Promise<void>
  submittingLabel?: string
}

export function CommentSection({
  comments,
  canComment,
  onSubmit,
  submittingLabel = 'Enviando...',
}: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!onSubmit || submitting) return
    const trimmed = content.trim()
    if (!trimmed) return
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setContent('')
    } catch {
      setError('Não foi possível enviar seu comentário. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="comentarios-title"
      className="flex w-full flex-col gap-6 rounded-lg bg-muted px-4 py-8 text-surface"
    >
      <h2 id="comentarios-title" className="text-xl font-semibold">
        Comentários
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm">Seja a primeira pessoa a comentar.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-input">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3 py-3">
              <Avatar name={comment.author.handle} />
              <div className="flex flex-col gap-1 text-sm">
                <span>
                  <strong className="font-semibold">{comment.author.handle}</strong>{' '}
                  {comment.content}
                </span>
                <span className="text-xs text-surface/70">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canComment ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="comment-input" className="sr-only">
            Escreva um comentário
          </label>
          <textarea
            id="comment-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            maxLength={1000}
            className="w-full resize-y rounded-md bg-input p-3 text-sm text-surface placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && (
            <p role="alert" className="text-sm text-surface">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || content.trim().length === 0}>
              {submitting ? submittingLabel : 'Comentar'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm">
          <Link to="/login" className="underline underline-offset-2 hover:text-background">
            Entre
          </Link>{' '}
          ou{' '}
          <Link
            to="/cadastro"
            className="underline underline-offset-2 hover:text-background"
          >
            cadastre-se
          </Link>{' '}
          para comentar.
        </p>
      )}
    </section>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
