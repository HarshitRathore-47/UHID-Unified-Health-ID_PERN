import { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import { useNavigate } from "react-router-dom";
import useTheme from "../../../hooks/useTheme";
import { Eye, UserCheck } from "lucide-react";

function Doctors() {
  useTheme("admin-light");
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const res = await adminService.getPendingDoctors();
      setDoctors(res.data.data);
    } catch (error) {
      console.error("Failed to load doctors", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-(--text-main) tracking-tight flex items-center gap-3">
            <UserCheck className="text-(--primary)" size={32} />
            Doctor Verification
          </h2>
          <p className="text-(--text-muted) text-sm font-bold uppercase tracking-widest mt-1">
            Review and manage professional credentials
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-(--bg-card) border border-(--border) rounded-[2.5rem] overflow-hidden shadow-(--shadow)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-(--bg-main) text-(--text-muted) border-b border-(--border)">
              <tr>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Doctor Details
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  License Number
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Affiliated Hospital
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px] text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-(--bg-main) rounded-full text-(--text-muted)">
                        <UserCheck size={32} />
                      </div>
                      <p className="text-(--text-muted) font-bold uppercase text-xs tracking-widest">
                        No pending verifications
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-(--bg-hover) transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/doctors/${doc.id}`)}
                  >
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-(--text-main) font-bold text-base">
                          {doc.fullName}
                        </span>
                        <span className="text-(--text-muted) text-xs font-medium">
                          {doc.email}
                        </span>
                      </div>
                    </td>

                    <td className="p-6">
                      <span className="bg-(--bg-main) text-(--text-main) px-3 py-1.5 rounded-xl font-mono text-xs border border-(--border) font-bold">
                        {doc.licenseNumber}
                      </span>
                    </td>

                    <td className="p-6 text-(--text-main) font-bold">
                      {doc.hospital}
                    </td>

                    <td className="p-6 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/doctors/${doc.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 bg-white border border-(--border) hover:bg-(--bg-main) text-(--text-main) px-6 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                      >
                        <Eye size={14} className="text-(--primary)" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Doctors;
