import {
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";
import { formatDateTime } from "../../utils/DateHelper";

/**
 * Pure UI Component
 * Props:
 *  - consentData (array)
 *  - onAction (function)
 */

//Date Decision helper
const getDecisionDate = (item) => {
  switch (item.consentStatus) {
    case "ACCEPTED":
      return item.consentAcceptedAt;

    case "REJECTED":
    case "REVOKED":
      return item.updatedAt;

    case "EXPIRED":
      return item.consentExpiresAt;

    default:
      return item.requestSentAt;
  }
};

function ConsentsUI({ consentData = [], onAction }) {
  const pending = consentData.filter((c) => c.consentStatus === "PENDING");

  const history = consentData.filter((c) => c.consentStatus !== "PENDING");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* 🔷 Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Consent Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage doctor access to your health records
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            {consentData.length} Requests
          </div>
        </div>

        {/* 🔴 Pending Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-[0.2em]">
            <ShieldAlert size={16} />
            Action Required
          </div>

          {pending.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-400 font-medium">
              No Pending Requests
            </div>
          ) : (
            pending.map((req) => (
              <div
                key={req.id}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row justify-between items-center gap-8"
              >
                {/* Doctor Info */}
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center">
                    <User size={26} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {req.doctor?.fullName}
                    </h3>

                    <p className="text-xs font-bold text-purple-600 uppercase mt-1">
                      {req.doctor?.specialization}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 font-semibold">
                      <Clock size={14} />
                      {formatDateTime(req.requestSentAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 w-full lg:w-auto">
                  <button
                    onClick={() => onAction(req.id, "REJECTED")}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-2xl text-xs font-bold uppercase border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => onAction(req.id, "ACCEPTED")}
                    className="flex-1 lg:flex-none px-8 py-3 rounded-2xl text-xs font-bold uppercase bg-purple-700 text-white hover:bg-purple-800 transition-all shadow-md"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🟣 History Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <History size={16} />
            Access History
          </div>

          {history.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-400 font-medium">
              No records found.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                      <User size={20} />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-700">
                        {item.doctor?.fullName}
                      </h4>

                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {item.doctor?.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-slate-300 uppercase">
                        Decision Date
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        {formatDateTime(getDecisionDate(item))}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                          item.consentStatus === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.consentStatus === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : item.consentStatus === "REVOKED"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.consentStatus}
                      </span>

                      {item.consentStatus === "ACCEPTED" && (
                        <button
                          onClick={() => onAction(item.id, "REVOKED")}
                          className="px-4 py-1.5 text-[10px] font-bold uppercase rounded-full border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsentsUI;
