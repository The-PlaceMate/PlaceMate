import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import RegisterInstitute from "../pages/RegisterInstitute";
import AdminLogin from "../pages/AdminLogin";

import SuperAdminDashboard from "../dashboard/SuperAdminDashboard";
import InstituteDashboard from "../dashboard/InstituteDashboard";
import AddStudent from "../pages/AddStudent";
import StudentManagement from "../pages/StudentManagement";
import EditStudent from "../pages/EditStudent";
import TPOManagement from "../pages/TPOManagement";
import AddTPO from "../pages/AddTPO";
import EditTPO from "../pages/editTPO";

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

        <Route path="/students/add" element={<AddStudent />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/students/edit/:id" element={<EditStudent />} />
        <Route path="/tpo" element={<TPOManagement />} />
        <Route path="/tpo/add" element={<AddTPO />} />
        <Route path="/tpo/edit/:id"element={<EditTPO />}/>
        {/* <Route path="/profile" element={<InstituteProfile />} />
        <Route path="/reports" element={<Reports />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;