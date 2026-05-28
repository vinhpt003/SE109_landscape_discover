import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/auth/ProtectedRoute'

// ── User-facing pages ──────────────────────────────────────────────
const Home           = lazy(() => import('./pages/Home'))
const LandmarkDetail = lazy(() => import('./pages/LandmarkDetail'))
const SavedPosts     = lazy(() => import('./pages/SavedPosts'))
const Profile        = lazy(() => import('./pages/Profile'))

// ── Auth pages ─────────────────────────────────────────────────────
const Login    = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

// ── Search ─────────────────────────────────────────────────────────
const Search = lazy(() => import('./pages/Search'))

// ── Editor / My Posts ──────────────────────────────────────────────
const MyPosts     = lazy(() => import('./pages/MyPosts'))
const EditMyPost  = lazy(() => import('./pages/MyPosts/EditMyPost'))

// ── Admin pages ────────────────────────────────────────────────────
const AdminDashboard    = lazy(() => import('./pages/Admin/Dashboard'))
const AdminLandmarks    = lazy(() => import('./pages/Admin/Landmarks'))
const AdminEditLandmark = lazy(() => import('./pages/Admin/Landmarks/EditLandmark'))
const AdminUsers        = lazy(() => import('./pages/Admin/Users'))
const AdminComments     = lazy(() => import('./pages/Admin/Comments'))

// ── 404 ────────────────────────────────────────────────────────────
const NotFound = lazy(() => import('./pages/NotFound'))

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

          {/* ── Trang người dùng (public) ─────────────────────── */}
          <Route path="/"              element={<Home />} />
          <Route path="/landmarks/:id" element={<LandmarkDetail />} />
          <Route path="/search"        element={<Search />} />

          {/* ── Auth ─────────────────────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Yêu cầu đăng nhập ────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/saved"   element={<SavedPosts />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ── Editor + Admin (My Posts) ─────────────────────── */}
          <Route element={<ProtectedRoute roles={['Editor', 'Admin']} />}>
            <Route path="/my-posts"             element={<MyPosts />} />
            <Route path="/my-posts/new"         element={<EditMyPost />} />
            <Route path="/my-posts/:id/edit"    element={<EditMyPost />} />
          </Route>

          {/* ── Admin (Admin role only) ───────────────────────── */}
          <Route element={<ProtectedRoute roles={['Admin']} />}>
            <Route path="/admin"                    element={<AdminDashboard />} />
            <Route path="/admin/landmarks"          element={<AdminLandmarks />} />
            <Route path="/admin/landmarks/new"      element={<AdminEditLandmark />} />
            <Route path="/admin/landmarks/:id/edit" element={<AdminEditLandmark />} />
            <Route path="/admin/users"              element={<AdminUsers />} />
            <Route path="/admin/comments"           element={<AdminComments />} />
          </Route>

          {/* ── 404 ───────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
