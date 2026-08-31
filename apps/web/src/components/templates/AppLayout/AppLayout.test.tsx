import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  it('renders children inside the main region', () => {
    renderWithRouter(
      <AppLayout>
        <p>hello</p>
      </AppLayout>,
    )
    expect(screen.getByRole('main')).toContainElement(screen.getByText('hello'))
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})
