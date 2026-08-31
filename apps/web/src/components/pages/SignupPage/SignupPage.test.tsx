import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { SignupPage } from './SignupPage'

describe('SignupPage', () => {
  it('renders the Cadastro heading and the name field', () => {
    renderWithRouter(<SignupPage />)
    expect(
      screen.getByRole('heading', { name: /cadastro/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument()
  })
})
