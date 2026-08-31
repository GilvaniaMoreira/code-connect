import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PostDetail } from '../../../services/posts'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { EditPostPage } from './EditPostPage'

vi.mock('../../../services/posts', () => ({
  getPost: vi.fn(),
  updatePost: vi.fn(),
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

const { getPost, updatePost } = await import('../../../services/posts')

function makeDetail(overrides: Partial<PostDetail> = {}): PostDetail {
  return {
    id: 'p1',
    slug: 'meu-post',
    title: 'Título antigo',
    description: 'Descrição antiga',
    code: 'const x = 1',
    tags: ['React'],
    thumbnail: null,
    author: { id: 'u1', nome: 'Ana', handle: '@ana' },
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    comments: [],
    likedByMe: false,
    isAuthor: true,
    ...overrides,
  }
}

afterEach(() => {
  vi.mocked(getPost).mockReset()
  vi.mocked(updatePost).mockReset()
  mockNavigate.mockReset()
})

function renderAtSlug(slug = 'meu-post') {
  return renderWithRouter(<EditPostPage />, {
    route: `/post/${slug}/editar`,
    path: '/post/:slug/editar',
  })
}

describe('EditPostPage', () => {
  it('pre-fills the form with the existing post', async () => {
    vi.mocked(getPost).mockResolvedValue(makeDetail())

    renderAtSlug()

    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toHaveValue('Título antigo')
    })
    expect(screen.getByLabelText(/tags/i)).toHaveValue('React')
  })

  it('blocks editing when the viewer is not the author', async () => {
    vi.mocked(getPost).mockResolvedValue(makeDetail({ isAuthor: false }))

    renderAtSlug()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/não tem permissão/i)
    })
    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument()
  })

  it('submits changes and navigates to the updated post', async () => {
    vi.mocked(getPost).mockResolvedValue(makeDetail())
    vi.mocked(updatePost).mockResolvedValue(
      makeDetail({ title: 'Novo título', slug: 'meu-post' }),
    )

    renderAtSlug()
    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toHaveValue('Título antigo')
    })

    const titleInput = screen.getByLabelText(/título/i)
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Novo título')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(updatePost).toHaveBeenCalledWith(
        'meu-post',
        expect.objectContaining({ title: 'Novo título' }),
      )
    })
    expect(mockNavigate).toHaveBeenCalledWith('/post/meu-post')
  })
})
