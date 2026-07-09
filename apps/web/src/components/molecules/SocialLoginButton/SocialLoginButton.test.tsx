import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialLoginButton } from './SocialLoginButton'

describe('SocialLoginButton', () => {
  it('fires onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<SocialLoginButton provider="Github" iconSrc="/Github.png" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: /entrar com github/i }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
