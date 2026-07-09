import { Link } from '../../atoms/Link'

type SignupCTAProps = {
  question: string
  linkText: string
  href: string
}

const ClipboardIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
)

export function SignupCTA({ question, linkText, href }: SignupCTAProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-white">{question}</p>
      <Link href={href} variant="accent">
        {linkText}
        <ClipboardIcon />
      </Link>
    </div>
  )
}
