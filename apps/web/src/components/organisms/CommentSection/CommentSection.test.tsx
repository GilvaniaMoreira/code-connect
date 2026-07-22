import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PostComment } from '../../../services/posts'
import { CommentSection } from './CommentSection'

const comments: PostComment[] = [
  {
    id: 'c1',
    content: 'Boa!',
    createdAt: new Date().toISOString(),
    author: { id: 'a', nome: 'Marcia', handle: '@marcia' },
  },
]

describe('CommentSection', () => {
  it('renders login prompt when user cannot comment', () => {
    render(<CommentSection comments={comments} canComment={false} />)
    expect(screen.getByRole('link', { name: /entre/i })).toHaveAttribute('href', '#/login')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('submits a new comment', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CommentSection comments={[]} canComment onSubmit={onSubmit} />)

    await userEvent.type(screen.getByRole('textbox'), 'Muito bom!')
    await userEvent.click(screen.getByRole('button', { name: /comentar/i }))

    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
  })
})
