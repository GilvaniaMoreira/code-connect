import type { ReactNode } from 'react'
import { Link } from '../../atoms/Link'

type AuthCTAProps = {
  question: string
  linkText: string
  href: string
  icon?: ReactNode
}

export function AuthCTA({ question, linkText, href, icon }: AuthCTAProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-foreground">{question}</p>
      <Link href={href} variant="accent">
        {linkText}
        {icon}
      </Link>
    </div>
  )
}
