import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// {this is for State-Management , Global Auto refresh by React Query}

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RoleSelection from "./components/RoleSelector";
import PatientRegistration from "./components/RegisterPatient.jsx";
import DoctorRegistration from "./components/RegisterDoctor.jsx";
import LoginPatient from "./components/PatientLogin";
import LoginDoctor from "./components/DoctorLogin";
import DoctorPending from "./components/DoctorPending";
import DoctorRejected from "./components/DoctorRejected.jsx";
import ProtectedRoute from "./ProtectedRoute";
import PatientHome from "./layout/Home.jsx";
import AdminLayout from "./components/dashboard/Admin/AdminLayout";
import AdminDashboard from "./components/dashboard/Admin/AdminDashboard";
import Doctors from "./components/dashboard/Admin/Doctors";
import AuditLogs from "./components/dashboard/Admin/AuditLogs";
import DoctorDetails from "./components/dashboard/Admin/DoctorDetails.jsx";
import AdminLogin from "./components/dashboard/Admin/AdminLogin.jsx";
import DoctorHome from "./layout/doctorHome.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/patient/register" element={<PatientRegistration />} />
          <Route path="/patient/login" element={<LoginPatient />} />
          <Route path="/doctor/register" element={<DoctorRegistration />} />
          <Route path="/doctor/login" element={<LoginDoctor />} />

          {/* Admin public */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />
          </Route>

          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRole="PATIENT">
                <PatientHome />
              </ProtectedRoute>
            }
          />

          <Route element={<ProtectedRoute allowedRole="DOCTOR" />}>
            <Route path="/doctor/pending" element={<DoctorPending />} />
            <Route path="/doctor/rejected" element={<DoctorRejected />} />
            <Route path="/doctor/*" element={<DoctorHome />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
