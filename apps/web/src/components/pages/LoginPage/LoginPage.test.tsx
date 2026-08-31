import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders the Login heading and the email field', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email ou usuário/i)).toBeInTheDocument()
  })
})
