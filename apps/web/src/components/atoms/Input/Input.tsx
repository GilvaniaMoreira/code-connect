import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', type = 'text', ...rest }: InputProps) {
  return (
    <input
      type={type}
      className={`block w-full rounded-md bg-input px-4 py-3 text-white placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      {...rest}
    />
  )
}
