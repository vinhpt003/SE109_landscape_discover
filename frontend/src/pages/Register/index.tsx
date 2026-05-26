import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import Toaster from '../../components/ui/Toaster'

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const { toasts, toast, dismiss } = useToast()
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!userName.trim() || !email.trim() || !password || !confirmPassword) {
      toast('Vui lòng nhập đầy đủ thông tin', 'error')
      return
    }
    if (password !== confirmPassword) {
      toast('Mật khẩu xác nhận không khớp', 'error')
      return
    }
    if (password.length < 6) {
      toast('Mật khẩu phải có ít nhất 6 ký tự', 'error')
      return
    }
    setLoading(true)
    try {
      const { user, access_token } = await authService.register(userName.trim(), email.trim(), password)
      login(user, access_token)
      toast('Tạo tài khoản thành công!', 'success', 1500)
      setTimeout(() => navigate('/'), 800)
    } catch (err: any) {
      toast(err?.response?.data?.message ?? 'Đăng ký thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
      <Toaster toasts={toasts} onDismiss={dismiss} />

      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-10 card-shadow border border-surface-container-low">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">landscape</span>
          </div>
          <span className="font-display text-headline-md font-bold text-primary">WanderShare</span>
        </div>

        <h1 className="font-display text-headline-lg text-on-background mb-2">Tạo tài khoản</h1>
        <p className="font-sans text-body-md text-on-surface-variant mb-8">
          Tham gia cộng đồng du lịch và khám phá địa danh Việt Nam.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="username"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="email@example.com"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-float mt-2 disabled:opacity-60"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
