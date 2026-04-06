import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  LogOut,
  Shield,
} from "lucide-react";
import Logo from "../../../assets/sidebar_logo.jpg";
import adminService from "../../../services/adminServices";
import { useState } from "react";

function AdminSidebar() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await adminService.logout();
      localStorage.removeItem("role");
      setShowLogout(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Doctor Verification",
      icon: UserCheck,
      path: "/admin/doctors",
    },
    {
      name: "Audit Logs",
      icon: FileText,
      path: "/admin/audit-logs",
    },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-white border-r border-[#e2e8f0] flex flex-col z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-8 py-8">
        <div className="bg-[#10b981] p-2 rounded-xl shadow-lg shadow-emerald-100">
          <img
            src={Logo}
            alt="UHID Logo"
            className="w-8 h-8 rounded-lg object-cover"
          />
        </div>
        <div>
          <h1 className="text-[#0f172a] font-bold text-base tracking-tight">
            UHID ADMIN
          </h1>
          <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest">
            System Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-[#10b981] text-white shadow-md shadow-emerald-100"
                    : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Security Badge */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 py-3 text-[11px] font-bold text-[#64748b] uppercase tracking-tighter">
          <Shield size={16} className="text-[#10b981]" />
          Secure Admin Access
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-6 border-t border-[#f1f5f9]">
        <button
          onClick={() => setShowLogout(true)}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-[#ef4444] hover:bg-[#fef2f2] transition-all"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm z-100"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white p-8 rounded-4xl w-full max-w-sm text-center shadow-2xl border border-[#e2e8f0]"
            >
              <div className="w-16 h-16 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-[#ef4444]" />
              </div>

              <h3 className="text-[#0f172a] font-bold text-xl mb-2">
                Confirm Logout
              </h3>
              <p className="text-[#64748b] text-sm mb-8 px-4">
                Are you sure you want to exit the admin panel?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#f1f5f9] text-[#0f172a] font-bold text-sm hover:bg-[#e2e8f0] transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#ef4444] text-white font-bold text-sm hover:bg-[#dc2626] transition-shadow shadow-lg shadow-red-100"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

export default AdminSidebar;
