import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SearchBox } from './SearchBox'

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchBox', () => {
  it('debounces search input and forwards value after 300ms', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(<SearchBox value="" onSearch={onSearch} />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'react' } })
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onSearch).toHaveBeenLastCalledWith('react')
  })

  it('submits immediately on Enter', () => {
    const onSearch = vi.fn()
    render(<SearchBox value="" onSearch={onSearch} />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nest' } })
    fireEvent.submit(screen.getByRole('search'))

    expect(onSearch).toHaveBeenCalledWith('nest')
  })
})
