import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import RegisterInstitute from "../pages/RegisterInstitute";
import AdminLogin from "../pages/AdminLogin";

import SuperAdminDashboard from "../dashboard/SuperAdminDashboard";
import InstituteDashboard from "../dashboard/InstituteDashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/register"
          element={<RegisterInstitute />}
        />

        <Route
          path="/admin/dashboard"
          element={<SuperAdminDashboard />}
        />

        <Route
          path="/institute/dashboard"
          element={<InstituteDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;