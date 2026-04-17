import { useState } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import ConsentsUI from "../../UI/ConsentUI.jsx";

function Consents() {
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getConsents,
    "consents",
    page,
  );

  const handleAction = async (id, action) => {
    try {
      setActionLoading(true);

      if (action === "ACCEPTED") {
        await patientService.acceptConsent(id);
      } else if (action === "REJECTED") {
        await patientService.rejectConsent(id);
      } else if (action === "REVOKED") {
        await patientService.revokeConsent(id);
      }

      await load();
    } catch (err) {
      console.error("Consent action failed:", err);
      const backendMessage = err.response?.data?.message;
      alert(backendMessage || err.message || "Consent action failed");
    } finally {
      setActionLoading(false);
    }
  };
  if (loading && records.length === 0) return <div>Loading consents...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <ConsentsUI
        consentData={records}
        onAction={handleAction}
        isActionLoading={actionLoading}
      />

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center items-center gap-6 pt-8">
          <button
            disabled={!pagination.hasPrevPage || actionLoading}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
          >
            Previous
          </button>

          <span className="text-sm font-semibold text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage || actionLoading}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-40 hover:bg-purple-700 transition"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default Consents;
