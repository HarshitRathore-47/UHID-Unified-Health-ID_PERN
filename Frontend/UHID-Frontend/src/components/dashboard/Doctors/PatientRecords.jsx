import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Clipboard,
  Activity,
  Beaker,
  Syringe,
  Utensils,
  CalendarDays,
  User,
  ShieldCheck,
  Search,
} from "lucide-react";

import useTheme from "../../../hooks/useTheme";
import useResource from "../../../hooks/useResource";
import doctorService from "../../../services/doctorServices";
import { calculateAge, formatDateTime } from "../../../utils/DateHelper";
import MedicalRecordModal from "./MadicalRecordModal";

function PatientRecord() {
  useTheme("doctor");
  const { patientId } = useParams();
  const queryClient = useQueryClient();

  const { data, loading, error, reload } = useResource(
    () => doctorService.getPatientFullRecord(patientId),
    "patientFullRecord",
    patientId,
  );

  const [tab, setTab] = useState("treatments");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState({
    open: false,
    type: null,
    id: null,
  });
  const { data: doctorProfile } = useResource(
    doctorService.getDoctorProfile,
    "doctorProfile",
  );

  const loggedInDoctorId = doctorProfile?.id;

  // Ek baar yahan console dalke check karo:

  const handleDeleteRecord = async (type, id) => {
    {
      try {
        // Type ke base par sahi service call hogi
        if (type === "treatment") await doctorService.deleteTreatment(id);
        if (type === "prescription") await doctorService.deletePrescription(id);
        if (type === "diet") await doctorService.deleteDiet(id);
        if (type === "vaccination") await doctorService.deleteVaccination(id);
        if (type === "visit") await doctorService.deleteVisit(id);
        if (type === "lab") await doctorService.deleteLabReport(id);

        toast.success("ENTRY REMOVED SUCCESSFULLY");
        reload(); // Data refresh karne ke liye
      } catch (err) {
        toast.error(
          err.response?.data?.message || "UNAUTHORIZED: ACCESS DENIED",
        );
      }
    }
  };

  const tabs = [
    {
      id: "treatments",
      label: "Treatments",
      type: "treatment",
      icon: Activity,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      type: "prescription",
      icon: Clipboard,
    },
    { id: "labReports", label: "Lab Reports", type: "lab", icon: Beaker },
    {
      id: "vaccinations",
      label: "Vaccinations",
      type: "vaccination",
      icon: Syringe,
    },
    { id: "diet", label: "Diet", type: "diet", icon: Utensils },
    { id: "visits", label: "Visits", type: "visit", icon: CalendarDays },
  ];

  const activeTab = tabs.find((t) => t.id === tab);

  const closeModal = () => {
    setModalOpen(false);
    reload();
    queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
  };

  if (loading)
    return (
      <div className="p-10 font-black uppercase text-slate-400 tracking-[0.2em] animate-pulse">
        Accessing Encrypted Records...
      </div>
    );

  const profile = data?.profile;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 🏛️ HEADER: Professional Clinical Identity Banner */}
      {/* --- Header Section Update --- */}
      <div className="bg-linear-to-r from-(--primary) to-(--primary-dark) rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch">
        <div className="p-10 flex-1 flex flex-col md:flex-row justify-between items-center gap-8 text-white">
          <div className="flex items-center gap-8">
            {/* Profile Photo Container */}
            <div className="size-24 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-inner">
              <User size={48} className="text-white" />
            </div>

            {/* Patient Name & Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black uppercase tracking-tight leading-none ">
                  {profile?.fullName}
                </h2>
                <ShieldCheck size={28} className="text-white/80" />
              </div>

              {/* Sub-details (UHID, Age, Gender) */}
              <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    UHID
                  </span>
                  <span className="text-sm font-black tracking-tight text-white">
                    {profile?.uhid}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    AGE
                  </span>
                  <span className="text-sm font-black tracking-tight text-white">
                    {profile?.dob ? calculateAge(profile.dob) : "--"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    GENDER
                  </span>
                  <span className="text-sm font-black tracking-tight text-white">
                    {profile?.gender}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setModalType(activeTab.type);
              setModalOpen(true);
            }}
            className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            Add {activeTab.label.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* 📑 TABS: Structured Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 overflow-x-auto no-scrollbar shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all whitespace-nowrap
            ${tab === t.id ? "bg-slate-100 text-slate-900 border border-slate-200 shadow-inner" : "text-slate-400 hover:text-slate-600"}`}
          >
            <t.icon
              size={14}
              className={tab === t.id ? "text-(--primary)" : ""}
            />{" "}
            {t.label}
          </button>
        ))}
      </div>

      {/* 📦 CONTENT AREA: Information-Dense Cards */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* 1. TREATMENTS */}
            {/* --- Treatments Tab Section --- */}
            {tab === "treatments" && (
              <div className="grid grid-cols-1 gap-8">
                {data?.Treatments?.length === 0 ? (
                  <EmptyState msg="No Treatment History Found" />
                ) : (
                  data?.Treatments?.map((t, i) => (
                    /* ✅ Container Wrapper for Alignment */
                    <div
                      key={i}
                      className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* 🟦 DARK HEADER: Symmetric & Bold */}
                      <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white border-b border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">
                            Medical Condition
                          </p>
                          <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                            {t.diseaseName}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                              t.conditionType === "CHRONIC"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                            }`}
                          >
                            {t.conditionType}
                          </span>
                        </div>
                      </div>

                      {/* ⬜️ WHITE BODY: Proper Spacing & Content */}
                      {/* --- Updated Treatment Body with All Fields --- */}
                      <div className="p-8 space-y-6">
                        {/* Facility Info */}
                        <div className="flex items-center gap-3 border-l-4 border-(--primary) pl-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                              Clinical Facility
                            </p>
                            <p className="text-base font-black text-slate-800 uppercase tracking-tight">
                              {t.hospitalOrClinicName}
                            </p>
                          </div>
                        </div>

                        {/* 📅 Visit Dates: Industrial Grid Layout */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              Last Visit
                            </p>
                            <p className="text-sm font-black text-slate-700 uppercase">
                              {t.lastVisitedDate
                                ? new Date(
                                    t.lastVisitedDate,
                                  ).toLocaleDateString("en-GB")
                                : "N/A"}
                            </p>
                          </div>
                          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                              Next Follow-up
                            </p>
                            <p className="text-sm font-black text-emerald-700 uppercase">
                              {t.nextVisitedDate
                                ? new Date(
                                    t.nextVisitedDate,
                                  ).toLocaleDateString("en-GB")
                                : "NOT SCHEDULED"}
                            </p>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="bg-slate-900/2 p-6 rounded-xl border-2 border-dashed border-slate-100">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">
                            Medical Narrative / Progress
                          </p>
                          <p className="text-[15px] font-bold text-slate-700 leading-relaxed italic">
                            "{t.currentProgress}"
                          </p>
                        </div>

                        {/* Footer: Status & Record Info */}
                        <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-50">
                          {/* Left: Status Indicator */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`size-2 rounded-full ${t.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                            />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              CONDITION {t.status}
                            </span>
                          </div>

                          {/* Right: Actions & Metadata */}
                          {/* --- Treatments Tab: Industrial Delete Bar --- */}
                          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-2">
                              <div
                                className={`size-2 rounded-full ${t.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                              />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                CONDITION {t.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-6">
                              {t.doctorId === loggedInDoctorId && (
                                <button
                                  onClick={() => {
                                    console.log(
                                      "Deleting Treatment with ID:",
                                      t.id,
                                    );
                                    setDeleteTarget({
                                      open: true,
                                      type: "treatment",
                                      id: t.id,
                                    });
                                  }}
                                  className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                                >
                                  <div className="size-1.5 bg-current rounded-full" />
                                  Delete Record
                                </button>
                              )}
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                DATA SYNCED:{" "}
                                {new Date().toLocaleDateString("en-GB")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. PRESCRIPTIONS */}
            {/* 2. PRESCRIPTIONS */}
            {tab === "prescriptions" && (
              <div className="space-y-6">
                {data?.prescriptions?.length === 0 ? (
                  <EmptyState msg="No Prescriptions Issued" />
                ) : (
                  data?.prescriptions?.map(
                    (
                      p,
                      i, // ✅ Added 'i' for consistency
                    ) => (
                      <div
                        key={i} // ✅ Consistent with treatment
                        className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col"
                      >
                        {/* 🟦 DARK HEADER */}
                        <div className="bg-slate-900 px-10 py-6 flex justify-between items-center text-white">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                              Clinical Diagnosis
                            </p>
                            <h3 className="text-xl font-black uppercase tracking-tight ">
                              {p.diagnosis}
                            </h3>
                          </div>
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-lg border border-white/20 uppercase tracking-widest">
                              <p className="text-[10px] font-black text-white uppercase tracking-[0.15em]">
                                {p.medicineSystem}
                              </p>
                            </div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter tabular-nums">
                              {formatDateTime(p.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* ⬜️ WHITE BODY (Medicines) */}
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                          {p.medicines?.map((m) => (
                            <div key={m.id} className="space-y-6 group">
                              <div className="flex items-center gap-3 border-l-4 border-(--primary) pl-4">
                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                                  MEDICATION
                                </p>
                              </div>
                              <div className="space-y-4 pl-4">
                                <div className="flex items-center gap-4">
                                  <div className="size-2.5 bg-(--primary) rounded-sm shrink-0" />
                                  <div className="space-y-1">
                                    <p className="text-[18px] font-black text-slate-900 uppercase tracking-tight leading-none">
                                      {m.prescribedMedicineName}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                      {m.brand} • {m.dosage}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                  <span className="bg-(--primary) text-white text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-tighter shadow-md">
                                    {m.frequency}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-100 pb-0.5">
                                    {m.instructedTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {console.log("Prescription Owner ID:", p.doctorId)}
                        {console.log("Logged In Doctor ID:", loggedInDoctorId)}
                        {/* 🧱 INDUSTRIAL DELETE BAR (Consistent with Treatment) */}
                        <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center mt-auto">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Official Rx Record
                          </p>
                          <div className="flex items-center gap-6">
                            {/* 🛡️ Ownership Guard: Check if IDs match string-to-string */}
                            {console.log("Prescription Owner ID:", p.doctorId)}
                            {console.log(
                              "Logged In Doctor ID:",
                              loggedInDoctorId,
                            )}
                            {String(p.doctorId) ===
                              String(loggedInDoctorId) && (
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    open: true,
                                    type: "prescription",
                                    id: p.id,
                                  })
                                }
                                className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                              >
                                <div className="size-1.5 bg-current rounded-full" />
                                Delete Record
                              </button>
                            )}
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                              DATA SYNCED:{" "}
                              {new Date().toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                      </div> // ✅ Main Card closing
                    ),
                  )
                )}
              </div>
            )}

            {/* 3. LAB REPORTS */}
            {/* --- Lab Reports Tab Section --- */}
            {tab === "labReports" && (
              <div className="space-y-8">
                {data?.labReports?.length === 0 ? (
                  <EmptyState msg="No Lab Reports Found" />
                ) : (
                  data?.labReports?.map((report) => (
                    <div
                      key={report.reportId}
                      className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden shadow-sm"
                    >
                      {/* Lab Header: Matching Prescription Style */}
                      <div className="bg-slate-900 px-10 py-7 flex justify-between items-center text-white">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            Laboratory Investigation
                          </p>
                          <h3 className="text-2xl font-black uppercase tracking-tight">
                            {report.testName}
                          </h3>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-lg border border-white/20 uppercase tracking-widest">
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.15em]">
                              {report.status}
                            </p>
                          </div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter tabular-nums">
                            {formatDateTime(
                              report.reportDateTime || report.collectionDate,
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Results Table: Industrial Design */}
                      <div className="p-10">
                        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="p-5 border-r border-slate-200">
                                  Test Parameter
                                </th>
                                <th className="p-5 text-center border-r border-slate-200">
                                  Observation / Result
                                </th>
                                <th className="p-5 text-right">
                                  Reference Range
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {report.results?.map((res, i) => (
                                <tr
                                  key={i}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  <td className="p-5 text-sm font-black text-slate-800 uppercase tracking-tight border-r border-slate-100">
                                    {res.parameterName}
                                  </td>
                                  <td className="p-5 text-center border-r border-slate-100">
                                    <span className="text-lg font-black text-(--primary) tabular-nums">
                                      {res.value}
                                    </span>
                                    <span className="ml-1 text-[10px] font-black text-slate-400 uppercase">
                                      {res.unit}
                                    </span>
                                  </td>
                                  <td className="p-5 text-right text-xs font-bold text-slate-400 tabular-nums">
                                    {res.referenceRange}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Remarks if any */}
                        {report.remarksNotes && (
                          <div className="mt-6 p-5 bg-slate-50 border-l-4 border-slate-200 rounded-r-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-xs">
                              Doctor Remarks
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                              {report.remarksNotes}
                            </p>
                          </div>
                        )}
                        {/* --- Lab Reports Tab: Industrial Delete Bar --- */}
                        <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center mt-auto">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Lab Verified Result
                          </p>
                          <div className="flex items-center gap-6">
                            {console.log(
                              report.doctorId + "  " + loggedInDoctorId,
                            )}
                            {report.doctorId === loggedInDoctorId && (
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    open: true,
                                    type: "lab",
                                    id: report.reportId, // ✅ Backend field match kiya
                                  })
                                }
                                className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                              >
                                <div className="size-1.5 bg-current rounded-full" />
                                Delete Record
                              </button>
                            )}
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                              DATA SYNCED:{" "}
                              {new Date().toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* --- Vaccinations Tab Section --- */}
            {tab === "vaccinations" && (
              <div className="space-y-6">
                {data?.vaccinations?.length === 0 ? (
                  <EmptyState msg="No Vaccination Records" />
                ) : (
                  data?.vaccinations?.map((v, i) => (
                    <div
                      key={i}
                      className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* 🟦 DARK HEADER: Vaccine Name & Type */}
                      <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white border-b border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">
                            Immunization Record
                          </p>
                          <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                            {v.vaccineName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-lg border border-white/20 uppercase tracking-widest">
                            {v.vaccineType}
                          </span>
                        </div>
                      </div>

                      {/* ⬜️ WHITE BODY: Dose & Dates */}
                      <div className="p-8 space-y-6">
                        {/* Dose Number with Vertical Accent */}
                        <div className="flex items-center gap-4 border-l-4 border-(--primary) pl-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                              Administration
                            </p>
                            <p className="text-lg font-black text-slate-800 uppercase tracking-tight">
                              DOSE NUMBER: {v.doseNumber}
                            </p>
                          </div>
                        </div>

                        {/* Dates Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              Date Administered
                            </p>
                            <p className="text-[13px] font-black text-slate-700 uppercase">
                              {new Date(v.vaccineDate).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                          </div>
                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">
                              Next Due Date
                            </p>
                            <p className="text-[13px] font-black text-amber-700 uppercase">
                              {v.nextDueDate
                                ? new Date(v.nextDueDate).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "FULLY VACCINATED"}
                            </p>
                          </div>
                        </div>

                        {/* --- Vaccinations Tab: Industrial Delete Bar --- */}
                        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center mt-auto">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="size-1.5 bg-emerald-400 rounded-full" />
                            Certified Entry
                          </p>
                          <div className="flex items-center gap-6">
                            {v.doctorId === loggedInDoctorId && (
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    open: true,
                                    type: "vaccination",
                                    id: v.vaccinationId,
                                  })
                                }
                                className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                              >
                                <div className="size-1.5 bg-current rounded-full" />
                                Delete Record
                              </button>
                            )}
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                              DATA SYNCED:{" "}
                              {new Date().toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* 4. VISITS: Solid List */}
            {/* --- Visits Tab Section: Full Data Display --- */}
            {tab === "visits" && (
              <div className="space-y-6">
                {data?.visitHistory?.length === 0 ? (
                  <EmptyState msg="No Visit History Found" />
                ) : (
                  data?.visitHistory?.map((v, i) => (
                    <div
                      key={i}
                      className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* 🟦 DARK HEADER: Purpose & Date */}
                      <div className="bg-slate-900 px-10 py-6 flex justify-between items-center text-white border-b border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">
                            Consultation Purpose
                          </p>
                          <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                            {v.purposeReason}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.15em] leading-none">
                              {new Date(v.visitDate).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ⬜️ WHITE BODY: Structured Grid */}
                      <div className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* Physician Details */}
                          <div className="flex items-start gap-4 border-l-4 border-(--primary) pl-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                                Consulting Physician
                              </p>
                              <p className="text-[17px] font-black text-slate-800 uppercase tracking-tight">
                                {v.physicianName}
                              </p>
                              <p className="text-[11px] font-bold text-(--primary) uppercase tracking-widest">
                                {v.physicianSpeciality}
                              </p>
                            </div>
                          </div>

                          {/* Hospital Details */}
                          <div className="flex items-start gap-4 border-l-4 border-slate-200 pl-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                                Healthcare Facility
                              </p>
                              <p className="text-[17px] font-black text-slate-800 uppercase tracking-tight">
                                {v.hospitalName}
                              </p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
                                {v.hospitalAddress}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* --- Visits Tab: Industrial Delete Bar --- */}
                        <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Official Log
                          </p>
                          <div className="flex items-center gap-6">
                            {v.doctorId === loggedInDoctorId && (
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    open: true,
                                    type: "visit",
                                    id: v.id,
                                  })
                                }
                                className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                              >
                                <div className="size-1.5 bg-current rounded-full" />
                                Delete Record
                              </button>
                            )}
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                              DATA SYNCED:{" "}
                              {new Date().toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Diet & Vaccination remain structured as cards but with industrial feel */}
            {tab === "diet" && (
              <div className="space-y-6">
                {data?.Diet?.length === 0 ? (
                  <EmptyState msg="No Diet Plan Assigned" />
                ) : (
                  data?.Diet?.map((d, i) => (
                    <div
                      key={i}
                      className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden shadow-sm"
                    >
                      {/* Diet Header */}
                      {/* --- Diet Header with Status Logic --- */}
                      <div className="bg-slate-900 py-6 px-10 flex justify-between items-center text-white ">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Nutritional Strategy
                          </p>
                          <h3 className="text-2xl font-black uppercase tracking-tight">
                            {d.dietName}
                          </h3>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {d.status === "ACTIVE" ? (
                            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                              <div className="size-1.5  bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] animate-pulse" />
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                                Active Plan
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                              <div className="size-1.5 bg-slate-400 rounded-full shadow-[0_0_8px] " />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">
                                {d.status || "COMPLETED"}
                              </p>
                            </div>
                          )}

                          <p className="text-[12px] font-bold text-white/40 uppercase tracking-tighter tabular-nums leading-none">
                            PERIOD: {formatDateTime(d.startDate)} -{" "}
                            {d.endDate ? formatDateTime(d.endDate) : "PRESENT"}
                          </p>
                        </div>
                      </div>

                      {/* Meals Grid */}
                      <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <DietCol title="BREAKFAST" items={d.breakfastItems} />
                        <DietCol title="LUNCH" items={d.lunchItems} />
                        <DietCol title="DINNER" items={d.dinnerItems} />
                      </div>

                      {/* Restrictions Section */}
                      {d.avoidanceRestriction?.length > 0 && (
                        <div className=" p-10 ">
                          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <span className="size-2.5 bg-red-500 rounded-full" />
                            CONTRAINDICATIONS / AVOID
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {d.avoidanceRestriction.map((item, idx) => (
                              <span
                                key={idx}
                                className="bg-red-100/50 text-red-600 px-5 py-3 rounded-lg text-xs font-black border-2 border-red-50 uppercase tracking-widest shadow-sm"
                              >
                                ✕ {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* --- Diet Tab: Industrial Delete Bar --- */}
                      <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Nutrition Plan
                        </p>
                        <div className="flex items-center gap-6">
                          {d.doctorId === loggedInDoctorId && (
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  open: true,
                                  type: "diet",
                                  id: d.id,
                                })
                              }
                              className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                            >
                              <div className="size-1.5 bg-current rounded-full" />
                              Delete Record
                            </button>
                          )}
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                            DATA SYNCED:{" "}
                            {new Date().toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <MedicalRecordModal
        open={modalOpen}
        type={modalType}
        patientId={patientId}
        onClose={closeModal}
      />
      <AnimatePresence>
        {deleteTarget.open && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDeleteTarget({ open: false, type: null, id: null })
              }
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative z-10 border border-slate-100"
            >
              <div className="size-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                <ShieldCheck size={40} className="text-red-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter text-center leading-none">
                Confirm Termination
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mt-4 leading-relaxed">
                This record will be permanently erased from clinical history.
                This action cannot be reversed.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button
                  onClick={() =>
                    setDeleteTarget({ open: false, type: null, id: null })
                  }
                  className="py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={() => {
                    handleDeleteRecord(deleteTarget.type, deleteTarget.id);
                    setDeleteTarget({ open: false, type: null, id: null });
                  }}
                  className="py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-red-600 shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DataPoint = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </span>
    <span className="text-xs font-black text-slate-700 tracking-tight">
      {value || "---"}
    </span>
  </div>
);

const DietCol = ({ title, items }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 border-l-4 border-(--primary) pl-4">
      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
        {title}
      </p>
    </div>

    <div className="space-y-4 pl-4">
      {items && items.length > 0 ? (
        items.map((it, i) => (
          <div key={i} className="flex items-center gap-4">
            {/* Solid Square Pointer - No Italic */}
            <div className="size-2 bg-(--primary) rounded-sm shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] shrink-0" />
            <p className="text-[16px] font-bold text-slate-800 uppercase tracking-tight leading-none">
              {it}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm font-bold text-slate-300">NOT SPECIFIED</p>
      )}
    </div>
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="py-32 text-center bg-slate-50 border border-slate-200 rounded-lg">
    <Search className="mx-auto text-slate-200 mb-4" size={32} />
    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
      {msg}
    </p>
  </div>
);

export default PatientRecord;
