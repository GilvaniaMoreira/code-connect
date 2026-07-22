import type { HTMLAttributes } from 'react'

type MaterialIconSize = 'sm' | 'md' | 'lg' | 'xl'

type MaterialIconProps = HTMLAttributes<HTMLSpanElement> & {
  name: string
  size?: MaterialIconSize
  label?: string
}

const sizeClasses: Record<MaterialIconSize, string> = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export function MaterialIcon({
  name,
  size = 'md',
  label,
  className = '',
  ...rest
}: MaterialIconProps) {
  return (
    <span
      className={`material-icons leading-none ${sizeClasses[size]} ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    >
      {name}
    </span>
  )
}
