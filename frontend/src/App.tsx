import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandmarkDetail from "./pages/LandmarkDetail";
import NotFound from "./pages/NotFound";

// Admin pages
import Dashboard from "./pages/Admin/Dashboard";
import Landmarks from "./pages/Admin/Landmarks";
import EditLandmark from "./pages/Admin/Landmarks/EditLandmark";
import Verification from "./pages/Admin/Verification";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landmarks/:id" element={<LandmarkDetail />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/landmarks" element={<Landmarks />} />
        <Route
          path="/admin/landmarks/edit/:id"
          element={<EditLandmark />}
        />
        <Route
          path="/admin/verification"
          element={<Verification />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
