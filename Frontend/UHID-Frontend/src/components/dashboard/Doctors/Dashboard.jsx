import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, ChevronRight, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";

import useResource from "../../../hooks/useResource";
import doctorService from "../../../services/doctorServices";
import { formatDateTime } from "../../../utils/DateHelper";
import useTheme from "../../../hooks/useTheme";
import SearchPatient from "./SearchPatient";

function DoctorDashboard() {
  useTheme("doctor");
  const navigate = useNavigate();

  // ✅ Doctor Profile
  const { data: doctor, loading: doctorLoading } = useResource(
    doctorService.getDoctorProfile,
    "doctorProfile",
  );

  // ✅ Active Consents
  const {
    data,
    loading: consentsLoading,
    error,
  } = useResource(doctorService.getActiveConsents, "activeConsents");

  if (doctorLoading || consentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="size-12 border-4 border-slate-200 border-t-(--primary) rounded-full animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Initializing Dashboard...</p>
      </div>
    );
  }

  const consents = data?.record || [];
  const recentConsents = consents.slice(0, 5);
  const totalActive = data?.pagination?.totalItems || 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      
      {/* 🟦 TOP IDENTITY BAR */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          {/* Real Profile Photo logic */}
          <div className="size-16 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            {doctor?.profilePhotoKey ? (
              <img src={doctor.profilePhotoKey} alt="dr" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-slate-300" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              Dr. {doctor?.fullName}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {doctor?.specialization || "Medical Professional"} • {doctor?.hospital || "Health Center"}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/doctor/profile")}
          className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-200"
        >
          Manage Profile
        </button>
      </div>

      {/* 🔍 SEARCH SECTION */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-white text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <Activity className="text-sky-400" size={20} /> Patient Quick Search
          </h3>
          <SearchPatient />
        </div>
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
      </div>

      {/* 📊 ACTIVE CONSENTS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            Active Records
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
            Patients who have authorized your access
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            {totalActive} Connected
          </div>
          <button
            onClick={() => navigate("/doctor/consents")}
            className="group flex items-center gap-2 text-xs font-black text-(--primary) uppercase tracking-widest hover:translate-x-1 transition-transform"
          >
            All Consents <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 📑 PATIENT LIST / EMPTY STATE */}
      {consents.length === 0 ? (
        <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-white">
          <div className="bg-slate-50 size-20 rounded-full mx-auto flex items-center justify-center mb-6 border border-slate-100">
            <ShieldCheck className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
            No active authorizations found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recentConsents.map((item) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={item.patientId}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-(--primary)/20 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="bg-slate-50 size-14 rounded-2xl flex items-center justify-center border border-slate-100">
                  <User size={24} className="text-slate-400" />
                </div>

                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">
                    {item.patientName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase">
                      UHID: {item.uhid}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Expires: {formatDateTime(item.expiry)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/doctor/patient/${item.patientId}`)}
                className="w-full md:w-auto bg-(--primary) hover:bg-(--primary-dark) text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-100 transition-all active:scale-95"
              >
                Open Records
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;