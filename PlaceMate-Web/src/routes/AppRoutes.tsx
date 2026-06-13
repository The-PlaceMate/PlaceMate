import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import RegisterInstitute from "../pages/RegisterInstitute";
import AdminLogin from "../pages/AdminLogin";
import PendingApproval from "../pages/PendingApproval";
import Rejected from "../pages/Rejected";

import SuperAdminDashboard from "../dashboard/SuperAdminDashboard";
import InstituteDashboard from "../dashboard/InstituteDashboard";
import StudentDashboard from "../dashboard/StudentDashboard";
import TPODashboard from "../dashboard/TPODashboard";
import AddStudent from "../pages/AddStudent";
import StudentManagement from "../pages/StudentManagement";
import EditStudent from "../pages/EditStudent";
import TPOManagement from "../pages/TPOManagement";
import AddTPO from "../pages/AddTPO";
import EditTPO from "../pages/EditTPO";
import InstituteProfile from "../pages/InstituteProfile";
import InstituteReports from "../pages/InstituteReports";
import InstituteSettings from "../pages/InstituteSettings";
import InstituteCompanies from "../pages/InstituteCompanies";
import PlacementActivity from "../pages/PlacementActivity";
import TPODrives from "../pages/TPODrives";
import TPOApplications from "../pages/TPOApplications";
import TPOShortlists from "../pages/TPOShortlists";
import TPOResults from "../pages/TPOResults";
import TPOReports from "../pages/TPOReports";
import StudentProfile from "../pages/StudentProfile";
import StudentResume from "../pages/StudentResume";
import StudentDrives from "../pages/StudentDrives";
import StudentApplications from "../pages/StudentApplications";
import StudentResults from "../pages/StudentResults";
import StudentNotifications from "../pages/StudentNotifications";
import ProtectedRoute from "./ProtectedRoute";

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
          path="/pending"
          element={<PendingApproval />}
        />

        <Route
          path="/rejected"
          element={<Rejected />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_ADMIN"]}
            >
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institute/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INSTITUTE_ADMIN",
              ]}
            >
              <InstituteDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["STUDENT"]}
            >
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resume"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/drives"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDrives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentNotifications />
            </ProtectedRoute>
          }
        />

       <Route
          path="/tpo/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <TPODashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/add"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN", "TPO_ADMIN"]}
            >
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN", "TPO_ADMIN", "TPO"]}
            >
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN", "TPO_ADMIN", "TPO"]}
            >
              <EditStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/drives"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <TPODrives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/companies"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <InstituteCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/applications"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <TPOApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/shortlists"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <TPOShortlists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/results"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <TPOResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/reports"
          element={
            <ProtectedRoute
              allowedRoles={["TPO_ADMIN", "TPO"]}
            >
              <TPOReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <TPOManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/add"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <AddTPO />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <EditTPO />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/activity"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <PlacementActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/companies"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <InstituteCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/profile"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <InstituteProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/reports"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <InstituteReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/settings"
          element={
            <ProtectedRoute
              allowedRoles={["INSTITUTE_ADMIN"]}
            >
              <InstituteSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
