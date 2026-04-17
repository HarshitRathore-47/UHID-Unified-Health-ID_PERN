import { useState } from "react";
import {
  FileUp,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  ClipboardList,
} from "lucide-react";
import doctorService from "../../../../services/doctorServices";

function LabReportForm({ patientId, onClose }) {
  const [mode, setMode] = useState("manual"); // 'manual' or 'upload'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Review State for AI Extraction
  const [reviewData, setReviewData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    testName: "",
    labName: "",
    collectionDate: "",
    remarksNotes: "",
    category: "GENERAL",
    results: [
      {
        parameterName: "",
        value: "",
        unit: "",
        referenceRange: "",
        statusFlag: "Normal",
      },
    ],
  });

  const [file, setFile] = useState(null);

  // --- MANUAL FORM HANDLERS ---
  const handleManualChange = (e) => {
    setManualForm({ ...manualForm, [e.target.name]: e.target.value });
  };

  const handleResultChange = (index, e) => {
    const updatedResults = [...manualForm.results];
    updatedResults[index][e.target.name] = e.target.value;
    setManualForm({ ...manualForm, results: updatedResults });
  };

  const addManualRow = () => {
    setManualForm({
      ...manualForm,
      results: [
        ...manualForm.results,
        {
          parameterName: "",
          value: "",
          unit: "",
          referenceRange: "",
          statusFlag: "Normal",
        },
      ],
    });
  };

  const removeManualRow = (index) => {
    if (manualForm.results.length > 1) {
      setManualForm({
        ...manualForm,
        results: manualForm.results.filter((_, i) => i !== index),
      });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await doctorService.createLabReport(patientId, manualForm);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save manual report");
    } finally {
      setLoading(false);
    }
  };

  // --- AI UPLOAD & EXTRACT ---
  const handleAiUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file first");

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file); // Matching backend 'report' field

      const result = await doctorService.createLabReportAI(patientId, formData);

      // Based on your controller response: { success: true, data: { savedReport: { ... } } }
      if (result && result.savedReport) {
        setReviewData(result.savedReport);
      } else {
        setError("AI extraction failed to return data");
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || err.message || "AI extraction failed");
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFY ACTION ---
  const handleVerify = async () => {
    const reportId = reviewData?.reportId;
    if (!reportId) return setError("Report ID not found");

    setLoading(true);
    try {
      await doctorService.verifyLabReport(reportId);
      onClose();
    } catch (err) {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // --- REJECT ACTION ---
  const handleReject = async () => {
    const reportId = reviewData?.reportId;
    if (!reportId) return setError("Report ID not found");

    if (!rejectionReason) {
      setShowRejectInput(true);
      return;
    }

    setLoading(true);
    try {
      await doctorService.rejectLabReport(reportId, { rejectionReason });
      onClose();
    } catch (err) {
      setError("Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  // --- UI: REVIEW MODE (SCROLLABLE) ---
  if (reviewData) {
    return (
      <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-blue-800">Review AI Data</h2>
          <p className="text-xs text-blue-600">
            Check parameters before saving to records.
          </p>
        </div>

        <div className="space-y-4 px-1">
          <div className="flex justify-between font-bold text-slate-700 text-sm">
            <span>Test: {reviewData.testName}</span>
            <span>Lab: {reviewData.labName}</span>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm bg-white">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3 text-left">Parameter</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviewData.results?.map((res, i) => (
                  <tr key={i}>
                    <td className="p-3 font-medium text-slate-700">
                      {res.parameterName}
                    </td>
                    <td className="p-3 font-bold text-(--primary)">
                      {res.value} {res.unit}
                    </td>
                    <td className="p-3 text-slate-400 text-xs">
                      {res.referenceRange || "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showRejectInput && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-red-500 mb-1 block">
              Rejection Reason
            </label>
            <textarea
              className="w-full p-3 border border-red-200 rounded-xl text-sm focus:ring-1 focus:ring-red-400 outline-none"
              placeholder="e.g. Data extraction is incorrect"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between pt-4 border-t sticky bottom-0 bg-white pb-2">
          <button
            onClick={handleReject}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition"
          >
            <XCircle size={18} />{" "}
            {showRejectInput ? "Confirm Reject" : "Reject"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setReviewData(null)}
              className="px-4 py-2 text-slate-400 font-bold"
            >
              Back
            </button>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-100"
            >
              <CheckCircle size={18} />{" "}
              {loading ? "Saving..." : "Verify & Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UI: INPUT MODES ---
  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-1 scrollbar-hide">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Lab Report Entry</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${mode === "manual" ? "bg-white text-(--primary) shadow-sm" : "text-slate-500"}`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${mode === "upload" ? "bg-white text-(--primary) shadow-sm" : "text-slate-500"}`}
          >
            AI Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {mode === "upload" ? (
        <form onSubmit={handleAiUpload} className="space-y-6">
          <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center bg-slate-50">
            <FileUp size={32} className="text-(--primary) mb-4" />
            <p className="text-sm text-slate-500 mb-4">
              Upload PDF or Image Report
            </p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-(--primary) text-white font-bold shadow-lg shadow-(--primary)/20"
          >
            {loading ? "AI is processing..." : "Upload & Analyze"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Test Name
              </label>
              <input
                name="testName"
                required
                onChange={handleManualChange}
                className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
                placeholder="e.g. CBC / Lipid Profile"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Lab Name
              </label>
              <input
                name="labName"
                required
                onChange={handleManualChange}
                className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
                placeholder="Lab name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Collection Date
              </label>
              <input
                type="date"
                name="collectionDate"
                required
                onChange={handleManualChange}
                className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-(--primary) outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <ClipboardList size={16} /> Parameters
              </h3>
              <button
                type="button"
                onClick={addManualRow}
                className="text-xs font-bold text-(--primary) flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            <div className="space-y-2">
              {manualForm.results.map((res, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-2xl relative animate-in fade-in zoom-in-95"
                >
                  <div className="col-span-4">
                    <input
                      name="parameterName"
                      placeholder="Parameter"
                      onChange={(e) => handleResultChange(idx, e)}
                      className="w-full bg-transparent text-sm border-none focus:ring-0 p-0"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      name="value"
                      placeholder="Value"
                      onChange={(e) => handleResultChange(idx, e)}
                      className="w-full bg-transparent text-sm border-none focus:ring-0 p-0"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      name="unit"
                      placeholder="Unit"
                      onChange={(e) => handleResultChange(idx, e)}
                      className="w-full bg-transparent text-sm border-none focus:ring-0 p-0"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      name="referenceRange"
                      placeholder="Range"
                      onChange={(e) => handleResultChange(idx, e)}
                      className="w-full bg-transparent text-sm border-none focus:ring-0 p-0"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeManualRow(idx)}
                      className="text-slate-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
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
              className="px-8 py-2 rounded-xl bg-(--primary) text-white font-bold shadow-lg shadow-(--primary)/20"
            >
              {loading ? "Saving..." : "Save Report"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default LabReportForm;
