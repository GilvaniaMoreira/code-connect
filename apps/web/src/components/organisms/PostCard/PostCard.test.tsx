import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PostSummary } from '../../../services/posts'
import { PostCard } from './PostCard'

const post: PostSummary = {
  id: '1',
  slug: 'meu-post',
  title: 'Meu post',
  description: 'Descrição do post.',
  tags: ['React', 'Tests'],
  thumbnail: null,
  author: { id: 'a', nome: 'Julio', handle: '@julio' },
  likesCount: 3,
  commentsCount: 1,
  createdAt: new Date().toISOString(),
}

describe('PostCard', () => {
  it('renders as link to detail when href provided', () => {
    render(<PostCard post={post} href="#/post/meu-post" />)
    const link = screen.getByRole('link', { name: /abrir publicação/i })
    expect(link).toHaveAttribute('href', '#/post/meu-post')
    expect(screen.getByRole('heading', { name: 'Meu post' })).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('disables like when interactionsDisabled is true', () => {
    render(<PostCard post={post} variant="detail" interactionsDisabled />)
    // Não há botão de curtir renderizado (only static)
    expect(screen.queryByRole('button', { name: /curtir/i })).not.toBeInTheDocument()
  })

  it('calls onLikeToggle when like button clicked', async () => {
    const onLikeToggle = vi.fn()
    render(
      <PostCard
        post={post}
        variant="detail"
        onLikeToggle={onLikeToggle}
        likedByMe={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /curtir post/i }))
    expect(onLikeToggle).toHaveBeenCalledTimes(1)
  })
})
