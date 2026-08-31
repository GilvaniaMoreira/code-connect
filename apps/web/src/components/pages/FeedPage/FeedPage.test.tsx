import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PaginatedPosts, PostSummary } from '../../../services/posts'
import { FeedPage } from './FeedPage'

vi.mock('../../../services/posts', () => ({
  listPosts: vi.fn(),
  thumbnailUrl: () => 'about:blank',
}))

vi.mock('../../../services/auth', () => ({
  extractApiError: (_error: unknown, fallback: string) => fallback,
}))

const { listPosts } = await import('../../../services/posts')

function makePost(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    id: 'p1',
    slug: 'como-usar-useeffect',
    title: 'Como usar useEffect',
    description: 'Um guia rápido sobre efeitos colaterais',
    tags: ['React'],
    thumbnail: null,
    author: { id: 'a1', nome: 'Ana', handle: '@ana' },
    likesCount: 3,
    commentsCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

afterEach(() => {
  vi.mocked(listPosts).mockReset()
})

describe('FeedPage', () => {
  it('renders the loading status while fetching', () => {
    vi.mocked(listPosts).mockReturnValue(new Promise(() => {}))

    render(<FeedPage />)

    expect(screen.getByRole('status')).toHaveTextContent(/carregando publicações/i)
  })

  it('renders the fetched posts', async () => {
    const payload: PaginatedPosts = {
      items: [makePost()],
      page: 1,
      pageSize: 12,
      total: 1,
    }
    vi.mocked(listPosts).mockResolvedValue(payload)

    render(<FeedPage />)

    expect(await screen.findByRole('link', { name: /como usar useeffect/i })).toBeInTheDocument()
  })

  it('renders the error alert when the fetch fails', async () => {
    vi.mocked(listPosts).mockRejectedValue(new Error('boom'))

    render(<FeedPage />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível carregar o feed/i)
    })
  })
})
