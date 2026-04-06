import { useState } from "react";
import { motion } from "framer-motion";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import { formatDate } from "../../../utils/DateHelper";
import { CalendarClock, MapPin, User } from "lucide-react";

function VisitHistory() {
  const [currentPage, setCurrentPage] = useState(1);

  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getVisitHistory,
    "visit-history",
    currentPage,
  );
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && records.length === 0)
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 font-medium">
        Loading visit history...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-40 text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Visit History</h1>
        <p className="text-sm text-slate-500">
          Complete hospital and consultation records
        </p>
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <CalendarClock className="text-purple-600" size={28} />
          </div>
          <p className="text-slate-500 font-medium">No visit records found.</p>
        </div>
      )}

      {/* Timeline List */}
      <div className="relative space-y-10">
        {/* Vertical Timeline Line */}
        {records.length > 0 && (
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
        )}

        {records.map((visit, index) => (
          <motion.div
            key={visit.visitId || index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="relative pl-12"
          >
            {/* Timeline Dot */}
            <div className="absolute left-2 top-3 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-md" />

            {/* Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {visit.hospitalName}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {visit.purposeReason}
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  {formatDate(visit.visitDate)}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600 font-semibold">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-purple-600" />
                  <span>{visit.hospitalAddress || "-"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <User size={18} className="text-purple-600" />
                  <span>
                    {visit.doctor?.fullName || visit.physicianName || "-"}
                  </span>
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <User size={18} className="text-purple-600" />
                  <span>{visit.physicianSpeciality || "-"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center items-center gap-6 pt-8">
          <button
            disabled={!pagination.hasPrevPage || loading}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
          >
            Previous
          </button>

          <span className="text-sm font-semibold text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage || loading}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-40 hover:bg-purple-700 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default VisitHistory;
