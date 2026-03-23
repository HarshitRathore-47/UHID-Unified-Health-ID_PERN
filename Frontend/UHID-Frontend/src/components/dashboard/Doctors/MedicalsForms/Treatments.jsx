import { useState } from "react";
import doctorService from "../../../../services/doctorServices";

function TreatmentForm({ patientId, onClose }) {
  const [form, setForm] = useState({
    conditionType: "",
    diseaseName: "",
    hospitalOrClinicName: "",
    currentProgress: "",
    nextVisitedDate: "",
    progressPercentage: 0, // Added to match controller requirements
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "progressPercentage" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Logic matches createTreatment controller
      await doctorService.createTreatment(patientId, form);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create treatment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Add Treatment Plan</h2>
        <p className="text-sm text-slate-500">Define the condition and tracking for this patient.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Disease Name */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-600">Disease / Condition Name</label>
          <input
            name="diseaseName"
            value={form.diseaseName}
            onChange={handleChange}
            required
            placeholder="e.g. Chronic Kidney Disease"
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-(--primary)/20 outline-none"
          />
        </div>

        {/* Condition Type */}
        <div>
          <label className="text-sm font-semibold text-slate-600">Condition Type</label>
          <select
            name="conditionType"
            value={form.conditionType}
            onChange={handleChange}
            required
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-(--primary)/20 outline-none"
          >
            <option value="">Select Type</option>
            <option value="ACUTE">Acute</option>
            <option value="CHRONIC">Chronic</option>
          </select>
        </div>

        {/* Next Visit */}
        <div>
          <label className="text-sm font-semibold text-slate-600">Next Planned Visit</label>
          <input
            type="date"
            name="nextVisitedDate"
            value={form.nextVisitedDate}
            onChange={handleChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-(--primary)/20 outline-none"
          />
        </div>

        {/* Hospital */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-600">Hospital / Clinic Name</label>
          <input
            name="hospitalOrClinicName"
            value={form.hospitalOrClinicName}
            onChange={handleChange}
            required
            placeholder="Enter facility name"
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-(--primary)/20 outline-none"
          />
        </div>

        {/* Progress Percentage */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-600">Recovery Progress</label>
            <span className="text-sm font-bold text-(--primary)">{form.progressPercentage}%</span>
          </div>
          <input
            type="range"
            name="progressPercentage"
            min="0"
            max="100"
            value={form.progressPercentage}
            onChange={handleChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3 accent-(--primary)"
          />
        </div>

        {/* Progress Notes */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-600">Current Progress Notes</label>
          <textarea
            name="currentProgress"
            value={form.currentProgress}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the current status of the patient..."
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-(--primary)/20 outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2 rounded-xl bg-(--primary) text-white font-bold shadow-lg shadow-(--primary)/20 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Treatment"}
        </button>
      </div>
    </form>
  );
}

export default TreatmentForm;