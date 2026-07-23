import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'
import * as authService from '../../../services/auth'
import * as tokenStorage from '../../../lib/token'

describe('LoginForm', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends credentials to the API and persists the token on success', async () => {
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: 3600,
    })
    const setTokenSpy = vi.spyOn(tokenStorage, 'setToken')
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} />)

    await userEvent.type(screen.getByLabelText(/email ou usuário/i), 'alice@code.dev')
    await userEvent.type(screen.getByLabelText(/senha/i), 'secret123')
    await userEvent.click(screen.getByRole('checkbox', { name: /lembrar-me/i }))
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'alice@code.dev',
        senha: 'secret123',
      })
    })
    expect(setTokenSpy).toHaveBeenCalledWith('jwt-token', true)
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('shows the API error message when login fails', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('boom'))
    vi.spyOn(authService, 'extractApiError').mockReturnValue('Credenciais inválidas')

    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/email ou usuário/i), 'alice@code.dev')
    await userEvent.type(screen.getByLabelText(/senha/i), 'wrong-pass')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas')
  })
})
