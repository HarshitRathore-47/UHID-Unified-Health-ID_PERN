import { useState } from "react";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import doctorService from "../../../services/doctorServices";
import useTheme from "../../../hooks/useTheme";
import useResource from "../../../hooks/useResource";
import { useNavigate } from "react-router-dom";

function SearchPatient() {
  useTheme("doctor");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uhid, setUhid] = useState("");

  // ✅ useResource call with polling (Polling logic is inside the hook now)
  const {
    data: patients,
    loading,
    error,
    reload,
  } = useResource(
    () => doctorService.searchPatientByUHID(uhid),
    "patientSearch",
    uhid,
  );

  const [sending, setSending] = useState(false);

  const handleRequestAccess = async (patientId) => {
    try {
      setSending(true);
      const res = await doctorService.sendConsentRequest(patientId);

      if (res) {
        // ✅ Invalidate multiple keys to sync global state
        queryClient.invalidateQueries({ queryKey: ["activeConsents"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        queryClient.invalidateQueries({ queryKey: ["patientSearch", uhid] });
      }
    } catch (err) {
      alert(err.message || "Request failed");
    } finally {
      setSending(false);
    }
  };

  const patientList = patients || [];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Search Patient</h2>
        <p className="text-sm text-slate-500">
          Enter UHID to request access to patient records
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter UHID"
          value={uhid}
          onChange={(e) => setUhid(e.target.value.toUpperCase())}
          maxLength={12}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-(--primary)"
        />
        {/* reload(uhid) will trigger a fresh fetch via React Query */}
        <button
          onClick={() => reload(uhid)}
          className="bg-(--primary) text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Search size={16} /> Search
        </button>
      </div>

      {loading && (
        <p className="text-sm text-slate-500 italic animate-pulse">
          Searching...
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {patientList.length > 0 && (
        <div className="space-y-3">
          {patientList.map((patient) => (
            <div
              key={patient.id}
              className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {patient.fullName}
                </p>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter italic">
                  UHID: {patient.uhid}
                </p>
              </div>

              {/* Status Logic - Polling will auto-update these */}
              {/* Status based Buttons - Optimized UI/UX */}
              <div className="flex items-center gap-2">
                {/* Case 1: No Access / Expired / Revoked / Rejected -> Show Primary Request Button */}
                {["NONE", "EXPIRED", "REVOKED", "REJECTED"].includes(
                  patient.consentStatus,
                ) && (
                  <button
                    onClick={() => handleRequestAccess(patient.id)}
                    disabled={sending}
                    className="bg-(--primary) hover:bg-(--primary-dark) text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-(--primary)/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    {sending ? "Sending..." : "Request Access"}
                    {patient.consentStatus === "REJECTED" && (
                      <span className="text-[10px] opacity-70">(Retry)</span>
                    )}
                  </button>
                )}

                {/* Case 2: Pending Request -> Show Warning/Pending State */}
                {patient.consentStatus === "PENDING" && (
                  <div className="flex flex-col items-end">
                    <button
                      disabled
                      className="bg-amber-100 text-amber-700 px-6 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed border border-amber-200"
                    >
                      Request Sent
                    </button>
                    <p className="text-[10px] text-amber-500 mt-1 font-medium italic">
                      Waiting for patient approval
                    </p>
                  </div>
                )}

                {/* Case 3: Accepted -> Show Success/Action Button */}
                {patient.consentStatus === "ACCEPTED" && (
                  <button
                    onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                  >
                    View Records
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPatient;
