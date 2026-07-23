import type { InputHTMLAttributes, ReactNode } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string
  children: ReactNode
}

export function Checkbox({ id, children, className = '', ...rest }: CheckboxProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input
        id={id}
        type="checkbox"
        className={`h-5 w-5 cursor-pointer rounded border border-input bg-input text-primary accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
        {...rest}
      />
      <span>{children}</span>
    </label>
  )
}
