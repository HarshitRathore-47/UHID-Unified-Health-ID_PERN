import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../../services/adminServices";
import useTheme from "../../../hooks/useTheme";
import { Lock, Mail, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

function AdminLogin() {
  useTheme("admin-light"); // Sync with admin theme variables
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await adminService.login(email, password);
      localStorage.setItem("role", "ADMIN");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Access Denied.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-main) relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-(--primary-soft) rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo / Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-white border border-(--border) rounded-4xl shadow-(--shadow) text-(--primary) mb-4">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-(--text-main) tracking-wider">UHID ADMIN</h1>
          <p className="text-(--text-muted) text-[10px] font-black uppercase tracking-[0.3em] mt-1">Authorized Access Only</p>
        </div>

        {/* Login Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-(--shadow) space-y-6"
        >
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-(--text-muted) text-[10px] font-black uppercase tracking-widest px-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--primary) transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="admin@uhid.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-(--bg-main) border border-(--border) rounded-2xl text-(--text-main) font-bold text-sm outline-none focus:ring-4 focus:ring-(--primary-soft) focus:border-(--primary) transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-(--text-muted) text-[10px] font-black uppercase tracking-widest px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--primary) transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-(--bg-main) border border-(--border) rounded-2xl text-(--text-main) font-bold text-sm outline-none focus:ring-4 focus:ring-(--primary-soft) focus:border-(--primary) transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--primary) hover:bg-(--primary-dark) disabled:opacity-70 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Verifying Credentials...
              </>
            ) : (
              "Secure Login"
            )}
          </button>
        </form>

        {/* Footer Info */}
        <p className="text-center mt-8 text-(--text-muted) text-[10px] font-bold uppercase tracking-widest opacity-60">
          Secure Infrastructure &copy; 2026 UHID Health
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;