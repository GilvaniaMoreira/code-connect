import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

type LinkVariant = 'subtle' | 'accent'

type CommonProps = {
  variant?: LinkVariant
  className?: string
  children: ReactNode
  'aria-label'?: string
}

// Prop `to` = navegação interna SPA (react-router). Prop `href` = URL bruta
// (âncora nativa, útil para links externos ou fragments dentro da página).
type InternalLinkProps = CommonProps & {
  to: string
  href?: never
}

type ExternalLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string
    to?: never
  }

type LinkProps = InternalLinkProps | ExternalLinkProps

const variantClasses: Record<LinkVariant, string> = {
  subtle: 'text-foreground underline underline-offset-4 hover:text-primary',
  accent: 'text-primary font-semibold hover:brightness-110',
}

const baseClass =
  'inline-flex items-center gap-1 rounded-sm text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

export function Link({
  variant = 'subtle',
  className = '',
  children,
  ...rest
}: LinkProps) {
  const finalClassName = `${baseClass} ${variantClasses[variant]} ${className}`

  if ('to' in rest && rest.to !== undefined) {
    return (
      <RouterLink to={rest.to} className={finalClassName} aria-label={rest['aria-label']}>
        {children}
      </RouterLink>
    )
  }

  const { to: _to, ...anchorProps } = rest as ExternalLinkProps & { to?: undefined }
  return (
    <a className={finalClassName} {...anchorProps}>
      {children}
    </a>
  )
}
