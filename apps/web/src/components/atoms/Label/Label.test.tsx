import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renders text and associates htmlFor', () => {
    render(<Label htmlFor="email">Email ou usuário</Label>)
    const label = screen.getByText('Email ou usuário')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'email')
  })
})
