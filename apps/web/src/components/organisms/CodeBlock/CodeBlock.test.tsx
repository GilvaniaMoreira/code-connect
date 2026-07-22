import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  it('renders code content and label', () => {
    render(<CodeBlock code="const x = 1" />)
    expect(screen.getByRole('heading', { name: /código:/i })).toBeInTheDocument()
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })
})
