import { useState } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import { formatDate } from "../../../utils/DateHelper";
import { Activity, Hospital, User, Calendar } from "lucide-react";
import AnimatedProgressBar from "../../UI/AnimatedProgressBar";

function Treatments() {
  const [page, setPage] = useState(1);

  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getTreatments,
    "treatements",
    page,
  );
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        <p className="text-slate-500 font-bold animate-pulse">
          Syncing treatment data...
        </p>
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* 🔷 Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Treatments</h1>
            <p className="text-sm text-slate-500 mt-1">
              Ongoing and past medical treatment records
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            {records.length} Records
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-8">
          {records.length === 0 && !loading && (
            <div className="py-28 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Activity className="text-purple-600" size={28} />
              </div>
              <p className="text-slate-500 font-medium">
                No treatment records found.
              </p>
            </div>
          )}

          {records.map((t) => (
            <div
              key={t.id}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-800">
                    {t.diseaseName}
                  </h3>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.status}
                    </span>

                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {t.conditionType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 text-sm font-medium">
                <div className="flex items-center gap-3 text-slate-600">
                  <Hospital size={18} className="text-purple-600" />
                  {t.hospitalOrClinicName}
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <User size={18} className="text-purple-600" />
                  Dr. {t.doctor?.fullName || "-"}
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={18} className="text-purple-600" />
                  Last Visit:{" "}
                  <span className="text-slate-800 font-semibold">
                    {formatDate(t.lastVisitedDate)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={18} className="text-purple-600" />
                  Next Visit:{" "}
                  <span className="text-slate-800 font-semibold">
                    {formatDate(t.nextVisitedDate)}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Treatment Progress</span>
                  <span>{t.progressPercentage || 0}%</span>
                </div>

                <AnimatedProgressBar value={t.progressPercentage || 0} />

                {t.currentProgress && (
                  <p className="text-xs text-slate-500 font-medium">
                    {t.currentProgress}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center items-center gap-6 pt-8">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => handlePageChange(page - 1)}
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => handlePageChange(page + 1)}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-40 hover:bg-purple-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Treatments;
