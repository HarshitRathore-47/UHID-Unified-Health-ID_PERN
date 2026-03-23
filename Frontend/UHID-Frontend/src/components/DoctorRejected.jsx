import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import doctorService from "../services/doctorServices";

export default function DoctorRejected() {

  useTheme("doctor");

  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      const data = await doctorService.getDoctorStatus();

      if (data.status === "APPROVED") {
        navigate("/doctor");
        return;
      }

      if (data.status === "PENDING") {
        navigate("/doctor/pending");
        return;
      }

      setReason(data.rejectionReason || "No reason provided");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking status...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] p-6">

      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl ring-1 ring-slate-100 p-10 text-center space-y-6">

        <div className="text-4xl">❌</div>

        <h2 className="text-xl font-bold text-slate-800">
          Account Rejected
        </h2>

        <p className="text-sm text-slate-500">
          Your doctor account could not be approved by the administrator.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          <strong>Reason:</strong> {reason}
        </div>

        <div className="flex justify-center gap-4">

          <button
            onClick={() => navigate("/doctor/register")}
            className="px-5 py-2 rounded-xl bg-linear-to-r from-(--primary) to-(--primary-dark) text-white text-sm font-semibold"
          >
            Upload New Documents
          </button>

          <button
            onClick={() => navigate("/doctor/login")}
            className="text-sm text-slate-600 hover:underline"
          >
            Back to Login
          </button>

        </div>

      </div>

    </div>
  );
}