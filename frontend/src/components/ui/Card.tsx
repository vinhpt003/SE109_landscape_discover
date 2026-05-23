import { HTMLAttributes, ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export type CardVariant = 'default' | 'filled' | 'outlined' | 'elevated'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** Whether the card reacts to hover with lift animation */
  interactive?: boolean
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

// ── Style maps ─────────────────────────────────────────────────────────────
const VARIANT_CLASS: Record<CardVariant, string> = {
  default:  'bg-surface-container-lowest border border-surface-container shadow-[0_4px_15px_rgba(0,0,0,0.04)]',
  filled:   'bg-surface-container-low border-transparent',
  outlined: 'bg-surface-container-lowest border border-outline-variant',
  elevated: 'bg-surface-container-lowest shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-surface-container',
}

const PADDING_CLASS: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Card({
  variant = 'default',
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-xl overflow-hidden',
        VARIANT_CLASS[variant],
        PADDING_CLASS[padding],
        interactive
          ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Sub-components for semantic structure ──────────────────────────────────
interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardHeader({ className = '', children, ...props }: CardSectionProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...props }: CardSectionProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: CardSectionProps) {
  return (
    <div
      className={`mt-4 pt-4 border-t border-surface-container ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────────────────
export function CardDivider({ className = '' }: { className?: string }) {
  return <hr className={`border-surface-container my-4 ${className}`} />
}
