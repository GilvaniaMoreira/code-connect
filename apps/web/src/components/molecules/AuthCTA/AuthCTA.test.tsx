import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { AuthCTA } from './AuthCTA'

describe('AuthCTA', () => {
  it('renders question and link with to', () => {
    renderWithRouter(
      <AuthCTA
        question="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        to="/cadastro"
      />,
    )

    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /crie seu cadastro/i }),
    ).toHaveAttribute('href', '/cadastro')
  })

  it('renders the provided icon next to the link text', () => {
    renderWithRouter(
      <AuthCTA
        question="Já tem conta?"
        linkText="Faça seu login!"
        to="/login"
        icon={<span data-testid="cta-icon" aria-hidden="true" />}
      />,
    )

    expect(screen.getByTestId('cta-icon')).toBeInTheDocument()
  })
})
