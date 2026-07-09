import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs the filled data on submit', async () => {
    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/email ou usuário/i), 'alice@code.dev')
    await userEvent.type(screen.getByLabelText(/senha/i), 'secret123')
    await userEvent.click(screen.getByRole('checkbox', { name: /lembrar-me/i }))
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(console.log).toHaveBeenCalledWith({
      email: 'alice@code.dev',
      senha: 'secret123',
      lembrarMe: true,
    })
  })
})
