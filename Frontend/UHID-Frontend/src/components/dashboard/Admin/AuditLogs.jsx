import { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import useTheme from "../../../hooks/useTheme";
import {
  History,
  ShieldCheck,
  UserMinus,
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

function AuditLogs() {
  useTheme("admin-light");
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page,
        limit: 10,
        action: actionFilter,
      });
      setLogs(res.record || []);
      setPagination(res.pagination || {});
    } catch (error) {
      console.error("Failed to load audit logs", error);
    } finally {
      setLoading(false);
    }
  }

  const getActionStyle = (action) => {
    if (action.includes("APPROVE"))
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (action.includes("REJECT"))
      return "bg-red-50 text-red-600 border-red-100";
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-(--text-main) tracking-tight flex items-center gap-3">
            <History className="text-(--primary)" size={32} />
            System Audit Logs
          </h2>
          <p className="text-(--text-muted) text-sm font-bold uppercase tracking-widest mt-1">
            Immutable trail of administrative actions
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Activity
              className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)"
              size={16}
            />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="pl-12 pr-8 py-3 bg-white border border-(--border) rounded-2xl text-(--text-main) font-bold text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-(--ring) appearance-none cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="APPROVE_DOCTOR">Approvals</option>
              <option value="REJECT_DOCTOR">Rejections</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-(--bg-card) border border-(--border) rounded-[2.5rem] overflow-hidden shadow-(--shadow)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-(--bg-main) text-(--text-muted) border-b border-(--border)">
              <tr>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Timestamp
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Admin ID
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Action
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Target Entity
                </th>
                <th className="p-6 font-bold uppercase tracking-wider text-[10px]">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary) mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <p className="text-(--text-muted) font-bold uppercase text-xs tracking-widest">
                      No activity logs found
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-(--bg-hover) transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-(--text-main) font-bold">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-(--text-muted) text-[10px] font-bold">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-(--text-muted)">
                      {log.actorId.slice(-8)}...
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getActionStyle(log.action)}`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-6 font-mono text-xs text-(--text-main) font-bold">
                      {log.targetId.slice(-8)}...
                    </td>
                    <td className="p-6">
                      <p className="text-(--text-muted) text-xs italic">
                        {log.meta?.reason
                          ? `"${log.meta.reason.slice(0, 30)}..."`
                          : "No extra metadata"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-6 bg-(--bg-main)/50 border-t border-(--border) flex items-center justify-between">
          <p className="text-(--text-muted) text-[10px] font-bold uppercase tracking-widest">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 bg-white border border-(--border) rounded-xl disabled:opacity-30 hover:text-(--primary) transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-white border border-(--border) rounded-xl disabled:opacity-30 hover:text-(--primary) transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
