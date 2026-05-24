import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!identifier || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { user, access_token } = await authService.login(identifier, password)
      login(user, access_token)
      navigate(user.role === 'Admin' || user.role === 'Editor' ? '/admin' : '/')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-10 card-shadow border border-surface-container-low">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">landscape</span>
          </div>
          <span className="font-display text-headline-md font-bold text-primary">WanderShare</span>
        </div>

        <h1 className="font-display text-headline-lg text-on-background mb-2">Đăng nhập</h1>
        <p className="font-sans text-body-md text-on-surface-variant mb-8">
          Chào mừng trở lại! Nhập thông tin của bạn để tiếp tục.
        </p>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-md text-body-md mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
              Email hoặc tên đăng nhập
            </label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="email@example.com hoặc username"
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

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-float mt-2 disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
