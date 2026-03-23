import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BellRing, PanelLeftOpen, CheckCheck, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import useTheme from "../hooks/useTheme";
import useResource from "../hooks/useResource";
import doctorService from "../services/doctorServices";
import { formatDate } from "../utils/DateHelper";
import MainLogo from "../assets/mainlogo_doctor.jpg";

function DoctorNavbar({ setOpen }) {
  useTheme("doctor-light");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // ✅ For Button UX Feedback

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/doctor") return "Dashboard";
    if (path === "/doctor/consents") return "Active Consents";
    if (path === "/doctor/profile") return "Doctor Profile";
    if (path.includes("/doctor/patient/")) return "Patient Records";
    return "Doctor Portal";
  };

  // ✅ Reactive Data fetching
  const { data: unreadData } = useResource(doctorService.getUnreadCount, "unreadCount");
  const unreadCount = unreadData?.count || 0;

  const { data: notifications = [], reload: refreshNotifications } = 
    useResource(doctorService.getNotifications, "doctorNotifications");

  // Sync Global State Helper
  const syncNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    queryClient.invalidateQueries({ queryKey: ["doctorNotifications"] });
  };

  const handleMarkAllRead = async () => {
    setIsProcessing(true);
    try {
      await doctorService.markAllRead();
      syncNotifications();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearRead = async () => {
    setIsProcessing(true);
    try {
      await doctorService.clearRead();
      syncNotifications();
      setShowClearConfirm(false);
      setNotifyOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await doctorService.markNotificationRead(notification.id);
      syncNotifications();
    }
    setNotifyOpen(false);
    navigate(notification.type === "CONSENT_APPROVED" || notification.type === "PATIENT_REVOKED_ACCESS" 
      ? "/doctor/consents" 
      : "/doctor"
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setNotifyOpen(false);
    if (notifyOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [notifyOpen]);

  return (
    <nav className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 transition text-(--primary-dark)"
        >
          <PanelLeftOpen size={24} />
        </motion.button>
        <img src={MainLogo} alt="logo" className="h-11 object-contain" />
        <div className="hidden md:block border-l border-slate-300 pl-4">
          <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Doctor Portal</p>
          <h2 className="text-lg font-black text-slate-800 leading-none">{getPageTitle()}</h2>
        </div>
      </div>

      {/* RIGHT SIDE: Notifications */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); setNotifyOpen(!notifyOpen); if(!notifyOpen) refreshNotifications(); }}
          className="relative p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 transition group"
        >
          <BellRing size={22} className="text-slate-500 group-hover:text-(--primary)" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* DROPDOWN */}
        <AnimatePresence>
          {notifyOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-4xl shadow-2xl border border-slate-100 overflow-hidden z-50"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                <h3 className="font-black text-slate-700 text-sm">Notifications</h3>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={isProcessing}
                    onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </motion.button>
                  <span className="text-slate-300">|</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={isProcessing}
                    onClick={(e) => { e.stopPropagation(); setShowClearConfirm(true); }}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Clear Read
                  </motion.button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm italic">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-6 py-4 border-b last:border-0 cursor-pointer transition flex justify-between gap-4 ${!n.isRead ? "bg-sky-50/40 hover:bg-sky-50" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm ${!n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">{formatDate(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <div className="size-2 bg-sky-500 rounded-full mt-2 ring-4 ring-sky-100" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION MODAL (PORTAL) */}
      {showClearConfirm && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center"
            >
              <div className="bg-red-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clear Read?</h3>
              <p className="text-slate-500 mt-2 text-sm font-medium px-4">This will permanently remove all read notifications from your history.</p>
              
              <div className="grid grid-cols-1 gap-3 mt-8">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClearRead}
                  disabled={isProcessing}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Cleaning..." : "Yes, Clear All"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.getElementById("modal-root")
      )}
    </nav>
  );
}

export default DoctorNavbar;