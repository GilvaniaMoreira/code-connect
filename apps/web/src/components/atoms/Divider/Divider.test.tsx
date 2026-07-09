import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders text passed as children', () => {
    render(<Divider>ou entre com outras contas</Divider>)
    expect(screen.getByText(/ou entre com outras contas/i)).toBeInTheDocument()
  })
})
