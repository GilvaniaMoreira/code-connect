import type { ButtonHTMLAttributes } from 'react'
import { MaterialIcon } from '../MaterialIcon'

type TagVariant = 'default' | 'active'

type BaseProps = {
  label: string
  variant?: TagVariant
}

type StaticTagProps = BaseProps & { onRemove?: undefined; asButton?: false }
type RemovableTagProps = BaseProps & {
  onRemove: () => void
  asButton?: false
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'>
type ButtonTagProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { asButton: true }

type TagProps = StaticTagProps | RemovableTagProps | ButtonTagProps

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-input text-surface',
  active: 'bg-muted text-surface',
}

export function Tag(props: TagProps) {
  const { label, variant = 'default' } = props
  const base = `inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium ${variantClasses[variant]}`

  if ('onRemove' in props && props.onRemove) {
    const { onRemove, asButton: _asButton, ...rest } = props
    return (
      <button
        type="button"
        className={`${base} cursor-pointer hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
        {...rest}
      >
        <span>{label}</span>
        <MaterialIcon name="close" size="sm" />
      </button>
    )
  }

  if ('asButton' in props && props.asButton) {
    const { asButton: _asButton, ...rest } = props
    return (
      <button
        type="button"
        className={`${base} cursor-pointer hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        {...rest}
      >
        {label}
      </button>
    )
  }

  return <span className={base}>{label}</span>
}
