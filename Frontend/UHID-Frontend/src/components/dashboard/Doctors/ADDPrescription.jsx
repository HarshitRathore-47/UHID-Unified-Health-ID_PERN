import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Pill,
  Clock,
  Utensils,
  X,
  Trash2,
  AlertTriangle,
  Calendar,
  ListPlus,
  CheckCircle2,
} from "lucide-react";

function PrescriptionManager({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- MULTI-ADD LOGIC ---
  const [draftList, setDraftList] = useState([]); // Temporary list inside modal
  const initialFormState = {
    name: "",
    brand: "",
    dosage: "",
    frequency: "Twice a day",
    instruction: "After Eating",
    timing: "Morning & Night",
    type: "General",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Add medicine to the temporary draft list
  const addToDraft = () => {
    if (!formData.name || !formData.dosage)
      return alert("Please fill medicine name and dosage");
    const newDraftEntry = { ...formData, id: Date.now() };
    setDraftList([...draftList, newDraftEntry]);
    setFormData(initialFormState); // Reset form for next medicine
  };

  // Remove medicine from draft before final saving
  const removeFromDraft = (id) => {
    setDraftList(draftList.filter((item) => item.id !== id));
  };

  // Final Save: Push everything from draft to main records
  const saveAllToRecords = () => {
    const finalEntries = draftList.map((item) => ({
      ...item,
      date: new Date().toLocaleDateString(),
    }));
    setPrescriptions([...finalEntries, ...prescriptions]);
    setDraftList([]);
    setIsAddModalOpen(false);
  };

  // --- DELETE LOGIC ---
  const confirmDelete = () => {
    setPrescriptions(prescriptions.filter((x) => x.id !== itemToDelete));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredMeds = prescriptions.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full space-y-6">
      {/* SEARCH AND ADD BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative grow w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search prescriptions..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#4a148c] text-sm shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-44 flex items-center justify-center gap-2 py-3 bg-[#4a148c] text-white rounded-xl font-bold hover:bg-[#6a1b9a] transition-all shadow-lg"
        >
          <Plus size={20} /> New Session
        </button>
      </div>

      {/* MAIN MEDICINE LIST */}
      <div className="space-y-4">
        {filteredMeds.length > 0 ? (
          filteredMeds.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-[#4a148c]/30"
            >
              <div className="flex gap-4 flex-1">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-[#4a148c] shrink-0">
                  <Pill size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-none">
                      {p.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                      {p.brand}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        p.type === "Chronic"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      }`}
                    >
                      {p.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-[#4a148c]" /> {p.timing}
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils size={14} className="text-[#4a148c]" />{" "}
                      {p.instruction}
                    </span>
                    <span className="bg-purple-100 text-[#4a148c] px-2 py-0.5 rounded text-[10px] font-bold">
                      {p.dosage}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setItemToDelete(p.id);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 text-slate-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <Calendar className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-500 font-medium">
              No records. Click 'New Session' to add medicines.
            </p>
          </div>
        )}
      </div>

      {/* --- ADD MULTIPLE MEDICINES MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto"
            >
              {/* LEFT: FORM INPUT - EXACTLY YOUR FIELDS */}
              <div className="flex-1 p-8 border-r border-slate-100 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-[#4a148c]">
                    Add Medication
                  </h2>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setDraftList([]);
                    }}
                    className="md:hidden"
                  >
                    <X />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none font-bold"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Brand
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="500mg"
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Timing
                    </label>
                    <select
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none bg-white"
                      value={formData.timing}
                      onChange={(e) =>
                        setFormData({ ...formData, timing: e.target.value })
                      }
                    >
                      <option>Morning & Night</option>
                      <option>Morning Only</option>
                      <option>Night Only</option>
                      <option>Morning, Afternoon, Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Treatment Type
                    </label>
                    <select
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none bg-white"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="General">General</option>
                      <option value="Chronic">Chronic</option>
                      <option value="Acute">Acute</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={addToDraft}
                    className="col-span-2 mt-4 flex items-center justify-center gap-2 py-3 bg-purple-50 text-[#4a148c] border-2 border-dashed border-[#4a148c]/30 rounded-xl font-bold hover:bg-purple-100 transition-all"
                  >
                    <ListPlus size={20} /> Add Next Medicine
                  </button>
                </div>
              </div>

              {/* RIGHT: DRAFT PREVIEW LIST - EXACTLY YOUR FIELDS */}
              <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col border-t md:border-t-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-700">
                    Draft List ({draftList.length})
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setDraftList([]);
                    }}
                    className="hidden md:block text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-grow space-y-3 overflow-y-auto mb-4 max-h-[300px] md:max-h-full">
                  <AnimatePresence>
                    {draftList.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ x: 10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -10, opacity: 0 }}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {item.dosage} • {item.timing}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromDraft(item.id)}
                          className="text-slate-300 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {draftList.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center mt-10">
                      No medicines added yet
                    </p>
                  )}
                </div>

                <button
                  disabled={draftList.length === 0}
                  onClick={saveAllToRecords}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                    draftList.length > 0
                      ? "bg-[#4a148c] text-white hover:bg-[#311b92]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={20} /> Save All Records
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Are you sure?</h2>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionManager;
