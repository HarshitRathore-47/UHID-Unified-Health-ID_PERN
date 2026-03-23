import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import patientService from "../services/patientService";
import {
  LayoutDashboard,
  ShieldCheck,
  UserRoundPlus,
  Activity,
  Apple,
  Microscope,
  Syringe,
  Tablets,
  CalendarClock,
  LockKeyhole,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import sidebar_logo from "../assets/sidebar_logo.jpg";

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Home" },
  { id: "consents", icon: ShieldCheck, label: "Consents" },
  { id: "health-profile", icon: UserRoundPlus, label: "Health Profile" },
  { id: "treatments", icon: Activity, label: "Treatment" },
  { id: "diets", icon: Apple, label: "Diet" },
  { id: "lab-reports", icon: Microscope, label: "Lab Reports" },
  { id: "vaccinations", icon: Syringe, label: "Vaccinations" },
  { id: "visit-history", icon: CalendarClock, label: "Visit History" },
  { id: "prescriptions", icon: Tablets, label: "Prescriptions" },
  { id: "privacy", icon: LockKeyhole, label: "Privacy & Security" },
];

function MenuItem({ icon: Icon, label, onClick, isActive }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`group relative w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-white text-[#4527a0] shadow-lg"
            : "text-[#ede7f6] hover:bg-white/10"
        }`}
      >
        <Icon
          size={20}
          strokeWidth={2.2}
          className={`transition-all duration-300 ${
            isActive
              ? "text-[#4527a0]"
              : "text-[#d1c4e9] group-hover:text-white"
          }`}
        />

        <span>{label}</span>

        {isActive && (
          <motion.span
            layoutId="activeDot"
            className="ml-auto w-2 h-2 bg-[#4527a0] rounded-full"
          />
        )}
      </button>
    </li>
  );
}

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  const handleNavClick = (viewId) => {
    navigate(`/patient/${viewId === "dashboard" ? "" : viewId}`);
    setOpen(false);
  };
  const handleLogout = async () => {
    try {
      await patientService.logout();

      localStorage.removeItem("role");
      localStorage.removeItem("token"); // if you store it

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
        bg-linear-to-b from-[#5e35b1] to-[#4527a0]
        border-r border-white/10 shadow-2xl
        z-40 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 backdrop-blur-sm border-b border-white/10 scrollbar-none">
          <div className="flex items-center gap-3">
            <img
              src={sidebar_logo}
              alt="logo"
              className="size-10 rounded-full border-2 border-white/20"
            />
            <span className="text-xl font-black tracking-tight bg-linear-to-r from-white to-[#d1c4e9] bg-clip-text text-transparent">
              UHID
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-white/10 transition"
          >
            <PanelLeftClose className="size-5 text-[#d1c4e9] hover:text-white" />
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
                isActive={
                  location.pathname === `/patient/${item.id}` ||
                  (item.id === "dashboard" && location.pathname === "/patient")
                }
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-6 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <button
            onClick={() => setShowLogout(true)}
            className="group w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-[#ede7f6] hover:bg-red-500/20 hover:text-white transition-all duration-300"
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
