import { Search, ChevronDown } from "lucide-react"; // ChevronDown add kiya
import { useState } from "react"; // useState add kiya
import PrescriptionCard from "./PrescriptionCard";

function PrescriptionUI({
  prescriptions = [],
  searchTerm,
  onSearch,
  medicineSystem,
  onSystemChange,
}) {
  // 1. Dropdown open hai ya nahi, uske liye state
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "", label: "All Systems" },
    { value: "ALLOPATHY", label: "Allopathy" },
    { value: "AYURVEDA", label: "Ayurveda" },
    { value: "HOMEOPATHY", label: "Homeopathy" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* SEARCH BLOCK */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search medicines..."
            className="w-full h-12 pl-12 pr-4 text-sm rounded-2xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-600 outline-none transition"
          />
        </div>

        {/* CUSTOM FILTER BLOCK */}
        <div className="relative">
          {/* Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full md:w-48 flex items-center justify-between px-5 py-3 rounded-2xl bg-purple-700 text-white font-semibold border border-purple-700 shadow-sm hover:bg-purple-800 transition focus:outline-none"
          >
            <span>
              {options.find((opt) => opt.value === medicineSystem)?.label || "All Systems"}
            </span>
            <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* 2. Yeh raha "Open" hone wala container jo rounded hoga */}
          {isOpen && (
            <>
              {/* Overlay taaki bahar click karne pe band ho jaye */}
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              
              <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-purple-700 border border-purple-600 shadow-xl rounded-2xl overflow-hidden py-1">
                {options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onSystemChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-5 py-3 text-sm font-semibold cursor-pointer transition
                      ${medicineSystem === option.value ? "bg-purple-800 text-white" : "text-purple-100 hover:bg-purple-600"}
                    `}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* List Block */}
      <div className="space-y-10">
        {prescriptions.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <p className="text-slate-500 font-medium">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {prescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescriptionUI;