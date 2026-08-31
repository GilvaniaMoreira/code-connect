import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { clearToken, setToken } from '../../../lib/token'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  afterEach(() => {
    clearToken()
  })

  it('shows Login link when user is not authenticated', () => {
    renderWithRouter(<Sidebar />)
    expect(screen.getByRole('link', { name: /^login$/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /publicar/i })).not.toBeInTheDocument()
  })

  it('shows Sair button and Publicar link when authenticated', () => {
    setToken('fake-token', true)
    renderWithRouter(<Sidebar />)
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /publicar/i })).toHaveAttribute(
      'href',
      '/publicar',
    )
    expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument()
  })
})
