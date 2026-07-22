type SocialIconProps = {
  src: string
  alt: string
  label: string
}

export function SocialIcon({ src, alt, label }: SocialIconProps) {
  return (
    <span className="inline-flex flex-col items-center gap-1">
      <img src={src} alt={alt} className="h-10 w-10 object-contain" />
      <span className="text-xs text-foreground">{label}</span>
    </span>
  )
}
