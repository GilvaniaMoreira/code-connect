import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PostDetail } from '../../../services/posts'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { PostDetailPage } from './PostDetailPage'

vi.mock('../../../services/posts', () => ({
  getPost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
  commentOnPost: vi.fn(),
  thumbnailUrl: () => 'about:blank',
}))

vi.mock('../../../services/auth', () => ({
  extractApiError: (_error: unknown, fallback: string) => fallback,
}))

vi.mock('../../../lib/session', () => ({
  useIsAuthenticated: () => false,
}))

const { getPost } = await import('../../../services/posts')

function makeDetail(overrides: Partial<PostDetail> = {}): PostDetail {
  return {
    id: 'p1',
    slug: 'como-usar-useeffect',
    title: 'Como usar useEffect',
    description: 'Um guia rápido sobre efeitos colaterais',
    code: 'useEffect(() => {}, [])',
    tags: ['React'],
    thumbnail: null,
    author: { id: 'a1', nome: 'Ana', handle: '@ana' },
    likesCount: 3,
    commentsCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    comments: [],
    likedByMe: false,
    isAuthor: false,
    ...overrides,
  }
}

afterEach(() => {
  vi.mocked(getPost).mockReset()
})

function renderAtSlug(slug = 'como-usar-useeffect') {
  return renderWithRouter(<PostDetailPage />, {
    route: `/post/${slug}`,
    path: '/post/:slug',
  })
}

describe('PostDetailPage', () => {
  it('renders the loading status while fetching', () => {
    vi.mocked(getPost).mockReturnValue(new Promise(() => {}))

    renderAtSlug()

    expect(screen.getByRole('status')).toHaveTextContent(/carregando publicação/i)
  })

  it('renders the post title and code once resolved', async () => {
    vi.mocked(getPost).mockResolvedValue(makeDetail())

    renderAtSlug()

    expect(await screen.findByText(/como usar useeffect/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /código/i })).toBeInTheDocument()
  })

  it('renders the error alert when the fetch fails', async () => {
    vi.mocked(getPost).mockRejectedValue(new Error('boom'))

    renderAtSlug('missing')

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /não foi possível carregar o post/i,
      )
    })
  })
})
