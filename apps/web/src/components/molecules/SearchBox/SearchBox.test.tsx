import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  it('debounces search input and forwards value', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(<SearchBox value="" onSearch={onSearch} />)
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    await user.type(screen.getByRole('searchbox'), 'react')
    vi.advanceTimersByTime(400)

    expect(onSearch).toHaveBeenLastCalledWith('react')
    vi.useRealTimers()
  })

  it('submits immediately on Enter', async () => {
    const onSearch = vi.fn()
    render(<SearchBox value="" onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'nest{enter}')

    expect(onSearch).toHaveBeenCalledWith('nest')
  })
})
