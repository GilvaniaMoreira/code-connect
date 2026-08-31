import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authService from '../../../services/auth'
import * as tokenStorage from '../../../lib/token'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { SignupForm } from './SignupForm'

describe('SignupForm', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers the user and logs in on success', async () => {
    const registerSpy = vi.spyOn(authService, 'register').mockResolvedValue({
      id: 'user-1',
      nome: 'Alice Dev',
      email: 'alice@code.dev',
    })
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: 3600,
    })
    const setTokenSpy = vi.spyOn(tokenStorage, 'setToken')
    const onSuccess = vi.fn()

    renderWithRouter(<SignupForm onSuccess={onSuccess} />)

    await userEvent.type(screen.getByLabelText(/nome/i), 'Alice Dev')
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@code.dev')
    await userEvent.type(screen.getByLabelText(/senha/i), 'secret123')
    await userEvent.click(screen.getByRole('checkbox', { name: /lembrar-me/i }))
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith({
        nome: 'Alice Dev',
        email: 'alice@code.dev',
        senha: 'secret123',
      })
    })
    expect(loginSpy).toHaveBeenCalledWith({
      email: 'alice@code.dev',
      senha: 'secret123',
    })
    expect(setTokenSpy).toHaveBeenCalledWith('jwt-token', true)
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('shows the API error message when register fails', async () => {
    vi.spyOn(authService, 'register').mockRejectedValue(new Error('boom'))
    vi.spyOn(authService, 'extractApiError').mockReturnValue('Email já cadastrado')

    renderWithRouter(<SignupForm />)

    await userEvent.type(screen.getByLabelText(/nome/i), 'Alice Dev')
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@code.dev')
    await userEvent.type(screen.getByLabelText(/senha/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email já cadastrado')
  })
})
