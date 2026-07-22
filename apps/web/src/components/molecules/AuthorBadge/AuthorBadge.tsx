import { Avatar } from '../../atoms/Avatar'
import type { PostAuthor } from '../../../services/posts'

type AuthorBadgeProps = {
  author: PostAuthor
}

export function AuthorBadge({ author }: AuthorBadgeProps) {
  return (
    <span className="flex items-center gap-2 text-sm text-muted">
      <Avatar name={author.handle} />
      <span className="font-semibold">{author.handle}</span>
    </span>
  )
}
