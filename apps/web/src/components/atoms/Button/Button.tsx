import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-black hover:brightness-95 active:brightness-90 focus-visible:ring-2 focus-visible:ring-primary/60',
}

export function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
    </button>
  )
}
