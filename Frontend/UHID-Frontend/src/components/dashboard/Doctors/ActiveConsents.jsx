import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import useTheme from "../../../hooks/useTheme";
import usePaginatedResource from "../../../hooks/usePaginatedResource"; // ✅ Switched to Paginated
import doctorService from "../../../services/doctorServices";
import { formatDateTime } from "../../../utils/DateHelper";
import { motion,AnimatePresence } from "framer-motion";

function ActiveConsents() {
  useTheme("doctor");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ usePaginatedResource with "activeConsents" key for polling
  const {
    records: consents,
    pagination,
    loading,
    error,
  } = usePaginatedResource(
    doctorService.getActiveConsents,
    "activeConsents",
    currentPage,
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Active Patient Access
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage patients who have granted you access to their records
          </p>
        </div>

        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          {pagination?.totalItems || 0} Total Consents
        </div>
      </div>

      {/* STATES (Loading/Error/Empty) */}
      {loading && (
        <div className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">
          Syncing Records...
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500 font-bold bg-red-50 rounded-[2rem] border border-red-100">
          {error}
        </div>
      )}

      {!loading && consents.length === 0 && (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
          <ShieldCheck className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-500 font-bold text-lg">
            No active access found
          </p>
        </div>
      )}

      {/* CONSENTS LIST */}
      {!loading && consents.length > 0 && (
        <div className="space-y-4">
          {consents.map((item) => (
            <motion.div
              key={item.id}
              /* ✅ Hover & Realistic Motion Logic */
              whileHover={{
                y: -8, // Thoda upar uthega
                scale: 1.01, // Halka sa bada hoga
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              className="bg-white p-8 rounded-2xl border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-(--primary) hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-colors duration-300 cursor-pointer"
              onClick={() => navigate(`/doctor/patient/${item.patientId}`)}
            >
              <div className="flex items-center gap-8">
                {/* 👤 Icon Box with Spring Hover */}
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="bg-slate-50 size-20 rounded-2xl flex items-center justify-center border border-slate-200 group-hover:bg-linear-to-br group-hover:from-(--primary) group-hover:to-(--primary-dark) transition-all duration-500 shadow-inner"
                >
                  <User
                    size={36}
                    className="text-slate-400 group-hover:text-white transition-colors"
                  />
                </motion.div>

                <div className="space-y-3">
                  <h3 className="font-black text-3xl text-slate-900 uppercase tracking-tight leading-none group-hover:text-(--primary) transition-colors">
                    {item.patientName}
                  </h3>

                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Patient UHID
                      </span>
                      <span className="text-sm font-black text-slate-700 tracking-tight">
                        {item.uhid}
                      </span>
                    </div>
                    <div className="flex flex-col border-l-2 border-slate-100 pl-8">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Age Detail
                      </span>
                      <span className="text-sm font-black text-slate-700 tracking-tight">
                        {item.age} Years
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {/* Pulsing Dot with Shadow for Living feel */}
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Access Permission Expires:{" "}
                      <span className="text-slate-900 font-bold">
                        {formatDateTime(item.expiry)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full md:w-auto bg-linear-to-r from-(--primary) to-(--primary-dark) text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
                View Full Records
              </button>
            </motion.div>
          ))}

          {/* PAGINATION CONTROLS */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-10">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-black text-slate-500 uppercase tracking-widest">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActiveConsents;
