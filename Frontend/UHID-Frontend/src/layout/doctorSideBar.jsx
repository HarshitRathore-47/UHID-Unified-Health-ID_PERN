import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import doctorService from "../services/doctorServices";
import useTheme from "../hooks/useTheme";
import { UserCircle } from "lucide-react";

import {
  LayoutDashboard,
  ShieldCheck,
  BellRing,
  LogOut,
  PanelLeftClose,
} from "lucide-react";

import sidebar_logo from "../assets/sidebar_logo_doctor.jpg";

const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/doctor",
  },
  {
    id: "consents",
    icon: ShieldCheck,
    label: "Active Consents",
    path: "/doctor/consents",
  },
  {
    id: "profile",
    icon: UserCircle,
    label: "My Profile",
    path: "/doctor/profile",
  },
];

function MenuItem({ icon: Icon, label, onClick, isActive }) {
  useTheme("doctor");
  return (
    <li>
      <button
        onClick={onClick}
        className={`group relative w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-white text-(--primary-dark) shadow-lg"
            : "text-sky-100 hover:bg-white/10"
        }`}
      >
        <Icon
          size={20}
          strokeWidth={2.2}
          className={`transition-all duration-300 ${
            isActive
              ? "text-(--primary-dark)"
              : "text-sky-200 group-hover:text-white"
          }`}
        />

        <span>{label}</span>

        {isActive && (
          <motion.span
            layoutId="activeDot"
            className="ml-auto w-2 h-2 bg-(--primary-dark) rounded-full"
          />
        )}
      </button>
    </li>
  );
}

export default function DoctorSidebar({ open, setOpen }) {
  useTheme("doctor");
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");

    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  const handleNavClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setOpen(false);
    } // Mobile view mein click karte hi band ho jaye
  };

  const handleLogout = async () => {
    try {
      await doctorService.logout();

      localStorage.removeItem("role");
      localStorage.removeItem("token");

      setShowLogout(false);

      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: open ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-0 left-0 h-screen w-72 
        bg-linear-to-b from-(--primary) to-(--primary-dark)
        border-r border-white/10 shadow-2xl
        z-40 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={sidebar_logo}
              alt="logo"
              className="size-10 rounded-full border-2 border-white/20"
            />
            <span className="text-xl font-black tracking-tight bg-linear-to-r from-white to-sky-200 bg-clip-text text-transparent">
              UHID
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-white/10 transition"
          >
            <PanelLeftClose className="size-5 text-sky-200 hover:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 py-6 overflow-y-auto">
          <ul className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path} // ✅ Exact match for better UX
                onClick={() => handleNavClick(item.path)}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-6 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <button
            onClick={() => setShowLogout(true)}
            className="group w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-sky-100 hover:bg-red-500/20 hover:text-white transition-all duration-300"
          >
            <LogOut
              size={20}
              strokeWidth={2.2}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-80 text-center space-y-5"
            >
              <h3 className="font-black text-lg text-slate-800">
                Confirm Logout
              </h3>

              <p className="text-sm text-slate-500">
                Are you sure you want to logout?
              </p>

              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={() => setShowLogout(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
