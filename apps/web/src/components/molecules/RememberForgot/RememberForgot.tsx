import type { ChangeEvent } from 'react'
import { Checkbox } from '../../atoms/Checkbox'
import { Link } from '../../atoms/Link'

type RememberForgotProps = {
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  forgotHref: string
}

export function RememberForgot({ checked, onChange, forgotHref }: RememberForgotProps) {
  return (
    <div className="flex items-center justify-between">
      <Checkbox id="lembrar-me" checked={checked} onChange={onChange}>
        Lembrar-me
      </Checkbox>
      <Link href={forgotHref}>Esqueci a senha</Link>
    </div>
  )
}
