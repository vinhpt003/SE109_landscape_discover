import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────
function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.fullName.trim()) {
    errors.fullName = 'Họ và tên không được để trống'
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự'
  }

  if (!data.email.trim()) {
    errors.email = 'Email không được để trống'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email không đúng định dạng'
  }

  if (!data.password) {
    errors.password = 'Mật khẩu không được để trống'
  } else if (data.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  }

  return errors
}

// ── Password strength indicator ────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  const label = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][score]
  const colors = [
    'bg-error',
    'bg-error',
    'bg-tertiary-fixed-dim',
    'bg-secondary',
    'bg-secondary',
  ]

  return (
    <div className="flex flex-col gap-1.5 mt-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < score ? colors[score] : 'bg-surface-container-high',
            ].join(' ')}
          />
        ))}
      </div>
      <p className="font-caption text-caption text-on-surface-variant">
        Độ mạnh: <span className="font-semibold">{label}</span>
      </p>
    </div>
  )
}

// ── Input field component ──────────────────────────────────────────────────
interface FieldProps {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
  icon: string
  required?: boolean
  hint?: string
  children?: React.ReactNode // for password toggle slot
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  icon,
  required,
  hint,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-md text-label-md text-on-surface-variant">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={[
            'w-full bg-surface-bright border rounded-lg pl-10 pr-4 py-3',
            'font-body-md text-body-md text-on-surface placeholder:text-outline-variant',
            'transition-all duration-200 outline-none',
            children ? 'pr-11' : 'pr-4',
            error
              ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
              : 'border-outline-variant hover:border-outline focus:border-secondary focus:ring-1 focus:ring-secondary',
          ].join(' ')}
        />
        {children}
      </div>
      {error && (
        <p className="font-caption text-caption text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="font-caption text-caption text-outline">{hint}</p>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (field: keyof FormData) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Xóa lỗi của field đó khi user bắt đầu nhập lại
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    const validationErrors = validateForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!agreed) {
      setSubmitError('Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.')
      return
    }

    setIsLoading(true)
    try {
      // Backend Release 1 chưa có /auth/register — hiển thị thông báo
      // Khi Release 2 ra, thay bằng: await register({ fullName, email, password })
      await new Promise(res => setTimeout(res, 800)) // giả lập network
      throw new Error('Tính năng đăng ký sẽ ra mắt ở phiên bản tiếp theo.')
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đăng ký thất bại. Vui lòng thử lại sau.'
      setSubmitError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel — decorative (ẩn trên mobile) ─────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-primary flex-col justify-between p-12">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px), ' +
              'radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-container opacity-30" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-on-primary-container opacity-10" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">landscape</span>
          </div>
          <span className="font-display text-headline-md font-bold text-on-primary">
            WanderShare
          </span>
        </div>

        {/* Center content */}
        <div className="relative flex flex-col gap-8">
          <div>
            <h2 className="font-display text-headline-lg text-on-primary mb-4 leading-snug">
              Khám phá Việt Nam<br />cùng cộng đồng
            </h2>
            <p className="font-body-md text-body-md text-on-primary opacity-80 leading-relaxed">
              Hàng nghìn địa điểm đẹp đang chờ bạn khám phá. Tham gia ngay để lưu lại
              những kỷ niệm du lịch và chia sẻ với bạn bè.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {[
              { icon: 'explore',     text: 'Khám phá 1,000+ danh lam thắng cảnh' },
              { icon: 'rate_review', text: 'Chia sẻ đánh giá & trải nghiệm thực tế' },
              { icon: 'bookmark',    text: 'Lưu danh sách địa điểm yêu thích' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">{icon}</span>
                </div>
                <span className="font-label-md text-label-md text-on-primary opacity-90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="relative font-caption text-caption text-on-primary opacity-60">
          © 2024 WanderShare Travel Community
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-16 overflow-y-auto">
        <div className="w-full max-w-[440px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">landscape</span>
            </div>
            <span className="font-display text-headline-md font-bold text-primary">WanderShare</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-headline-lg text-on-background mb-2">
              Tạo tài khoản
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>

          {/* Global error banner */}
          {submitError && (
            <div className="mb-6 flex items-start gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error/20">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">info</span>
              <p className="font-body-md text-body-md leading-snug">{submitError}</p>
            </div>
          )}

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            {/* Full name */}
            <Field
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn An"
              value={form.fullName}
              onChange={update('fullName')}
              error={errors.fullName}
              icon="person"
              required
            />

            {/* Email */}
            <Field
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              icon="mail"
              required
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ít nhất 6 ký tự"
                  value={form.password}
                  onChange={e => update('password')(e.target.value)}
                  className={[
                    'w-full bg-surface-bright border rounded-lg pl-10 pr-11 py-3',
                    'font-body-md text-body-md text-on-surface placeholder:text-outline-variant',
                    'transition-all duration-200 outline-none',
                    errors.password
                      ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                      : 'border-outline-variant hover:border-outline focus:border-secondary focus:ring-1 focus:ring-secondary',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 text-outline hover:text-on-surface-variant transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="font-caption text-caption text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.password}
                </p>
              )}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Xác nhận mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline pointer-events-none">
                  lock_reset
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword')(e.target.value)}
                  className={[
                    'w-full bg-surface-bright border rounded-lg pl-10 pr-11 py-3',
                    'font-body-md text-body-md text-on-surface placeholder:text-outline-variant',
                    'transition-all duration-200 outline-none',
                    errors.confirmPassword
                      ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                      : form.confirmPassword && form.password === form.confirmPassword
                      ? 'border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary'
                      : 'border-outline-variant hover:border-outline focus:border-secondary focus:ring-1 focus:ring-secondary',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 text-outline hover:text-on-surface-variant transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
                {/* Match checkmark */}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <span
                    className="material-symbols-outlined absolute right-10 text-[18px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="font-caption text-caption text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => {
                    setAgreed(e.target.checked)
                    if (submitError?.includes('Điều khoản')) setSubmitError(null)
                  }}
                  className="sr-only"
                />
                <div
                  className={[
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
                    agreed
                      ? 'bg-primary border-primary'
                      : 'bg-surface-bright border-outline-variant group-hover:border-outline',
                  ].join(' ')}
                >
                  {agreed && (
                    <span className="material-symbols-outlined text-on-primary text-[14px]">
                      check
                    </span>
                  )}
                </div>
              </div>
              <span className="font-body-md text-body-md text-on-surface-variant leading-snug">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Điều khoản dịch vụ
                </Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Chính sách bảo mật
                </Link>{' '}
                của WanderShare
              </span>
            </label>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={[
                'w-full py-3 rounded-lg font-label-md text-label-md',
                'flex items-center justify-center gap-2',
                'transition-all duration-200 shadow-float',
                isLoading
                  ? 'bg-primary/70 text-on-primary cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98]',
              ].join(' ')}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Tạo tài khoản
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="font-caption text-caption text-outline">hoặc</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Back to login */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-lg font-label-md text-label-md border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
