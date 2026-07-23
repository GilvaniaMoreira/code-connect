import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders initials derived from handle', () => {
    const { container } = render(<Avatar name="@julio.silva" />)
    expect(container.textContent).toBe('JS')
  })

  it('falls back to placeholder when name has no alphanumerics', () => {
    const { container } = render(<Avatar name="---" />)
    expect(container.textContent).toBe('?')
  })
})
