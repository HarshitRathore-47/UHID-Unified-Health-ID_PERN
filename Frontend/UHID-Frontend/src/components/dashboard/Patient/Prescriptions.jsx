import { useState } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import PrescriptionUI from "../../UI/PrescriptionUI";

function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineSystem, setMedicineSystem] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 

  // 2. Hook with QueryKey and All Dependencies
  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getPrescriptions,
    "prescriptions",
    { page: currentPage, searchTerm, medicineSystem },
  );

  // 🔎 Search Reset Logic
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  // 💊 Medicine System Change Logic
  const handleSystemChange = (value) => {
    setMedicineSystem(value);
    setCurrentPage(1); 
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && records.length === 0)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-bold animate-pulse">
        Fetching your prescriptions...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500 font-black">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Prescriptions
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Complete medicine history overview
          </p>
        </div>

        <div className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-slate-500 font-black">
          {pagination?.totalItems || 0} Records
        </div>
      </div>

      {/* Prescription UI with Backend Filtering */}
      <PrescriptionUI
        prescriptions={records} // ✅ Seedha records use karo (Backend filtering is better)
        searchTerm={searchTerm}
        onSearch={handleSearch}
        medicineSystem={medicineSystem}
        onSystemChange={handleSystemChange}
      />

      {/* Modern Pagination UI */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pt-12 border-t border-slate-50">
          <button
            disabled={!pagination.hasPrevPage || loading}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="px-6 py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-slate-200 transition-all active:scale-95"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-xl border border-purple-100">
              {pagination.currentPage}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {pagination.totalPages}
            </span>
          </div>

          <button
            disabled={!pagination.hasNextPage || loading}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            className="px-6 py-2.5 rounded-2xl bg-[#4a148c] text-white font-black text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-[#6a1b9a] transition-all shadow-lg active:scale-95"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;
