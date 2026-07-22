import type { ButtonHTMLAttributes } from 'react'
import { MaterialIcon } from '../../atoms/MaterialIcon'

type PostStatProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string
  count: number
  label: string
  active?: boolean
  as?: 'button' | 'static'
}

// Bloco compacto "icone + número" reutilizado no card do feed e no detalhe
// para representar likes/comentários/compartilhamento.
export function PostStat({
  icon,
  count,
  label,
  active = false,
  as = 'button',
  className = '',
  disabled,
  ...rest
}: PostStatProps) {
  const commonClasses = `flex flex-col items-center justify-center text-sm ${
    active ? 'text-primary' : 'text-muted'
  } ${disabled ? 'opacity-60' : ''}`

  if (as === 'static') {
    return (
      <span className={`${commonClasses} ${className}`} aria-label={`${count} ${label}`}>
        <MaterialIcon name={icon} size="md" />
        <span aria-hidden="true">{count}</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      aria-label={`${label} (${count})`}
      aria-pressed={active}
      disabled={disabled}
      className={`${commonClasses} cursor-pointer rounded-sm transition hover:text-primary disabled:cursor-not-allowed disabled:hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      {...rest}
    >
      <MaterialIcon name={icon} size="md" />
      <span aria-hidden="true">{count}</span>
    </button>
  )
}
