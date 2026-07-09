import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SocialIcon } from './SocialIcon'

describe('SocialIcon', () => {
  it('renders image with alt text and label', () => {
    render(<SocialIcon src="/Github.png" alt="Github logo" label="Github" />)
    expect(screen.getByAltText('Github logo')).toBeInTheDocument()
    expect(screen.getByText('Github')).toBeInTheDocument()
  })
})
