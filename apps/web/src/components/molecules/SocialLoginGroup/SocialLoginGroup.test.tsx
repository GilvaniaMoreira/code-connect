import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SocialLoginGroup } from './SocialLoginGroup'

describe('SocialLoginGroup', () => {
  it('renders github and gmail buttons plus the divider text', () => {
    render(<SocialLoginGroup />)
    expect(screen.getByText(/ou entre com outras contas/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar com github/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar com gmail/i })).toBeInTheDocument()
  })
})
