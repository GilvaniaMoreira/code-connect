import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SocialIcon } from './SocialIcon'

describe('SocialIcon', () => {
  it('renders image with alt text and label', () => {
    render(<SocialIcon src="/Github.png" alt="Github logo" label="Github" />)
    const img = screen.getByAltText('Github logo')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('width', '40')
    expect(img).toHaveAttribute('height', '40')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(screen.getByText('Github')).toBeInTheDocument()
  })
})
