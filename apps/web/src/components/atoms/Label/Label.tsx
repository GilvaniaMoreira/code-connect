import type { LabelHTMLAttributes, ReactNode } from 'react'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
}

export function Label({ className = '', children, ...rest }: LabelProps) {
  return (
    <label
      className={`block text-base font-medium text-white ${className}`}
      {...rest}
    >
      {children}
    </label>
  )
}
