import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MaterialIcon } from './MaterialIcon'

describe('MaterialIcon', () => {
  it('renders the icon name as ligature text', () => {
    render(<MaterialIcon name="search" label="Buscar" />)
    const icon = screen.getByRole('img', { name: /buscar/i })
    expect(icon).toHaveTextContent('search')
    expect(icon).toHaveClass('material-icons')
  })
})
