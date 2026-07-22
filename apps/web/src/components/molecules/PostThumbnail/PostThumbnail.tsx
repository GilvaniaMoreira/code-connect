import { useState } from 'react'
import type { PostSummary } from '../../../services/posts'
import { thumbnailUrl } from '../../../services/posts'

type PostThumbnailProps = {
  post: Pick<PostSummary, 'slug' | 'thumbnail' | 'title'>
  size?: 'sm' | 'lg'
}

const sizeClasses = {
  sm: 'h-60',
  lg: 'h-80',
}

// Se `post.thumbnail` for uma URL externa que falhar (404, CORS...) caímos no
// endpoint de placeholder do backend, que sempre responde um SVG determinístico.
export function PostThumbnail({ post, size = 'sm' }: PostThumbnailProps) {
  const [failed, setFailed] = useState(false)
  const src = failed
    ? thumbnailUrl({ slug: post.slug, thumbnail: null })
    : thumbnailUrl(post)

  return (
    <div
      className={`flex ${sizeClasses[size]} w-full items-start justify-start overflow-hidden rounded-t-lg bg-muted p-6`}
    >
      <img
        src={src}
        alt={post.thumbnail ? `Thumbnail: ${post.title}` : ''}
        onError={() => setFailed(true)}
        className="h-full w-full rounded-lg object-cover shadow-2xl"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
