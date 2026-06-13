import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const RegisterInstitute = lazy(() => import("../pages/RegisterInstitute"));
const InvitationRegistration = lazy(() => import("../pages/InvitationRegistration"));
const InvitationSuccess = lazy(() => import("../pages/InvitationSuccess"));
const InvitationError = lazy(() => import("../pages/InvitationError"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const PendingApproval = lazy(() => import("../pages/PendingApproval"));
const Rejected = lazy(() => import("../pages/Rejected"));

const SuperAdminDashboard = lazy(() => import("../dashboard/SuperAdminDashboard"));
const InstituteDashboard = lazy(() => import("../dashboard/InstituteDashboard"));
const StudentDashboard = lazy(() => import("../dashboard/StudentDashboard"));
const TPODashboard = lazy(() => import("../dashboard/TPODashboard"));
const AddStudent = lazy(() => import("../pages/AddStudent"));
const StudentManagement = lazy(() => import("../pages/StudentManagement"));
const EditStudent = lazy(() => import("../pages/EditStudent"));
const TPOManagement = lazy(() => import("../pages/TPOManagement"));
const AddTPO = lazy(() => import("../pages/AddTPO"));
const EditTPO = lazy(() => import("../pages/EditTPO"));
const InstituteProfile = lazy(() => import("../pages/InstituteProfile"));
const InstituteReports = lazy(() => import("../pages/InstituteReports"));
const InstituteSettings = lazy(() => import("../pages/InstituteSettings"));
const InstituteCompanies = lazy(() => import("../pages/InstituteCompanies"));
const PlacementActivity = lazy(() => import("../pages/PlacementActivity"));
const TPODrives = lazy(() => import("../pages/TPODrives"));
const TPOApplications = lazy(() => import("../pages/TPOApplications"));
const TPOShortlists = lazy(() => import("../pages/TPOShortlists"));
const TPOResults = lazy(() => import("../pages/TPOResults"));
const TPOReports = lazy(() => import("../pages/TPOReports"));
const StudentProfile = lazy(() => import("../pages/StudentProfile"));
const StudentResume = lazy(() => import("../pages/StudentResume"));
const StudentDrives = lazy(() => import("../pages/StudentDrives"));
const StudentApplications = lazy(() => import("../pages/StudentApplications"));
const StudentResults = lazy(() => import("../pages/StudentResults"));
const StudentNotifications = lazy(() => import("../pages/StudentNotifications"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="pm-route-loading">Loading PlaceMate...</div>}>
        <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route path="/register" element={<InvitationRegistration />} />

        <Route path="/register/success" element={<InvitationSuccess />} />

        <Route path="/register/error" element={<InvitationError />} />

        <Route path="/register-institute" element={<RegisterInstitute />} />

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
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
