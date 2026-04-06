import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../../services/adminServices";
import useTheme from "../../../hooks/useTheme";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";

function DoctorDetails() {
  useTheme("admin-light");
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | null
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchDetails();
  }, [id]);

  async function fetchDetails() {
    try {
      const res = await adminService.getDoctorDetails(id);
      setDoctor(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction() {
    try {
      if (modalType === "approve") {
        await adminService.approveDoctor(id);
      } else {
        if (reason.length < 5) return;
        await adminService.rejectDoctor(id, reason);
      }
      setModalType(null);
      navigate("/admin/doctors");
    } catch (error) {
      console.error(error);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
      </div>
    );

  return (
    <div className="space-y-8 pb-12 relative">
      <button
        onClick={() => navigate("/admin/doctors")}
        className="flex items-center gap-2 text-(--text-muted) hover:text-(--primary) font-bold text-sm transition-colors"
      >
        <ArrowLeft size={18} /> Back to Queue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-(--bg-card) border border-(--border) rounded-[2.5rem] p-8 shadow-(--shadow) text-center">
            <div className="w-24 h-24 bg-(--bg-main) text-(--primary) rounded-full flex items-center justify-center mx-auto mb-4 border border-(--border)">
              <User size={48} />
            </div>
            <h2 className="text-2xl font-extrabold text-(--text-main) tracking-tight">
              {doctor.fullName}
            </h2>
            <p className="text-(--primary) text-xs font-bold uppercase tracking-widest mt-1">
              {doctor.specialization}
            </p>

            <div className="mt-8 pt-6 border-t border-(--border) space-y-4 text-left">
              <div className="flex items-center gap-3 text-(--text-muted) text-sm font-bold truncate">
                <Mail size={16} className="text-(--primary)" /> {doctor.email}
              </div>
              <div className="flex items-center gap-3 text-(--text-muted) text-sm font-bold">
                <Phone size={16} className="text-(--primary)" /> {doctor.phone}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={() => setModalType("approve")}
                className="w-full bg-(--primary) hover:bg-(--primary-dark) text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
              >
                Approve Profile
              </button>
              <button
                onClick={() => setModalType("reject")}
                className="w-full bg-white border border-red-100 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-50 transition-all active:scale-95"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-(--bg-card) border border-(--border) rounded-[2.5rem] p-10 shadow-(--shadow)">
            <h3 className="text-xl font-extrabold text-(--text-main) mb-8 flex items-center gap-3">
              <Briefcase className="text-(--primary)" /> Experience & License
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StatItem
                label="License Number"
                value={doctor.licenseNumber}
                isMono
              />
              <StatItem
                label="Experience"
                value={`${doctor.experience} Years`}
              />
              <StatItem label="Qualification" value={doctor.qualification} />
              <StatItem label="Hospital" value={doctor.hospital} />
            </div>
          </div>

          <div className="bg-(--bg-card) border border-(--border) rounded-[2.5rem] p-10 shadow-(--shadow)">
            <h3 className="text-xl font-extrabold text-(--text-main) mb-6 flex items-center gap-3">
              <FileText className="text-(--primary)" /> Documents
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {doctor.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-5 bg-(--bg-main) border border-(--border) rounded-2xl hover:border-(--primary) transition-all"
                >
                  <span className="text-sm font-bold text-(--text-main) uppercase">
                    {doc.type.replace("_", " ")}
                  </span>
                  <button
                    onClick={async () => {
                      const res = await adminService.getDoctorDocument(doc.id);
                      window.open(res.url, "_blank");
                    }}
                    className="bg-white border border-(--border) text-(--text-main) px-5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-(--primary) hover:text-white transition-all"
                  >
                    View PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION MODAL (APPROVE / REJECT) */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div
              className={`flex items-center gap-3 mb-6 ${modalType === "approve" ? "text-emerald-500" : "text-red-500"}`}
            >
              {modalType === "approve" ? (
                <CheckCircle size={28} />
              ) : (
                <AlertTriangle size={28} />
              )}
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                {modalType === "approve"
                  ? "Confirm Approval"
                  : "Rejection Reason"}
              </h3>
            </div>

            <p className="text-slate-500 text-sm mb-6 font-medium">
              {modalType === "approve"
                ? `Are you sure you want to verify Dr. ${doctor.fullName}? This will grant them full access to the platform.`
                : "Please specify why this application is being rejected. The doctor will receive this feedback via email."}
            </p>

            {modalType === "reject" && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Minimum 5 characters required..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all text-slate-700 font-medium resize-none mb-4"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalType(null);
                  setReason("");
                }}
                className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={modalType === "reject" && reason.length < 5}
                className={`flex-1 text-white font-bold py-3 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 
                  ${modalType === "approve" ? "bg-emerald-500 shadow-emerald-100 hover:bg-emerald-600" : "bg-red-500 shadow-red-100 hover:bg-red-600"}`}
              >
                {modalType === "approve" ? "Verify Doctor" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, isMono }) {
  return (
    <div className="space-y-1">
      <p className="text-(--text-muted) text-[10px] font-black uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`text-(--text-main) font-bold text-sm ${isMono ? "font-mono bg-(--bg-main) px-2 py-0.5 rounded border border-(--border) inline-block" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export default DoctorDetails;
