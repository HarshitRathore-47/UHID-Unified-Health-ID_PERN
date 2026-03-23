import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import ConsentsUI from "../../UI/ConsentUI.jsx";

function Consents() {
  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getConsents,
  );

  // 🔥 ACCEPTED (active) first
  const sortedConsents = [...records].sort((a, b) => {
    if (a.consentStatus === "ACCEPTED") return -1;
    if (b.consentStatus === "ACCEPTED") return 1;
    return 0;
  });

  const handleAction = async (id, action) => {
    try {
      if (action === "ACCEPTED") {
        await patientService.acceptConsent(id);
      } else if (action === "REJECTED") {
        await patientService.rejectConsent(id);
      } else if (action === "REVOKED") {
        await patientService.revokeConsent(id);
      }

      load(pagination.currentPage);
    } catch (err) {
      console.error("Consent action failed:", err);
    }
  };
  if (loading) return <div>Loading consents...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <ConsentsUI consentData={sortedConsents} onAction={handleAction} />

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

export default Consents;
