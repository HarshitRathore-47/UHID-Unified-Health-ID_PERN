import { useState } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import LabReportsUI from "../../ui/LabReportUI";

function LabReports() {
  const { records, pagination, loading, error, load } =
    usePaginatedResource(patientService.getLabReports);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // 🔎 Search Filter
  const filteredReports = records.filter((r) =>
    r.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 Fetch Detailed Report
  const handleViewReport = async (reportId) => {
    try {
      const detail =
        await patientService.getLabReportDetails(reportId);
      setSelectedReport(detail);
    } catch (err) {
      console.error("Failed to fetch report detail", err);
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <LabReportsUI
        reports={filteredReports}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onView={handleViewReport}
        selectedReport={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center items-center gap-6 pt-8">

          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => load(pagination.currentPage - 1)}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
          >
            Previous
          </button>

          <span className="text-sm font-semibold text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => load(pagination.currentPage + 1)}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-40 hover:bg-purple-700 transition"
          >
            Next
          </button>

        </div>
      )}
    </>
  );
}

export default LabReports;