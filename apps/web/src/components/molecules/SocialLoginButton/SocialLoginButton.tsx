import { SocialIcon } from '../../atoms/SocialIcon'

type SocialLoginButtonProps = {
  provider: string
  iconSrc: string
  onClick?: () => void
}

export function SocialLoginButton({ provider, iconSrc, onClick }: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Entrar com ${provider}`}
      onClick={onClick}
      className="rounded-md p-2 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <SocialIcon src={iconSrc} alt={`Logo ${provider}`} label={provider} />
    </button>
  )
}
