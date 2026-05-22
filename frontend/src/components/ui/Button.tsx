import { ButtonHTMLAttributes, ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Material Symbol icon name, rendered on left */
  leadingIcon?: string
  /** Material Symbol icon name, rendered on right */
  trailingIcon?: string
  /** Show loading spinner instead of content */
  loading?: boolean
  /** Full-width block button */
  fullWidth?: boolean
  children?: ReactNode
}

// ── Style maps ─────────────────────────────────────────────────────────────
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container ' +
    'shadow-float active:scale-95',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed ' +
    'active:scale-95',
  outline:
    'border border-primary text-primary bg-surface-container-lowest ' +
    'hover:bg-primary-fixed transition-colors active:scale-95',
  ghost:
    'text-on-surface-variant hover:text-primary hover:bg-surface-container-low ' +
    'active:scale-95',
  danger:
    'bg-error text-on-error hover:opacity-90 shadow-float active:scale-95',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-caption gap-1.5',
  md: 'px-6 py-2.5 text-label-md gap-2',
  lg: 'px-8 py-3 text-body-md gap-2',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        // base
        'inline-flex items-center justify-center font-label-md rounded-lg',
        'transition-all duration-200 select-none',
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
        // variant + size
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        // width
        fullWidth ? 'w-full' : '',
        // disabled
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}

      {/* Leading icon */}
      {!loading && leadingIcon && (
        <span className="material-symbols-outlined text-[20px] leading-none">{leadingIcon}</span>
      )}

      {/* Label */}
      {children && <span>{children}</span>}

      {/* Trailing icon */}
      {!loading && trailingIcon && (
        <span className="material-symbols-outlined text-[20px] leading-none">{trailingIcon}</span>
      )}
    </button>
  )
}

// ── Convenient named exports ───────────────────────────────────────────────
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />
}

// ── Icon-only button ───────────────────────────────────────────────────────
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string          // aria-label
  variant?: ButtonVariant
  size?: ButtonSize
}

export function IconButton({ icon, label, variant = 'ghost', size = 'md', className = '', ...props }: IconButtonProps) {
  const padMap: Record<ButtonSize, string> = { sm: 'p-1', md: 'p-2', lg: 'p-3' }
  return (
    <button
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-full transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
        VARIANT_CLASS[variant],
        padMap[size],
        className,
      ].join(' ')}
      {...props}
    >
      <span className="material-symbols-outlined text-[22px] leading-none">{icon}</span>
    </button>
  )
}
