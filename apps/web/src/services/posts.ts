import { api } from '../lib/api'

export type PostAuthor = {
  id: string
  nome: string
  handle: string
}

export type PostSummary = {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  thumbnail: string | null
  author: PostAuthor
  likesCount: number
  commentsCount: number
  createdAt: string
}

export type PostComment = {
  id: string
  content: string
  createdAt: string
  author: PostAuthor
}

export type PostDetail = PostSummary & {
  code: string
  comments: PostComment[]
  likedByMe: boolean
}

export type PaginatedPosts = {
  items: PostSummary[]
  page: number
  pageSize: number
  total: number
}

export type ListPostsParams = {
  q?: string
  page?: number
  pageSize?: number
}

export async function listPosts(params: ListPostsParams = {}): Promise<PaginatedPosts> {
  const { data } = await api.get<PaginatedPosts>('/posts', { params })
  return data
}

export async function getPost(slug: string): Promise<PostDetail> {
  const { data } = await api.get<PostDetail>(`/posts/${encodeURIComponent(slug)}`)
  return data
}

export async function likePost(slug: string): Promise<{ likesCount: number; likedByMe: true }> {
  const { data } = await api.post<{ likesCount: number; likedByMe: true }>(
    `/posts/${encodeURIComponent(slug)}/likes`,
  )
  return data
}

export async function unlikePost(slug: string): Promise<{ likesCount: number; likedByMe: false }> {
  const { data } = await api.delete<{ likesCount: number; likedByMe: false }>(
    `/posts/${encodeURIComponent(slug)}/likes`,
  )
  return data
}

export async function commentOnPost(
  slug: string,
  content: string,
): Promise<PostComment> {
  const { data } = await api.post<PostComment>(
    `/posts/${encodeURIComponent(slug)}/comments`,
    { content },
  )
  return data
}

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function thumbnailUrl(post: Pick<PostSummary, 'slug' | 'thumbnail'>): string {
  if (post.thumbnail) return post.thumbnail
  return `${baseURL}/thumbnails/${encodeURIComponent(post.slug)}`
}
