import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PublicUser } from '../../../services/auth'
import type { PostSummary } from '../../../services/posts'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { ProfilePage } from './ProfilePage'

vi.mock('../../../services/auth', () => ({
  getMe: vi.fn(),
  extractApiError: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('../../../services/posts', () => ({
  listPosts: vi.fn(),
  thumbnailUrl: () => 'about:blank',
}))

const { getMe } = await import('../../../services/auth')
const { listPosts } = await import('../../../services/posts')

const me: PublicUser = { id: 'u1', nome: 'Ana', email: 'ana@x.com' }

function post(id: string, authorId: string): PostSummary {
  return {
    id,
    slug: `slug-${id}`,
    title: `Post ${id}`,
    description: 'x',
    tags: [],
    thumbnail: null,
    author: { id: authorId, nome: 'x', handle: '@x' },
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  }
}

afterEach(() => {
  vi.mocked(getMe).mockReset()
  vi.mocked(listPosts).mockReset()
})

describe('ProfilePage', () => {
  it('renders the loading state initially', () => {
    vi.mocked(getMe).mockReturnValue(new Promise(() => {}))
    vi.mocked(listPosts).mockReturnValue(new Promise(() => {}))

    renderWithRouter(<ProfilePage />)

    expect(screen.getByText(/carregando perfil/i)).toBeInTheDocument()
  })

  it('shows the user info and only their posts', async () => {
    vi.mocked(getMe).mockResolvedValue(me)
    vi.mocked(listPosts).mockResolvedValue({
      items: [post('1', me.id), post('2', 'someone-else'), post('3', me.id)],
      page: 1,
      pageSize: 50,
      total: 3,
    })

    renderWithRouter(<ProfilePage />)

    expect(await screen.findByRole('heading', { name: /ana/i })).toBeInTheDocument()
    expect(screen.getByText('ana@x.com')).toBeInTheDocument()

    // Só posts do usuário aparecem — 2 dos 3.
    const cards = screen.getAllByRole('link', { name: /abrir publicação/i })
    expect(cards).toHaveLength(2)
  })

  it('renders the empty state when the user has no posts', async () => {
    vi.mocked(getMe).mockResolvedValue(me)
    vi.mocked(listPosts).mockResolvedValue({
      items: [post('99', 'someone-else')],
      page: 1,
      pageSize: 50,
      total: 1,
    })

    renderWithRouter(<ProfilePage />)

    expect(await screen.findByText(/você ainda não publicou nada/i)).toBeInTheDocument()
  })
})
