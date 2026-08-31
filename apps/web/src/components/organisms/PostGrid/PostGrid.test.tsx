import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PostSummary } from '../../../services/posts'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { PostGrid } from './PostGrid'

const makePost = (id: string): PostSummary => ({
  id,
  slug: `post-${id}`,
  title: `Post ${id}`,
  description: '...',
  tags: [],
  thumbnail: null,
  author: { id: 'a', nome: 'x', handle: '@x' },
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date().toISOString(),
})

describe('PostGrid', () => {
  it('renders empty message when no posts', () => {
    renderWithRouter(<PostGrid posts={[]} emptyMessage="Vazio!" />)
    expect(screen.getByRole('status')).toHaveTextContent(/vazio/i)
  })

  it('renders one link per post', () => {
    renderWithRouter(<PostGrid posts={[makePost('1'), makePost('2')]} />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
