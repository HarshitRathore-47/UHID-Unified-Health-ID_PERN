import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import doctorService from "../../../../services/doctorServices";

function DietForm({ patientId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    dietName: "",
    breakfastItems: [""],
    lunchItems: [""],
    dinnerItems: [""],
    avoidanceRestriction: [""],
    startDate: "",
    endDate: "",
    doctorHospitalName: ""
  });

  // Array fields (Items) ko handle karne ke liye
  const handleArrayChange = (category, index, value) => {
    const updated = [...form[category]];
    updated[index] = value;
    setForm({ ...form, [category]: updated });
  };

  const addRow = (category) => {
    setForm({ ...form, [category]: [...form[category], ""] });
  };

  const removeRow = (category, index) => {
    if (form[category].length > 1) {
      setForm({ ...form, [category]: form[category].filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Filter out empty strings before sending to backend
      const payload = {
        ...form,
        breakfastItems: form.breakfastItems.filter(i => i.trim() !== ""),
        lunchItems: form.lunchItems.filter(i => i.trim() !== ""),
        dinnerItems: form.dinnerItems.filter(i => i.trim() !== ""),
        avoidanceRestriction: form.avoidanceRestriction.filter(i => i.trim() !== ""),
      };

      await doctorService.createDiet(patientId, payload);
      onClose();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || err.message || "Failed to add diet plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Create Diet Plan</h2>
        <p className="text-xs text-slate-500">Define daily meals and restrictions.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* Main Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Plan Name</label>
          <input 
            required 
            name="dietName" 
            value={form.dietName}
            onChange={(e) => setForm({...form, dietName: e.target.value})} 
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
            placeholder="e.g. Diabetic Friendly Diet" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Start Date</label>
          <input 
            type="date" 
            required 
            value={form.startDate}
            onChange={(e) => setForm({...form, startDate: e.target.value})} 
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">End Date (Optional)</label>
          <input 
            type="date" 
            value={form.endDate}
            onChange={(e) => setForm({...form, endDate: e.target.value})} 
            className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none" 
          />
        </div>
      </div>

      {/* Dynamic Meal Sections */}
      {[
        { key: 'breakfastItems', label: 'Breakfast' },
        { key: 'lunchItems', label: 'Lunch' },
        { key: 'dinnerItems', label: 'Dinner' },
        { key: 'avoidanceRestriction', label: 'Restrictions / Avoid' }
      ].map((section) => (
        <div key={section.key} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{section.label}</label>
            <button 
              type="button" 
              onClick={() => addRow(section.key)} 
              className="text-(--primary) text-[10px] font-bold hover:underline"
            >
              + ADD ITEM
            </button>
          </div>
          <div className="space-y-2">
            {form[section.key].map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  value={item} 
                  onChange={(e) => handleArrayChange(section.key, idx, e.target.value)} 
                  className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-(--primary) outline-none bg-white" 
                  placeholder={`Enter ${section.label.toLowerCase()} item`} 
                />
                <button 
                  type="button" 
                  onClick={() => removeRow(section.key, idx)} 
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="px-10 py-2.5 rounded-xl bg-(--primary) text-white font-bold shadow-lg shadow-(--primary)/20 hover:opacity-95 transition"
        >
          {loading ? "Creating..." : "Save Diet Plan"}
        </button>
      </div>
    </form>
  );
}

export default DietForm;