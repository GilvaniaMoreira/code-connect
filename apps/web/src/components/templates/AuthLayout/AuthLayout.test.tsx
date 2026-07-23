import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('renders the banner image and the children slot', () => {
    render(
      <AuthLayout
        banner={{
          webp: '/banner.webp',
          fallback: '/banner.png',
          alt: 'Ilustração',
          width: 407,
          height: 636,
        }}
      >
        <div>Conteúdo do formulário</div>
      </AuthLayout>,
    )

    const img = screen.getByAltText('Ilustração')
    expect(img).toHaveAttribute('src', '/banner.png')
    expect(img).toHaveAttribute('width', '407')
    expect(img).toHaveAttribute('height', '636')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })
})
