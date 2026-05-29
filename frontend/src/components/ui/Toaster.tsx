import type { ToastItem } from '../../hooks/useToast'

interface ToasterProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

export default function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto',
            'font-body-md text-body-md min-w-[260px] max-w-sm',
            'animate-[fadeSlideIn_0.2s_ease-out]',
            t.type === 'success'
              ? 'bg-[#1a3c2e] text-[#a8d5b5] border border-[#2d5c42]'
              : 'bg-error-container text-on-error-container border border-error',
          ].join(' ')}
        >
          <span
            className="material-symbols-outlined text-[20px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {t.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
