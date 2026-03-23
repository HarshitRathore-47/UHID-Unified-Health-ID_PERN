import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import doctorService from "../services/doctorServices";

export default function DoctorPending() {
  useTheme("doctor");

  const navigate = useNavigate();

  const checkStatus = async () => {
    try {
      const data = await doctorService.getDoctorStatus();

      if (data.status === "APPROVED") {
        navigate("/doctor");
        return;
      }

      if (data.status === "REJECTED") {
        navigate("/doctor/rejected");
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleLogout = async () => {
    await doctorService.logout();
    localStorage.removeItem("role");
    navigate("/doctor/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl ring-1 ring-slate-100 p-10 text-center space-y-6">
        <div className="text-4xl">⏳</div>

        <h2 className="text-xl font-bold text-slate-800">
          Account Under Review
        </h2>

        <p className="text-sm text-slate-500">
          Your doctor account is currently being verified by the administrator.
          Once approved, you will be able to access the doctor portal.
        </p>

        <div className="bg-(--primary)/10 border border-(--primary)/20 rounded-xl p-4 text-(--primary) text-xs">
          Verification usually takes a short time. Please check back later.
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={checkStatus}
            className="px-5 py-2 rounded-xl bg-linear-to-r from-(--primary) to-(--primary-dark) text-white text-sm font-semibold"
          >
            Check Status
          </button>

          <button
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
