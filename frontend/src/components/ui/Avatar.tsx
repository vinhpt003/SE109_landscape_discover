import { ImgHTMLAttributes, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy'

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** Image URL — when provided, shows image; falls back to initials on error */
  src?: string
  /** Person or entity name — used for initials & alt text */
  name?: string
  /** Explicit initials override (max 2 chars) */
  initials?: string
  size?: AvatarSize
  /** Optional presence dot */
  status?: AvatarStatus
  /** Show thin ring around avatar */
  ring?: boolean
  className?: string
}

// ── Sizes ──────────────────────────────────────────────────────────────────
const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

const STATUS_CLASS: Record<AvatarStatus, string> = {
  online:  'bg-secondary',
  offline: 'bg-outline',
  away:    'bg-tertiary-fixed-dim',
  busy:    'bg-error',
}

const STATUS_SIZE: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getInitials(name?: string, initials?: string): string {
  if (initials) return initials.slice(0, 2).toUpperCase()
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Deterministic pastel color from a string */
function colorFromName(name = ''): string {
  const colors = [
    { bg: 'bg-primary-fixed',    text: 'text-primary' },
    { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    { bg: 'bg-tertiary-fixed',   text: 'text-on-tertiary-fixed' },
    { bg: 'bg-surface-variant',  text: 'text-on-surface-variant' },
    { bg: 'bg-[#e8f4fd]',        text: 'text-[#1a6fa0]' },
    { bg: 'bg-[#fce8e6]',        text: 'text-[#c5221f]' },
    { bg: 'bg-[#e6f4ea]',        text: 'text-[#137333]' },
    { bg: 'bg-[#fff3e0]',        text: 'text-[#e65100]' },
  ]
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return `${colors[hash % colors.length].bg} ${colors[hash % colors.length].text}`
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Avatar({
  src,
  name,
  initials,
  size = 'md',
  status,
  ring = false,
  className = '',
  ...imgProps
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const letters = getInitials(name, initials)
  const showImage = !!src && !imgError
  const colorClasses = colorFromName(name ?? initials)

  return (
    <span
      className={[
        'relative inline-flex shrink-0 select-none',
        SIZE_CLASS[size],
        className,
      ].join(' ')}
    >
      {/* ── Circle ───────────────────────────────────────────── */}
      <span
        className={[
          'w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold',
          ring ? 'ring-2 ring-primary ring-offset-1' : '',
          showImage ? '' : colorClasses,
        ].join(' ')}
      >
        {showImage ? (
          <img
            src={src}
            alt={name ?? 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            {...imgProps}
          />
        ) : (
          <span aria-hidden="true">{letters}</span>
        )}
      </span>

      {/* ── Status dot ──────────────────────────────────────── */}
      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-surface-container-lowest',
            STATUS_CLASS[status],
            STATUS_SIZE[size],
          ].join(' ')}
          aria-label={status}
        />
      )}
    </span>
  )
}

// ── Avatar Group ───────────────────────────────────────────────────────────
export interface AvatarGroupProps {
  items: Pick<AvatarProps, 'src' | 'name' | 'initials'>[]
  max?: number
  size?: AvatarSize
  className?: string
}

export function AvatarGroup({ items, max = 4, size = 'md', className = '' }: AvatarGroupProps) {
  const visible = items.slice(0, max)
  const overflow = items.length - max

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((item, i) => (
        <span
          key={i}
          className={`-ml-${i > 0 ? '2' : '0'} ring-2 ring-surface-container-lowest rounded-full`}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar {...item} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={[
            '-ml-2 rounded-full ring-2 ring-surface-container-lowest',
            'bg-surface-container flex items-center justify-center font-bold text-on-surface-variant',
            SIZE_CLASS[size],
          ].join(' ')}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
