import { useState,useEffect } from "react";
import Navbar from "./navBar";
import Sidebar from "./Sidebar";
import ErrorBoundary from "../components/common/ErrorBoundary";

import Dashboard from "../components/dashboard/Patient/Dashboard";
import HealthProfile from "../components/dashboard/Patient/HealthProfile";
import LabReports from "../components/dashboard/Patient/LabReports";
import Treatments from "../components/dashboard/Patient/Treatments";
import Diets from "../components/dashboard/Patient/Diets";
import Vaccinations from "../components/dashboard/Patient/Vaccinations";
import Prescriptions from "../components/dashboard/Patient/Prescriptions";
import VisitHistory from "../components/dashboard/Patient/VisitHistory";
import Consents from "../components/dashboard/Patient/Consents";
import patientService from "../services/patientService";

import { Routes, Route } from "react-router-dom";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const data = await patientService.getHealthProfile();
      setProfile(data);
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar setOpen={setIsSidebarOpen} profile={profile}/>

        <main className="flex-1 p-6 bg-slate-50">
          <Routes>
            <Route
              index
              element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="health-profile"
              element={
                <ErrorBoundary>
                  <HealthProfile />
                </ErrorBoundary>
              }
            />
            <Route
              path="consents"
              element={
                <ErrorBoundary>
                  <Consents />
                </ErrorBoundary>
              }
            />
            <Route
              path="lab-reports"
              element={
                <ErrorBoundary>
                  <LabReports />
                </ErrorBoundary>
              }
            />
            <Route
              path="treatments"
              element={
                <ErrorBoundary>
                  <Treatments />
                </ErrorBoundary>
              }
            />
            <Route
              path="diets"
              element={
                <ErrorBoundary>
                  <Diets />
                </ErrorBoundary>
              }
            />
            <Route
              path="prescriptions"
              element={
                <ErrorBoundary>
                  <Prescriptions />
                </ErrorBoundary>
              }
            />
            <Route
              path="vaccinations"
              element={
                <ErrorBoundary>
                  <Vaccinations />
                </ErrorBoundary>
              }
            />
            <Route
              path="visit-history"
              element={
                <ErrorBoundary>
                  <VisitHistory />
                </ErrorBoundary>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Home;
