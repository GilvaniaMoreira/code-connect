import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostThumbnail } from './PostThumbnail'

function getImg(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector('img')
  if (!img) throw new Error('img not found')
  return img
}

describe('PostThumbnail', () => {
  it('renders external thumbnail when provided', () => {
    render(
      <PostThumbnail
        post={{ slug: 'meu-post', thumbnail: 'https://example.com/x.png', title: 'Meu post' }}
      />,
    )
    const img = screen.getByRole('img', { name: /meu post/i })
    expect(img).toHaveAttribute('src', 'https://example.com/x.png')
  })

  it('falls back to placeholder endpoint when external image errors', () => {
    const { container } = render(
      <PostThumbnail
        post={{ slug: 'meu-post', thumbnail: 'https://broken.example/x.png', title: 't' }}
      />,
    )
    const img = getImg(container)
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', expect.stringContaining('/thumbnails/meu-post'))
  })

  it('uses placeholder endpoint when thumbnail is null', () => {
    const { container } = render(
      <PostThumbnail post={{ slug: 'sem-thumb', thumbnail: null, title: 'x' }} />,
    )
    expect(getImg(container)).toHaveAttribute(
      'src',
      expect.stringContaining('/thumbnails/sem-thumb'),
    )
  })
})
