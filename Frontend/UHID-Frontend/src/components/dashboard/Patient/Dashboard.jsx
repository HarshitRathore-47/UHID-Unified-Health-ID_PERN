import { useState } from "react";
import useResource from "../../../hooks/useResource";
import patientService from "../../../services/patientService";
import { calculateAge } from "../../../utils/DateHelper";
import { Copy, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function Dashboard() {
  const [showTick, setShowTick] = useState(false);
  const { data, loading, error } = useResource(patientService.getDashboardData,"patientDashboard");

  if (loading && !data) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a148c]"></div>
      <p className="mt-4 text-slate-500 font-medium italic">Preparing your health identity...</p>
    </div>
  );
}

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500 font-semibold">
        {error}
      </div>
    );
  if (!data) return null;

  const {
    profile = {},
    consents = [],
    labReports = [],
    activeTreatments = [],
    diet = [],
    vaccinations = [],
    visitHistory = [],
  } = data || {};

  const status = profile?.status || "Active";

  function formatUHID(uhid) {
    if (!uhid) return "";
    return uhid.match(/.{1,4}/g)?.join(" ") || uhid;
  }

  const handleCopy = () => {
    if (!profile?.uhid) return;   //Gaurd Clause
    navigator.clipboard.writeText(profile.uhid);
    setShowTick(true);
    // Hide the tick after 2 seconds
    setTimeout(() => setShowTick(false), 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* HERO CARD */}
      <div className="rounded-3xl overflow-hidden shadow-xl bg-linear-to-r from-[#4a148c] via-[#6a1b9a] to-[#4a148c] text-white">
        <div className="p-8 flex flex-col lg:flex-row justify-between gap-10">
          {/* Left Section */}
          <div className="space-y-5">
            <span className="text-xs font-black tracking-widest uppercase text-purple-200">
              Unified Health Identity
            </span>

            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-mono font-black tracking-tight">
                {formatUHID(profile?.uhid)}
              </h1>

              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-all active:scale-90"
                title="Copy UHID"
              >
                <Copy size={16} />
              </button>
              {/* APPEARING GREEN TICK */}
              <AnimatePresence>
                {showTick && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] brightness-125 font-bold size-4"
                  >
                    <CheckCircle2 size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <h2 className="text-3xl font-bold">{profile?.fullName}</h2>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                  status === "Active"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-slate-400/20 text-slate-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "Active"
                      ? "bg-green-400 animate-pulse"
                      : "bg-slate-300"
                  }`}
                />
                {status}
              </div>

              <div className="mt-4 text-sm space-y-1">
                <p>
                  <span className="text-purple-200">Gender:</span>{" "}
                  {profile?.gender}
                </p>
                <p>
                  <span className="text-purple-200">Age:</span>{" "}
                  {calculateAge(profile?.dob)} yrs
                </p>
              </div>
            </div>

            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
              <img
                src={`https://ui-avatars.com/api/?name=${profile?.fullName}&background=f3e5f5&color=4a148c&bold=true`}
                alt="User"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <SummaryCard title="Recent Lab Reports">
          {labReports.length === 0 && <Empty />}
          {labReports.map((report) => (
            <Item key={report.reportId}>
              {report.testName} – {report.labName}
            </Item>
          ))}
        </SummaryCard>

        <SummaryCard title="Active Treatments">
          {activeTreatments.length === 0 && <Empty />}
          {activeTreatments.map((t) => (
            <Item key={t.id}>
              {t.diseaseName} – {t.currentProgress}
            </Item>
          ))}
        </SummaryCard>

        <SummaryCard title="Recent Consents">
          {consents.length === 0 && <Empty />}
          {consents.map((c) => (
            <Item key={c.id}>
              Dr. {c.doctor?.fullName} – {c.consentStatus}
            </Item>
          ))}
        </SummaryCard>

        <SummaryCard title="Vaccinations">
          {vaccinations.length === 0 && <Empty />}
          {vaccinations.map((v) => (
            <Item key={v.vaccinationId}>
              {v.vaccineName} – Dose {v.doseNumber}
            </Item>
          ))}
        </SummaryCard>

        <SummaryCard title="Recent Visits">
          {visitHistory.length === 0 && <Empty />}
          {visitHistory.map((visit) => (
            <Item key={visit.visitId}>
              {visit.hospitalName} – {visit.purposeReason}
            </Item>
          ))}
        </SummaryCard>

        <SummaryCard title="Active Diet">
          {diet.length === 0 && <Empty />}
          {diet.map((d, i) => (
            <Item key={i}>{d.dietName}</Item>
          ))}
        </SummaryCard>
      </div>
    </div>
  );
}

/* UI Components */

const SummaryCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
    <h3 className="text-sm font-black uppercase tracking-widest text-[#4a148c] mb-5">
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Item = ({ children }) => (
  <div className="text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-purple-50 transition-all p-3 rounded-xl">
    {children}
  </div>
);

const Empty = () => (
  <div className="text-xs text-slate-400 italic">No records found</div>
);

export default Dashboard;
