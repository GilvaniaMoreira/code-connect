import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="usuario123" />)
    expect(screen.getByPlaceholderText('usuario123')).toBeInTheDocument()
  })

  it('calls onChange on typing', async () => {
    const onChange = vi.fn()
    render(<Input placeholder="digite" onChange={onChange} />)

    await userEvent.type(screen.getByPlaceholderText('digite'), 'a')

    expect(onChange).toHaveBeenCalled()
  })
})
