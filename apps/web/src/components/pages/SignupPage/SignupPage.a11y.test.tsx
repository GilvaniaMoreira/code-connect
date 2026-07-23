import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/axe'
import { SignupPage } from './SignupPage'

describe('SignupPage a11y', () => {
  it('has no WCAG 2.0/2.1 AA violations', async () => {
    const { container } = render(<SignupPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
