import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge, { PublishedBadge, DraftBadge, RegionBadge } from '@/components/ui/Badge'

describe('Badge component', () => {
  it('renders correctly with default props', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeDefined()
    expect(badge.tagName).toBe('SPAN')
    // Default variant is draft
    expect(badge.className).toContain('bg-surface-variant')
  })

  it('renders different variants', () => {
    render(<Badge variant="published">Published</Badge>)
    const badge = screen.getByText('Published')
    expect(badge.className).toContain('bg-secondary-container')
  })

  it('renders with an icon', () => {
    render(<Badge icon="star">With Icon</Badge>)
    const icon = screen.getByText('star')
    expect(icon).toBeDefined()
    expect(icon.className).toContain('material-symbols-outlined')
  })

  it('applies iconFilled style when true', () => {
    render(<Badge icon="star" iconFilled>Filled Icon</Badge>)
    const icon = screen.getByText('star')
    expect(icon.getAttribute('style')).toContain("'FILL' 1")
  })
})

describe('Named Badge exports', () => {
  it('PublishedBadge renders correctly', () => {
    render(<PublishedBadge>Đã xuất bản</PublishedBadge>)
    const badge = screen.getByText('Đã xuất bản')
    expect(badge.className).toContain('bg-secondary-container')
  })

  it('DraftBadge renders with custom text', () => {
    render(<DraftBadge>My Draft</DraftBadge>)
    const badge = screen.getByText('My Draft')
    expect(badge.className).toContain('bg-surface-variant')
  })

  it('RegionBadge maps regions to correct variants', () => {
    const { rerender } = render(<RegionBadge region="Miền Bắc">Miền Bắc</RegionBadge>)
    expect(screen.getByText('Miền Bắc').className).toContain('bg-primary-fixed')

    rerender(<RegionBadge region="Miền Nam">Miền Nam</RegionBadge>)
    expect(screen.getByText('Miền Nam').className).toContain('bg-tertiary-fixed')

    rerender(<RegionBadge region="Miền Trung">Miền Trung</RegionBadge>)
    expect(screen.getByText('Miền Trung').className).toContain('bg-surface-container-high')

    rerender(<RegionBadge region="Unknown">Unknown</RegionBadge>)
    expect(screen.getByText('Unknown').className).not.toContain('bg-primary-fixed')
  })
})
