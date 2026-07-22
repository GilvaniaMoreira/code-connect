import type { AnchorHTMLAttributes, ReactNode } from 'react'

type LinkVariant = 'subtle' | 'accent'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: LinkVariant
  children: ReactNode
}

const variantClasses: Record<LinkVariant, string> = {
  subtle: 'text-foreground underline underline-offset-4 hover:text-primary',
  accent: 'text-primary font-semibold hover:brightness-110',
}

export function Link({
  variant = 'subtle',
  className = '',
  children,
  ...rest
}: LinkProps) {
  return (
    <a
      className={`inline-flex items-center gap-1 rounded-sm text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}
