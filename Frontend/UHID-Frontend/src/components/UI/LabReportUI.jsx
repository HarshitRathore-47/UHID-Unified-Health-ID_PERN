import { motion, AnimatePresence } from "framer-motion";
import { Search, Microscope, X, Calendar, ChevronRight } from "lucide-react";
import { formatDateTime } from "../../utils/DateHelper";
import { useEffect } from "react";

function LabReportsUI({
  reports = [],
  searchTerm,
  onSearch,
  onView,
  selectedReport,
  onClose,
}) {
  // ESC close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    if (selectedReport) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedReport]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* 🔷 Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Lab Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage your diagnostic reports
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            {reports.length} Records
          </div>
        </div>

        {/* 🔍 SEARCH */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-12 pl-14 pr-4 rounded-2xl border border-slate-300 bg-white
                     focus:ring-2 focus:ring-purple-600 focus:border-purple-600
                     outline-none transition"
          />
        </div>

        {/* 📋 LIST */}
        {reports.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
            <div className="bg-purple-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
              <Microscope className="text-purple-600" size={28} />
            </div>
            <p className="text-slate-500 font-medium">No Lab Reports Found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.reportId}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Microscope size={22} className="text-purple-700" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {report.testName}
                    </h3>

                    <p className="text-sm text-slate-500">{report.category}</p>

                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <Calendar size={14} />
                      {formatDateTime(report.reportDateTime)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onView(report.reportId)}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition shadow-sm"
                >
                  View <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 📄 DETAIL MODAL */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
            >
              <div className="min-h-screen flex items-start justify-center py-20 px-4">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl"
                >
                  {/* Modal Header */}
                  <div className="px-10 py-8 border-b border-slate-100 relative">
                    <button
                      onClick={onClose}
                      className="absolute right-6 top-6 text-slate-400 hover:text-black"
                    >
                      <X size={22} />
                    </button>

                    <h2 className="text-2xl font-black text-slate-800">
                      {selectedReport.reportInfo.testName}
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                      {selectedReport.reportInfo.labName} •{" "}
                      {formatDateTime(selectedReport.reportInfo.reportDateTime)}
                    </p>
                  </div>

                  {/* Results Table */}
                  <div className="p-8 max-h-[65vh] overflow-y-auto">
                    <div className="overflow-x-auto w-full border border-slate-100 rounded-xl">
                      <table className="w-full text-sm min-w-[600px] ">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr className="text-left text-slate-600">
                            <th className="p-4">Parameter</th>
                            <th className="p-4">Value</th>
                            <th className="p-4">Range</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedReport.results?.map((res) => (
                            <tr
                              key={res.id}
                              className="border-t hover:bg-slate-50 transition"
                            >
                              <td className="p-4 font-medium text-slate-800">
                                {res.parameterName}
                              </td>

                              <td className="p-4">
                                {res.value} {res.unit}
                              </td>

                              <td className="p-4 text-slate-500">
                                {res.referenceRange}
                              </td>

                              <td>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    res.statusFlag === "High"
                                      ? "bg-red-50 text-red-700"
                                      : res.statusFlag === "Low"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {res.statusFlag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LabReportsUI;
