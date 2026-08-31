import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/axe'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { SignupPage } from './SignupPage'

describe('SignupPage a11y', () => {
  it('has no WCAG 2.0/2.1 AA violations', async () => {
    const { container } = renderWithRouter(<SignupPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
