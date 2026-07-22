import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthCTA } from './AuthCTA'

describe('AuthCTA', () => {
  it('renders question and link with href', () => {
    render(
      <AuthCTA
        question="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        href="/cadastro"
      />,
    )

    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /crie seu cadastro/i }),
    ).toHaveAttribute('href', '/cadastro')
  })

  it('renders the provided icon next to the link text', () => {
    render(
      <AuthCTA
        question="Já tem conta?"
        linkText="Faça seu login!"
        href="/login"
        icon={<span data-testid="cta-icon" aria-hidden="true" />}
      />,
    )

    expect(screen.getByTestId('cta-icon')).toBeInTheDocument()
  })
})
