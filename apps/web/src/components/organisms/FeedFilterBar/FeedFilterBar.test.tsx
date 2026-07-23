import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedFilterBar } from './FeedFilterBar'

describe('FeedFilterBar', () => {
  it('renders active tags and triggers removal', async () => {
    const onRemoveTag = vi.fn()
    render(
      <FeedFilterBar
        query=""
        tags={['React']}
        onQueryChange={() => {}}
        onRemoveTag={onRemoveTag}
        onClearAll={() => {}}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /remover filtro react/i }))
    expect(onRemoveTag).toHaveBeenCalledWith('React')
  })

  it('shows "Limpar tudo" only when filters are active', () => {
    const { rerender } = render(
      <FeedFilterBar
        query=""
        tags={[]}
        onQueryChange={() => {}}
        onRemoveTag={() => {}}
        onClearAll={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: /limpar tudo/i })).not.toBeInTheDocument()

    rerender(
      <FeedFilterBar
        query="react"
        tags={[]}
        onQueryChange={() => {}}
        onRemoveTag={() => {}}
        onClearAll={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: /limpar tudo/i })).toBeInTheDocument()
  })
})
