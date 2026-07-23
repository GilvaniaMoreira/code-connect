import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders label as static span by default', () => {
    render(<Tag label="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn()
    render(<Tag label="React" onRemove={onRemove} />)

    await userEvent.click(screen.getByRole('button', { name: /remover filtro react/i }))

    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
