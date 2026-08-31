import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { PublishPage } from './PublishPage'

vi.mock('../../../services/posts', () => ({
  createPost: vi.fn(),
  thumbnailUrl: () => 'about:blank',
}))
vi.mock('../../../services/auth', () => ({
  extractApiError: (_error: unknown, fallback: string) => fallback,
}))

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const { createPost } = await import('../../../services/posts')

afterEach(() => {
  vi.mocked(createPost).mockReset()
  mockNavigate.mockReset()
})

describe('PublishPage', () => {
  it('renders the form heading', () => {
    renderWithRouter(<PublishPage />)
    expect(screen.getByRole('heading', { name: /publicar/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
  })

  it('submits the form and navigates to the created post', async () => {
    vi.mocked(createPost).mockResolvedValue({
      id: 'p1',
      slug: 'meu-post',
      title: 'Meu post',
      description: 'Uma descrição bem completa',
      code: 'x',
      tags: ['React'],
      thumbnail: null,
      author: { id: 'u1', nome: 'Ana', handle: '@ana' },
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
      likedByMe: false,
      isAuthor: true,
    })

    renderWithRouter(<PublishPage />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Meu post')
    await userEvent.type(
      screen.getByLabelText(/descrição/i),
      'Uma descrição bem completa',
    )
    await userEvent.type(screen.getByLabelText(/código/i), 'x')
    await userEvent.type(screen.getByLabelText(/tags/i), 'React, Hooks')
    await userEvent.click(screen.getByRole('button', { name: /^publicar$/i }))

    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Meu post',
          description: 'Uma descrição bem completa',
          code: 'x',
          tags: ['React', 'Hooks'],
        }),
      )
    })
    expect(mockNavigate).toHaveBeenCalledWith('/post/meu-post')
  })
})
