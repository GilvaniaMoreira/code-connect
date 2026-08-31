import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PublicUser } from '../../../services/auth'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { HomePage } from './HomePage'

vi.mock('../../../services/auth', () => ({
  getMe: vi.fn(),
  extractApiError: (_error: unknown, fallback: string) => fallback,
}))

vi.mock('../../../lib/token', () => ({
  clearToken: vi.fn(),
}))

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const { getMe } = await import('../../../services/auth')
const { clearToken } = await import('../../../lib/token')

const user: PublicUser = {
  id: 'user-1',
  nome: 'Ana',
  email: 'ana@x.com',
}

afterEach(() => {
  vi.mocked(getMe).mockReset()
  vi.mocked(clearToken).mockReset()
  mockNavigate.mockReset()
})

describe('HomePage', () => {
  it('renders the loading state while fetching the profile', () => {
    vi.mocked(getMe).mockReturnValue(new Promise(() => {}))

    renderWithRouter(<HomePage />)

    expect(screen.getByText(/carregando seus dados/i)).toBeInTheDocument()
  })

  it('greets the authenticated user with name and email', async () => {
    vi.mocked(getMe).mockResolvedValue(user)

    renderWithRouter(<HomePage />)

    expect(await screen.findByText(/olá, ana!/i)).toBeInTheDocument()
    expect(screen.getByText('ana@x.com')).toBeInTheDocument()
  })

  it('clears the token and navigates to /login on logout', async () => {
    vi.mocked(getMe).mockResolvedValue(user)

    renderWithRouter(<HomePage />)
    await screen.findByText(/olá, ana!/i)

    await userEvent.click(screen.getByRole('button', { name: /sair/i }))

    expect(clearToken).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
