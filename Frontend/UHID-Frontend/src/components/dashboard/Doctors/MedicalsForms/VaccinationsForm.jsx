import { useState } from "react";
import doctorService from "../../../../services/doctorServices";

function VaccinationForm({ patientId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    vaccineName: "",
    vaccineType: "",
    doseNumber: 1,
    vaccineDate: "",
    nextDueDate: "",
    providerName: "",
    batchNumber: "",
    hospitalName: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "doseNumber" ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Matches doctorService.createVaccination(patientId, payload)
      await doctorService.createVaccination(patientId, form);
      onClose(); // Triggers reload in PatientRecord
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || err.message || "Failed to add vaccination record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Add Vaccination Record</h2>
        <p className="text-xs text-slate-500">Record immunization details for the patient.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Vaccine Name */}
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Vaccine Name</label>
          <input
            name="vaccineName"
            required
            value={form.vaccineName}
            onChange={handleChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
            placeholder="e.g. Hepatitis B / Covaxin"
          />
        </div>

        {/* Vaccine Type */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Vaccine Type</label>
          <input
            name="vaccineType"
            value={form.vaccineType}
            onChange={handleChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
            placeholder="e.g. Inactivated"
          />
        </div>

        {/* Dose Number */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dose Number</label>
          <input
            type="number"
            name="doseNumber"
            value={form.doseNumber}
            onChange={handleChange}
            required
            min="1"
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
          />
        </div>

        {/* Vaccine Date */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date Administered</label>
          <input
            type="date"
            name="vaccineDate"
            required
            value={form.vaccineDate}
            onChange={handleChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
          />
        </div>

        {/* Next Due Date */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Next Due Date</label>
          <input
            type="date"
            name="nextDueDate"
            value={form.nextDueDate}
            onChange={handleChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
          />
        </div>

        {/* Hospital Name */}
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hospital / Clinic</label>
          <input
            name="hospitalName"
            value={form.hospitalName}
            onChange={handleChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
            placeholder="Facility where vaccine was given"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-2.5 rounded-xl bg-(--primary) text-white font-bold shadow-lg shadow-(--primary)/20 hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Record"}
        </button>
      </div>
    </form>
  );
}

export default VaccinationForm;