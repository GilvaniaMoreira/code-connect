import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Login</Button>)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Enviar</Button>)

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
