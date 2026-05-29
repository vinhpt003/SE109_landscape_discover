import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '../../services/notifications.service'
import { useAuthStore } from '../../store/authStore'
import type { Notification, NotificationType } from '../../types'

interface NotificationBellProps {
  variant?: 'light' | 'dark'
}

const NOTI_QK = ['notifications', 'me'] as const

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'vừa xong'
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

function iconFor(type: NotificationType): { icon: string; color: string } {
  switch (type) {
    case 'PostApproved':
      return { icon: 'check_circle', color: 'text-success' }
    case 'PostRejected':
      return { icon: 'cancel', color: 'text-error' }
    case 'NewComment':
      return { icon: 'chat', color: 'text-primary' }
    case 'PostPending':
      return { icon: 'pending', color: 'text-tertiary' }
    default:
      return { icon: 'notifications', color: 'text-on-surface-variant' }
  }
}

function linkFor(n: Notification, role: string | undefined): string {
  if (n.type === 'PostPending' && role === 'Admin' && n.postId) {
    return `/admin/landmarks?status=Pending&focus=${n.postId}`
  }
  if (n.type === 'PostRejected' && n.postId) {
    return `/my-posts/${n.postId}/edit`
  }
  if (n.postId) return `/landmarks/${n.postId}`
  return '/'
}

export default function NotificationBell({ variant = 'light' }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()

  const { data } = useQuery({
    queryKey: NOTI_QK,
    queryFn: () => notificationsService.fetchMine({ limit: 15 }),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTI_QK }),
  })

  const markAllMut = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTI_QK }),
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!isAuthenticated) return null

  const items = data?.data ?? []
  const unread = data?.unreadCount ?? 0

  const handleClick = (n: Notification) => {
    if (!n.read) markReadMut.mutate(n.notificationId)
    setOpen(false)
    navigate(linkFor(n, user?.role))
  }

  const btnClass =
    variant === 'dark'
      ? 'text-on-surface-variant hover:bg-surface-container-low'
      : 'text-on-surface-variant hover:bg-surface-container-low'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative p-2 rounded-full transition-colors ${btnClass}`}
        aria-label="Thông báo"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error text-on-error rounded-full text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-lg shadow-float border border-outline-variant overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
            <p className="font-label-md text-label-md text-on-surface font-bold">Thông báo</p>
            {unread > 0 && (
              <button
                onClick={() => markAllMut.mutate()}
                disabled={markAllMut.isPending}
                className="text-caption font-caption text-primary hover:underline disabled:opacity-50"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] opacity-40">notifications_off</span>
                <p className="font-body-md text-body-md mt-2">Chưa có thông báo nào</p>
              </div>
            ) : (
              items.map(n => {
                const { icon, color } = iconFor(n.type)
                return (
                  <button
                    key={n.notificationId}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors border-b border-surface-container last:border-b-0 ${
                      !n.read ? 'bg-primary-fixed/30' : ''
                    }`}
                  >
                    <span className={`material-symbols-outlined ${color} mt-0.5`}>{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md text-on-surface line-clamp-2">
                        {n.message}
                      </p>
                      <p className="font-caption text-caption text-outline mt-1">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
