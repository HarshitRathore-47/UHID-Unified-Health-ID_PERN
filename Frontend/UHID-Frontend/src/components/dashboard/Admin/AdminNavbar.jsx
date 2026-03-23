import { Bell, User, Search } from "lucide-react";
import { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import { AnimatePresence, motion } from "framer-motion";
import useTheme from "../../../hooks/useTheme";

function AdminNavbar() {
  useTheme("admin-light");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      const data = await adminService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications", err);
    }
  };

  const loadCount = async () => {
    try {
      const data = await adminService.getUnreadCount();
      setCount(data.count);
    } catch (err) {
      console.error("Error loading count", err);
    }
  };

  const markAsRead = async (id) => {
    await adminService.markNotificationRead(id);
    loadNotifications();
    loadCount();
  };

  const markAll = async () => {
    await adminService.markAllRead();
    loadNotifications();
    loadCount();
  };

  const clearRead = async () => {
    await adminService.clearRead();
    loadNotifications();
  };

  return (
    <header className="h-20 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      
      <div className="flex items-center gap-4"/>
        

      {/* Right Side: Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Section */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className={`p-2.5 rounded-xl transition-all relative z-50 ${
              open
                ? "bg-[#f0fdf4] text-[#10b981]"
                : "hover:bg-[#f1f5f9] text-[#64748b]"
            }`}
          >
            <Bell size={22} />
            {count > 0 && (
              <span className="absolute top-2 right-2 bg-[#ef4444] text-[10px] min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white rounded-full text-white font-bold px-1">
                {count}
              </span>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <>
                {/* GLOBAL OVERLAY: Yeh poori screen (including dashboard) cover karega */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-45 bg-black/5 backdrop-blur-[1px]"
                />

                {/* Dropdown Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-96 bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl z-50 overflow-hidden origin-top-right"
                >
                  <div className="flex justify-between items-center px-5 py-4 border-b border-[#f1f5f9]">
                    <h3 className="text-[#0f172a] font-bold">Notifications</h3>
                    <button
                      onClick={markAll}
                      className="text-xs font-semibold text-[#10b981] hover:text-[#059669]"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="bg-[#f8fafc] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-[#94a3b8]" />
                        </div>
                        <p className="text-[#64748b] text-sm font-medium">
                          No new notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`px-5 py-4 border-b border-[#f1f5f9] cursor-pointer transition-all ${
                            n.isRead
                              ? "opacity-60"
                              : "bg-[#f0fdf4]/40 hover:bg-[#f0fdf4]"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-[#0f172a]">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748b] leading-relaxed mb-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-center">
                    <button
                      onClick={clearRead}
                      className="text-xs font-bold text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                    >
                      Clear read history
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-[#e2e8f0]"></div>

        {/* Profile Badge */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#0f172a] group-hover:text-[#10b981] transition-colors">
              Admin Panel
            </p>
            <p className="text-[11px] text-[#10b981] font-semibold uppercase tracking-tighter">
              Super Admin
            </p>
          </div>
          <div className="relative">
            <div className="h-11 w-11 bg-[#10b981] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-all">
              <User size={22} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
