import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Microscope,
  Download,
  X,
  FileUp,
  TrendingUp,
  Activity,
  Calendar,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Printer,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

function LabReports() {
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrendOpen, setIsTrendOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample comparison data
  const trendData = [
    { period: "Jan 2025", hemoglobin: 12.1, sugar: 98, bp: 115 },
    { period: "May 2025", hemoglobin: 12.8, sugar: 110, bp: 128 },
    { period: "Jan 2026", hemoglobin: 14.2, sugar: 92, bp: 120 },
  ];

  const initialFormState = {
    testName: "",
    diseaseReason: "",
    labName: "",
    reportDate: "",
    results: [
      { parameter: "", value: "", unit: "", range: "", flag: "Normal" },
    ],
    comments: "",
    reportFile: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- Logic ---
  const handleTableChange = (index, field, value) => {
    const updatedResults = [...formData.results];
    updatedResults[index][field] = value;
    setFormData({ ...formData, results: updatedResults });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      results: [
        ...formData.results,
        { parameter: "", value: "", unit: "", range: "", flag: "Normal" },
      ],
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setReports([{ ...formData, id: Date.now() }, ...reports]);
    setFormData(initialFormState);
    setIsModalOpen(false);
  };

  const getFlagStyles = (flag) => {
    switch (flag) {
      case "High":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* 1. SEARCH & ADD BAR (Same as Prescription) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div className="relative w-full md:flex-grow">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#4a148c] text-sm shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-44 flex items-center justify-center gap-2 py-3 bg-[#4a148c] text-white rounded-xl font-bold hover:bg-[#6a1b9a] transition-all active:scale-9 shadow-lg"
        >
          <Plus size={20} /> <span>Add Report</span>
        </button>
      </div>

      {/* 2. REPORTS LIST */}
      <div className="grid grid-cols-1 gap-5">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center hover:border-[#4a148c]/30 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#ede7f6] text-[#4a148c] rounded-2xl flex items-center justify-center">
                  <Microscope size={24} />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-lg leading-none">
                    {report.testName}
                  </h3>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
                    Disease: {report.diseaseReason}
                  </p>
                  <div className="flex gap-4 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Activity size={14} /> {report.labName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {report.reportDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button
                  onClick={() => setIsTrendOpen(true)}
                  className="p-4 bg-slate-50 text-[#4a148c] rounded-2xl hover:bg-purple-100 transition-all shadow-sm"
                >
                  <TrendingUp size={24} />
                </button>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-8 py-4 bg-[#4527a0] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg"
                >
                  View Report <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <Microscope className="mx-auto text-slate-300 mb-2" size={40} />
            <h3 className="text-slate-500 font-medium">
              {" "}
              No Lab Reports . Click 'Add Reports' to add Reports
            </h3>
          </div>
        )}
      </div>

      {/* 3. LARGE TREND ANALYTICS MODAL */}
      <AnimatePresence>
        {isTrendOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-7xl h-[92vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border-4 border-white"
            >
              <div className="bg-[#311b92] p-10 text-white flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/10 rounded-3xl border border-white/20">
                    <BarChart3 size={36} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      Health Analytics Hub
                    </h2>
                    <p className="text-[#b39ddb] text-sm font-bold uppercase tracking-[0.2em]">
                      Data Sync: 2025 - 2026
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTrendOpen(false)}
                  className="md:hidden"
                >
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50/50">
                {/* Recharts Implementation */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-black text-slate-400 uppercase mb-8 tracking-widest flex items-center gap-2">
                    <Activity size={18} className="text-purple-600" />{" "}
                    Hemoglobin Analysis
                  </h4>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient
                            id="colorHb"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#4a148c"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#4a148c"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="period"
                          axisLine={false}
                          tick={{ fill: "#94a3b8", fontWeight: "bold" }}
                        />
                        <YAxis
                          axisLine={false}
                          tick={{ fill: "#94a3b8", fontWeight: "bold" }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "20px",
                            border: "none",
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="hemoglobin"
                          stroke="#4a148c"
                          strokeWidth={4}
                          fill="url(#colorHb)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CLINICAL ENTRY MODAL (Same UI as Prescription) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute  top-12 right-85 md:block text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              {/* from here the pop starts starts */}
              <div className="flex p-8 border-r border-slate-100 overflow-y-auto">
                <div className="flex justify-between items-center ">
                  <h2 className="text-2xl font-black text-[#4a148c]">
                    New Lab Entry
                  </h2>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="flex-1 overflow-y-auto p-10 space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Target Disease / Clinical Reason
                    </label>
                    <input
                      required
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none font-bold text-red-600 text-xl placeholder:text-slate-200"
                      placeholder="e.g. Chronic Anemia"
                      value={formData.diseaseReason}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diseaseReason: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Test Panel Name
                    </label>
                    <input
                      required
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none font-bold text-slate-700"
                      value={formData.testName}
                      onChange={(e) =>
                        setFormData({ ...formData, testName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Report Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border-b-2 border-slate-100 focus:border-[#4a148c] outline-none font-bold text-slate-700"
                      value={formData.reportDate}
                      onChange={(e) =>
                        setFormData({ ...formData, reportDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ">
                      Test Findings (Structured)
                    </label>
                    <button
                      type="button"
                      onClick={addRow}
                      className="col-span-2 mt-4 flex items-center justify-center gap-2 p-3 bg-purple-50 text-[#4a148c] border-2 border-dashed border-[#4a148c]/30 rounded-xl font-bold hover:bg-purple-100 transition-all "
                    >
                      <Plus size={20} /> Add Row
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.results.map((res, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-5 gap-4 bg-slate-50 p-5 rounded-[1.5rem] items-end shadow-sm border border-slate-100"
                      >
                        <input
                          placeholder="Parameter"
                          className="bg-transparent border-b border-slate-200 outline-none text-sm font-bold text-slate-700"
                          value={res.parameter}
                          onChange={(e) =>
                            handleTableChange(
                              index,
                              "parameter",
                              e.target.value
                            )
                          }
                        />
                        <input
                          placeholder="Value"
                          className="bg-transparent border-b border-slate-200 outline-none text-sm font-black text-[#4a148c]"
                          value={res.value}
                          onChange={(e) =>
                            handleTableChange(index, "value", e.target.value)
                          }
                        />
                        <input
                          placeholder="Range"
                          className="bg-transparent border-b border-slate-200 outline-none text-[10px] font-bold  text-slate-700"
                          value={res.range}
                          onChange={(e) =>
                            handleTableChange(index, "range", e.target.value)
                          }
                        />
                        <select
                          className={`col-span-2 w-full p-2 rounded-xl font-black text-[10px] border uppercase tracking-widest ${getFlagStyles(
                            res.flag
                          )}`}
                          value={res.flag}
                          onChange={(e) =>
                            handleTableChange(index, "flag", e.target.value)
                          }
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High (H)</option>
                          <option value="Low">Low (L)</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reportFile: e.target.files[0],
                      })
                    }
                  />
                  <FileUp
                    className="text-slate-200 group-hover:text-[#4a148c] mb-3 transition-colors"
                    size={56}
                  />
                  <p className="text-slate-300 uppercase tracking-widest group-hover:text-[#4a148c]">
                    Quick Upload PDF / Scan
                  </p>
                  {formData.reportFile && (
                    <p className="text-xs font-bold text-[#4a148c] mt-2 bg-white px-4 py-1 rounded-full shadow-sm">
                      {formData.reportFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-[#311b92] text-white rounded-2xl font-bold text-xl shadow-2xl hover:bg-[#4527a0] transition-all transform active:scale-[0.98]"
                >
                  Save Clinical Records
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. REPORT VIEWER (Same Bold Style) */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border-8 border-white"
            >
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-12 right-12 p-4 bg-white/10 rounded-3xl hover:bg-red-500 transition-all"
              >
                <X size={32} />
              </button>
              <div className="bg-[#4a148c] p-12 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black uppercase leading-tight tracking-tighter">
                    {selectedReport.testName}
                  </h2>
                  <p className="text-purple-300 font-bold uppercase text-xs tracking-[0.3em] mt-2">
                    {selectedReport.labName} • {selectedReport.reportDate}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12">
                <div className="bg-red-50 border-l-[12px] border-red-500 p-8 rounded-3xl shadow-sm">
                  <p className="text-[10px] font-black uppercase text-red-400 tracking-[0.3em] mb-2">
                    Targeted Disease
                  </p>
                  <p className="text-3xl font-black text-red-700 uppercase">
                    {selectedReport.diseaseReason}
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">
                    Structured Data
                  </h4>
                  <div className="overflow-hidden rounded-[2.5rem] border-2 border-slate-50 shadow-lg">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="p-6">Test Parameter</th>
                          <th className="p-6">Finding</th>
                          <th className="p-6">Range</th>
                          <th className="p-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReport.results.map((res, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-6 font-bold text-slate-800">
                              {res.parameter}
                            </td>
                            <td className="p-6 font-black text-[#4a148c] text-2xl">
                              {res.value}{" "}
                              <span className="text-xs text-slate-300 ml-1">
                                {res.unit}
                              </span>
                            </td>
                            <td className="p-6 text-slate-400 font-black text-xs">
                              {res.range}
                            </td>
                            <td className="p-6">
                              <span
                                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${getFlagStyles(
                                  res.flag
                                )}`}
                              >
                                {res.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LabReports;
