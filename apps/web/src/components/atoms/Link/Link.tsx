import type { AnchorHTMLAttributes, ReactNode } from 'react'

type LinkVariant = 'subtle' | 'accent'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: LinkVariant
  children: ReactNode
}

const variantClasses: Record<LinkVariant, string> = {
  subtle: 'text-white underline underline-offset-4 hover:text-primary',
  accent: 'text-primary-strong font-semibold hover:brightness-110',
}

export function Link({
  variant = 'subtle',
  className = '',
  children,
  ...rest
}: LinkProps) {
  return (
    <a
      className={`inline-flex items-center gap-1 text-sm transition ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}
