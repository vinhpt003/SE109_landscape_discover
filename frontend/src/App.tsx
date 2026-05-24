import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// ── User-facing pages ──────────────────────────────────────────────
const Home           = lazy(() => import('./pages/Home'))
const LandmarkDetail = lazy(() => import('./pages/LandmarkDetail'))

// ── Auth pages ─────────────────────────────────────────────────────
const Login    = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Login'))  // TODO: Tạo trang Register riêng

// ── Admin pages ────────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import('./pages/Admin/Dashboard'))
const AdminLandmarks      = lazy(() => import('./pages/Admin/Landmarks'))
const AdminEditLandmark   = lazy(() => import('./pages/Admin/Landmarks/EditLandmark'))

// ── 404 ────────────────────────────────────────────────────────────
const NotFound = lazy(() => import('./pages/NotFound'))

// ── Loading fallback toàn trang ────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
        <p className="text-label-md text-on-surface-variant">Đang tải...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Trang người dùng ─────────────────────────────── */}
          <Route path="/"                   element={<Home />} />
          <Route path="/landmarks/:id"      element={<LandmarkDetail />} />

          {/* ── Auth ─────────────────────────────────────────── */}
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Register />} />

          {/* ── Admin ─────────────────────────────────────────── */}
          <Route path="/admin"                        element={<AdminDashboard />} />
          <Route path="/admin/landmarks"              element={<AdminLandmarks />} />
          <Route path="/admin/landmarks/new"          element={<AdminEditLandmark />} />
          <Route path="/admin/landmarks/:id/edit"     element={<AdminEditLandmark />} />

          {/* ── 404 ───────────────────────────────────────────── */}
          <Route path="*"                   element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
