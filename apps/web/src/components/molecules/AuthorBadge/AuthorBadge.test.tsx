import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthorBadge } from './AuthorBadge'

describe('AuthorBadge', () => {
  it('renders the author handle', () => {
    render(<AuthorBadge author={{ id: '1', nome: 'Julio', handle: '@julio' }} />)
    expect(screen.getByText('@julio')).toBeInTheDocument()
  })
})
