import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from './Link'

describe('Link', () => {
  it('renders anchor with href and children', () => {
    render(<Link href="/esqueci-senha">Esqueci a senha</Link>)
    const link = screen.getByRole('link', { name: /esqueci a senha/i })
    expect(link).toHaveAttribute('href', '/esqueci-senha')
  })
})
