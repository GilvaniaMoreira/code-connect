import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('associates label with input via htmlFor', () => {
    render(<FormField id="email" label="Email ou usuário" placeholder="usuario123" />)
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  })

  it('renders an error message when provided', () => {
    render(
      <FormField id="senha" label="Senha" type="password" error="Senha inválida" />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Senha inválida')
  })
})
