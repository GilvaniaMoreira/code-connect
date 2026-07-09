import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RememberForgot } from './RememberForgot'

describe('RememberForgot', () => {
  it('renders the checkbox and forgot link', () => {
    render(<RememberForgot checked={false} onChange={vi.fn()} forgotHref="#" />)
    expect(screen.getByRole('checkbox', { name: /lembrar-me/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /esqueci a senha/i })).toHaveAttribute('href', '#')
  })

  it('fires onChange when the checkbox is toggled', async () => {
    const onChange = vi.fn()
    render(<RememberForgot checked={false} onChange={onChange} forgotHref="#" />)

    await userEvent.click(screen.getByRole('checkbox', { name: /lembrar-me/i }))

    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
