import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import doctorService from "../../../../services/doctorServices";

function PrescriptionForm({ patientId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    diagnosis: "",
    medicineSystem: "ALLOPATHY", // Default value
    medicines: [
      {
        prescribedMedicineName: "",
        brand: "",
        dosage: "",
        frequency: "",
        instructedTime: "AFTER_MEAL",
      },
    ],
  });

  const handleMainChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMedicineChange = (index, e) => {
    const updatedMedicines = [...form.medicines];
    updatedMedicines[index][e.target.name] = e.target.value;
    setForm({ ...form, medicines: updatedMedicines });
  };

  const addMedicine = () => {
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        {
          prescribedMedicineName: "",
          brand: "",
          dosage: "",
          frequency: "",
          instructedTime: "AFTER_MEAL",
        },
      ],
    });
  };

  const removeMedicine = (index) => {
    if (form.medicines.length > 1) {
      const updatedMedicines = form.medicines.filter((_, i) => i !== index);
      setForm({ ...form, medicines: updatedMedicines });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await doctorService.createPrescription(patientId, form);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <h2 className="text-xl font-bold text-slate-800">New Prescription</h2>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-600">Diagnosis</label>
          <input
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleMainChange}
            required
            className="w-full mt-1 border border-slate-200 rounded-xl p-3"
            placeholder="e.g. Hypertension"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-600">System</label>
          <select
            name="medicineSystem"
            value={form.medicineSystem}
            onChange={handleMainChange}
            className="w-full mt-1 border border-slate-200 rounded-xl p-3"
          >
            <option value="ALLOPATHY">Allopathy</option>
            <option value="HOMEOPATHY">Homeopathy</option>
            <option value="AYURVEDA">Ayurveda</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Medicines</h3>
          <button
            type="button"
            onClick={addMedicine}
            className="flex items-center gap-1 text-sm text-(--primary) font-bold"
          >
            <Plus size={16} /> Add More
          </button>
        </div>

        {form.medicines.map((med, index) => (
          <div key={index} className="p-4 border border-slate-100 bg-slate-50 rounded-2xl relative space-y-3">
            {form.medicines.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedicine(index)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Medicine Name"
                name="prescribedMedicineName"
                value={med.prescribedMedicineName}
                onChange={(e) => handleMedicineChange(index, e)}
                required
                className="border border-slate-200 rounded-lg p-2 text-sm"
              />
              <input
                placeholder="Brand (Optional)"
                name="brand"
                value={med.brand}
                onChange={(e) => handleMedicineChange(index, e)}
                className="border border-slate-200 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="Dosage (e.g. 500mg)"
                name="dosage"
                value={med.dosage}
                onChange={(e) => handleMedicineChange(index, e)}
                required
                className="border border-slate-200 rounded-lg p-2 text-sm"
              />
              <input
                placeholder="Freq (e.g. 1-0-1)"
                name="frequency"
                value={med.frequency}
                onChange={(e) => handleMedicineChange(index, e)}
                required
                className="border border-slate-200 rounded-lg p-2 text-sm"
              />
              <select
                name="instructedTime"
                value={med.instructedTime}
                onChange={(e) => handleMedicineChange(index, e)}
                className="border border-slate-200 rounded-lg p-2 text-sm"
              >
                <option value="AFTER_MEAL">After Meal</option>
                <option value="BEFORE_MEAL">Before Meal</option>
                <option value="EMPTY_STOMACH">Empty Stomach</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-(--primary) text-white font-bold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Issue Prescription"}
        </button>
      </div>
    </form>
  );
}

export default PrescriptionForm;