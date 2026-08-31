type AvatarSize = 'sm' | 'md'

type AvatarProps = {
  name: string
  size?: AvatarSize
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
}

// Placeholder de avatar: círculo com iniciais em cor primária.
// Não temos avatares reais — o design usa a mesma imagem para todo mundo.
export function Avatar({ name, size = 'sm' }: AvatarProps) {
  return (
    <span
      className={`inline-flex ${sizeClasses[size]} shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

function initials(name: string): string {
  const clean = name.replace(/^@/, '').replace(/[^a-zA-Z0-9\s._-]/g, '').trim()
  if (!clean) return '?'
  const parts = clean.split(/[\s._-]+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ''
  return (first + second).toUpperCase() || '?'
}
