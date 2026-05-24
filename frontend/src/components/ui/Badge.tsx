import { HTMLAttributes, ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
/**
 * Predefined semantic variants dùng đúng màu Stitch.
 * 'custom' cho phép truyền className tùy ý.
 */
export type BadgeVariant =
  | 'published'       // Đã xuất bản  — secondary-container
  | 'draft'           // Nháp         — surface-variant
  | 'pending'         // Chờ duyệt    — tertiary-fixed (cam)
  | 'open'            // Đang mở cửa  — secondary-container
  | 'closed'          // Đã đóng cửa  — error-container
  | 'featured'        // Nổi bật      — secondary-container
  | 'north'           // Miền Bắc     — primary-fixed
  | 'central'         // Miền Trung   — surface-container-high
  | 'south'           // Miền Nam     — tertiary-fixed
  | 'verified'        // Đã xác minh  — secondary
  | 'positive'        // + tăng trưởng— green
  | 'warning'         // Cần xử lý   — red
  | 'custom'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  /** Material Symbol icon name */
  icon?: string
  /** Filled icon (FILL=1) */
  iconFilled?: boolean
  children: ReactNode
}

// ── Style map ──────────────────────────────────────────────────────────────
const VARIANT_CLASS: Record<BadgeVariant, string> = {
  published: 'bg-secondary-container text-on-secondary-container',
  draft:     'bg-surface-variant      text-on-surface-variant',
  pending:   'bg-tertiary-fixed       text-on-tertiary-fixed-variant',
  open:      'bg-secondary-container text-on-secondary-container',
  closed:    'bg-error-container      text-on-error-container',
  featured:  'bg-secondary-container text-on-secondary-container',
  north:     'bg-primary-fixed        text-on-primary-fixed',
  central:   'bg-surface-container-high text-on-surface-variant',
  south:     'bg-tertiary-fixed       text-on-tertiary-fixed-variant',
  verified:  'bg-secondary            text-on-secondary',
  positive:  'bg-[#e6f4ea]           text-[#137333]',
  warning:   'bg-[#fce8e6]           text-[#c5221f]',
  custom:    '',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Badge({
  variant = 'draft',
  icon,
  iconFilled = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        // base
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full',
        'font-caption text-caption font-semibold whitespace-nowrap',
        // variant colour
        VARIANT_CLASS[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {icon && (
        <span
          className="material-symbols-outlined text-[14px] leading-none"
          style={{ fontVariationSettings: iconFilled ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

// ── Convenient named exports ───────────────────────────────────────────────
type SimpleProps = Omit<BadgeProps, 'variant'>

export const PublishedBadge  = (p: SimpleProps) => <Badge variant="published" icon="check_circle" iconFilled {...p}>{p.children ?? 'Đã xuất bản'}</Badge>
export const DraftBadge      = (p: SimpleProps) => <Badge variant="draft"     {...p}>{p.children ?? 'Nháp'}</Badge>
export const PendingBadge    = (p: SimpleProps) => <Badge variant="pending"   icon="schedule"   {...p}>{p.children ?? 'Chờ duyệt'}</Badge>
export const OpenBadge       = (p: SimpleProps) => <Badge variant="open"      icon="check_circle" iconFilled {...p}>{p.children ?? 'Đang mở cửa'}</Badge>
export const ClosedBadge     = (p: SimpleProps) => <Badge variant="closed"    icon="cancel"     iconFilled {...p}>{p.children ?? 'Đã đóng cửa'}</Badge>
export const FeaturedBadge   = (p: SimpleProps) => <Badge variant="featured"  {...p}>{p.children ?? 'Nổi bật'}</Badge>
export const VerifiedBadge   = (p: SimpleProps) => <Badge variant="verified"  icon="verified"   iconFilled {...p}>{p.children ?? 'Đã xác minh'}</Badge>
export const RegionBadge     = ({ region, ...p }: SimpleProps & { region: string }) => {
  const map: Record<string, BadgeVariant> = {
    'Miền Bắc': 'north', 'north': 'north',
    'Miền Trung': 'central', 'central': 'central',
    'Miền Nam': 'south', 'south': 'south',
  }
  return <Badge variant={map[region] ?? 'custom'} {...p}>{region}</Badge>
}
