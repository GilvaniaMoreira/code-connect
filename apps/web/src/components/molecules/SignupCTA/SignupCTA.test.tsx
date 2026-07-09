import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SignupCTA } from './SignupCTA'

describe('SignupCTA', () => {
  it('renders question and link with href', () => {
    render(
      <SignupCTA
        question="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        href="/cadastro"
      />,
    )

    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /crie seu cadastro/i })).toHaveAttribute(
      'href',
      '/cadastro',
    )
  })
})
