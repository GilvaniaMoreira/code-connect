import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  it('renders children inside the main region', () => {
    render(
      <AppLayout>
        <p>hello</p>
      </AppLayout>,
    )
    expect(screen.getByRole('main')).toContainElement(screen.getByText('hello'))
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})
