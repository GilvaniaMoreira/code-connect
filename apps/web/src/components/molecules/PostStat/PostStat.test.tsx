import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PostStat } from './PostStat'

describe('PostStat', () => {
  it('renders count and label', () => {
    render(<PostStat icon="code" count={12} label="Curtir" as="static" />)
    expect(screen.getByLabelText(/12 curtir/i)).toBeInTheDocument()
  })

  it('fires onClick when interactive', async () => {
    const onClick = vi.fn()
    render(<PostStat icon="code" count={3} label="Curtir" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: /curtir/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
