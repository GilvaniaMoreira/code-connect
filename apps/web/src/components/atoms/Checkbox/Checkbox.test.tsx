import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

function ControlledCheckbox() {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox
      id="remember"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    >
      Lembrar-me
    </Checkbox>
  )
}

describe('Checkbox', () => {
  it('toggles checked state on click', async () => {
    render(<ControlledCheckbox />)

    const checkbox = screen.getByRole('checkbox', { name: /lembrar-me/i })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    expect(checkbox).toBeChecked()
  })
})
