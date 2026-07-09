import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders the Login heading and the email field', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email ou usuário/i)).toBeInTheDocument()
  })
})
