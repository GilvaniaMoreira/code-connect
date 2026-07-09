import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('renders the banner image and the children slot', () => {
    render(
      <AuthLayout banner={{ src: '/banner.png', alt: 'Ilustração' }}>
        <div>Conteúdo do formulário</div>
      </AuthLayout>,
    )

    expect(screen.getByAltText('Ilustração')).toHaveAttribute('src', '/banner.png')
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })
})
