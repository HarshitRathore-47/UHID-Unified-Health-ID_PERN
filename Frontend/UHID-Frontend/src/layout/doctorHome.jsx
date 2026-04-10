import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import DoctorSidebar from "./doctorSideBar";
import DoctorNavbar from "./doctorNavBar";
import ErrorBoundary from "../components/common/ErrorBoundary";

import DoctorDashboard from "../components/dashboard/Doctors/Dashboard";
import ActiveConsents from "../components/dashboard/Doctors/ActiveConsents";
import PatientRecord from "../components/dashboard/Doctors/PatientRecords";
import DoctorProfile from "../components/dashboard/Doctors/DoctorProfile";

function DoctorHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  return (
    <div data-theme="doctor" className="flex min-h-screen">
      <DoctorSidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <DoctorNavbar setOpen={setIsSidebarOpen} />

        <main className="flex-1 p-6 bg-slate-50">
          <Routes>
            <Route
              index
              element={
                <ErrorBoundary>
                  <DoctorDashboard />
                </ErrorBoundary>
              }
            />

            <Route
              path="consents"
              element={
                <ErrorBoundary>
                  <ActiveConsents />
                </ErrorBoundary>
              }
            />

            <Route
              path="patient/:patientId"
              element={
                <ErrorBoundary>
                  <PatientRecord />
                </ErrorBoundary>
              }
            />
            <Route
              path="profile"
              element={
                <ErrorBoundary>
                  <DoctorProfile />
                </ErrorBoundary>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DoctorHome;
