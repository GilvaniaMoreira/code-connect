import type { InputHTMLAttributes, ReactNode } from 'react'
import { Input } from '../../atoms/Input'
import { Label } from '../../atoms/Label'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: ReactNode
  error?: string
}

export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={error ? true : undefined} {...inputProps} />
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
