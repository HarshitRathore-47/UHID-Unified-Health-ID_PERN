import { useState } from "react";
import doctorService from "../../../../services/doctorServices";

function VisitForm({ patientId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    hospitalName: "",
    hospitalAddress: "",
    visitDate: "",
    purposeReason: "",
    physicianName: "",
    physicianSpeciality: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Matches doctorService.createVisit(patientId, payload)
      await doctorService.createVisit(patientId, form);
      onClose(); // Triggers reload in PatientRecord
    } catch (err) {
      setError(err.message || "Failed to add visit record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Record Hospital Visit</h2>
        <p className="text-xs text-slate-500">Log previous or current visit details for the patient history.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Purpose */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Purpose / Reason</label>
          <input 
            name="purposeReason" 
            required 
            value={form.purposeReason}
            onChange={handleChange} 
            className="w-full mt-1 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
            placeholder="e.g. Routine Checkup, Emergency, Consultation" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Hospital Name */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hospital Name</label>
            <input 
              name="hospitalName" 
              required 
              value={form.hospitalName}
              onChange={handleChange} 
              className="w-full mt-1 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
              placeholder="Facility name" 
            />
          </div>
          {/* Visit Date */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Visit Date</label>
            <input 
              type="date" 
              name="visitDate" 
              required 
              value={form.visitDate}
              onChange={handleChange} 
              className="w-full mt-1 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Physician Name */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Physician Name</label>
            <input 
              name="physicianName" 
              required
              value={form.physicianName}
              onChange={handleChange} 
              className="w-full mt-1 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
              placeholder="Dr. Name"
            />
          </div>
          {/* Speciality */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Speciality</label>
            <input 
              name="physicianSpeciality" 
              value={form.physicianSpeciality}
              onChange={handleChange} 
              className="w-full mt-1 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
              placeholder="e.g. Cardiologist"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hospital Address (Optional)</label>
          <input 
            name="hospitalAddress" 
            value={form.hospitalAddress}
            onChange={handleChange} 
            className="w-full mt-1 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
            placeholder="City, State"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="px-10 py-2.5 rounded-xl bg-(--primary) text-white font-bold shadow-lg shadow-(--primary)/20 hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? "Recording..." : "Save Visit"}
        </button>
      </div>
    </form>
  );
}

export default VisitForm;