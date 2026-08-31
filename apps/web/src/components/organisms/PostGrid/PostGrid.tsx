import type { PostSummary } from '../../../services/posts'
import { PostCard } from '../PostCard'

type PostGridProps = {
  posts: PostSummary[]
  emptyMessage?: string
}

export function PostGrid({ posts, emptyMessage = 'Nenhum post encontrado.' }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <p role="status" className="w-full py-8 text-center text-muted">
        {emptyMessage}
      </p>
    )
  }
  return (
    <ul className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <li key={post.id} className="flex">
          <PostCard post={post} to={`/post/${post.slug}`} />
        </li>
      ))}
    </ul>
  )
}
