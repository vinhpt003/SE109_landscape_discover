import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages — sẽ tạo dần sau
// import Home           from './pages/Home/Home'
// import Discover       from './pages/Discover/Discover'
// import LandmarkDetail from './pages/LandmarkDetail/LandmarkDetail'
// import About          from './pages/About/About'
// import NotFound       from './pages/NotFound/NotFound'

// Placeholder tạm thời cho đến khi có pages thật
const Home           = () => <div className="container-page py-10">🏠 Home</div>
const Discover       = () => <div className="container-page py-10">🗺️ Discover</div>
const LandmarkDetail = () => <div className="container-page py-10">📍 Landmark Detail</div>
const About          = () => <div className="container-page py-10">ℹ️ About</div>
const NotFound       = () => <div className="container-page py-10">404 — Không tìm thấy trang</div>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/discover"    element={<Discover />} />
        <Route path="/landmark/:id" element={<LandmarkDetail />} />
        <Route path="/about"       element={<About />} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
