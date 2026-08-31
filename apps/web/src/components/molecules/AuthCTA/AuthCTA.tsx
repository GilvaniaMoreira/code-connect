import type { ReactNode } from 'react'
import { Link } from '../../atoms/Link'

type AuthCTAProps = {
  question: string
  linkText: string
  to: string
  icon?: ReactNode
}

export function AuthCTA({ question, linkText, to, icon }: Readonly<AuthCTAProps>) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-foreground">{question}</p>
      <Link to={to} variant="accent">
        {linkText}
        {icon}
      </Link>
    </div>
  )
}
