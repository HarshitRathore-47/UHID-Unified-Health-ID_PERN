import { useState, useEffect } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import LabReportsUI from "../../UI/LabReportUI";

function LabReports() {
  // 1. States for Syncing with Hook
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  
  const { records, pagination, loading, error, load } = usePaginatedResource(patientService.getLabReports, "lab-reports", { page: currentPage, searchTerm })

  // 🔎 3. Search Handler
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); 
  };

  // 📄 4. Fetch Detailed Report 
  const handleViewReport = async (reportId) => {
    try {
      const detail = await patientService.getLabReportDetails(reportId);
    
      setSelectedReport(detail); 
    } catch (err) {
      console.error("Failed to fetch report detail:", err);
    }
  };

  // 5. Pagination Handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  
  };

  // Loading state (Sirf pehli baar fetch pe dikhao, page change pe purana data rehne do)
  if (loading && records.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-10 text-center font-bold">{error}</div>;

  return (
    <div className="space-y-6">
      {/* UI Component */}
      <LabReportsUI
        reports={records} 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onView={handleViewReport}
        selectedReport={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* 6. Professional Pagination UI */}
      {pagination && pagination.totalPages > 0 && (
        <div className="flex justify-center items-center gap-6 py-10 border-t border-slate-100">
          <button
            disabled={!pagination.hasPrevPage || loading}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="px-6 py-2 rounded-2xl bg-slate-100 text-slate-600 font-bold disabled:opacity-30 hover:bg-slate-200 transition-all active:scale-95"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
              {pagination.currentPage}
            </span>
            <span className="text-sm font-bold text-slate-400">of {pagination.totalPages}</span>
          </div>

          <button
            disabled={!pagination.hasNextPage || loading}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            className="px-6 py-2 rounded-2xl bg-[#4a148c] text-white font-bold disabled:opacity-30 hover:bg-[#6a1b9a] transition-all shadow-md active:scale-95"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default LabReports;