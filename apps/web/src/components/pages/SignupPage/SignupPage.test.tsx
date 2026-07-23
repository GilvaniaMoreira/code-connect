import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SignupPage } from './SignupPage'

describe('SignupPage', () => {
  it('renders the Cadastro heading and the name field', () => {
    render(<SignupPage />)
    expect(
      screen.getByRole('heading', { name: /cadastro/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument()
  })
})
