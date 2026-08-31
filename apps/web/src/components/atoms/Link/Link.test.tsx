import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Link } from './Link'

describe('Link', () => {
  it('renders an internal RouterLink when `to` is passed', () => {
    render(
      <MemoryRouter>
        <Link to="/feed">Ir ao feed</Link>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /ir ao feed/i })).toHaveAttribute(
      'href',
      '/feed',
    )
  })

  it('renders a plain anchor when `href` is passed', () => {
    render(<Link href="https://example.com">Externo</Link>)
    expect(screen.getByRole('link', { name: /externo/i })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })
})
