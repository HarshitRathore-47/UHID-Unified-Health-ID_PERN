import { useState } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import PrescriptionUI from "../../UI/PrescriptionUI";

function Prescriptions() {
  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getPrescriptions,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [medicineSystem, setMedicineSystem] = useState("");

  const filtered = records.filter((prescription) =>
    prescription.medicines?.some((med) =>
      med.prescribedMedicineName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 font-medium">
        Loading prescriptions...
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Prescriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete medicine history overview
          </p>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          {records.length} Records
        </div>
      </div>

      <PrescriptionUI
        prescriptions={filtered}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        medicineSystem={medicineSystem}
        onSystemChange={(value) => {
          setMedicineSystem(value);
          load({ page: 1, medicineSystem: value });
        }}
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
    </div>
  );
}

export default Prescriptions;
