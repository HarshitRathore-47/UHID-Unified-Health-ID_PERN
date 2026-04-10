import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import { motion, AnimatePresence } from "framer-motion";
import useTheme from "../hooks/useTheme";

export default function LoginPatient() {
  useTheme("patient");
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  const [uhid, setUhid] = useState("");
  const [password, setPassword] = useState(""); //
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // 2. Email hint ke liye naya state
  const [emailHint, setEmailHint] = useState("");

  const [tempLoginId, setTempLoginId] = useState(null);
  const [step, setStep] = useState("CREDENTIALS");

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await patientService.login({
        uhid,
        password,
      });

      if (!data?.tempLoginId) {
        throw new Error("Login failed");
      }

      setTempLoginId(data.tempLoginId);
      setEmailHint(data.emailHint || "your registered email");
      setStep("OTP"); // ✅ Success hone par hi step badlo
    } catch (err) {
      setStep("CREDENTIALS");
      setTempLoginId(null);
      const backend = err?.response?.data;
      setError(backend?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await patientService.verifyLoginOtp({
        tempLoginId,
        otp,
      });

      if (!data) {
        throw new Error("OTP verification failed");
      }

      localStorage.setItem("role", "PATIENT");

      navigate("/patient");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!tempLoginId) return;

    setOtp(""); // Purana input saaf
    setCooldown(30); // Timer turant reset
    setCanResend(false);

    try {
      await patientService.resendOtp({
        tempLoginId,
        purpose: "LOGIN",
      });
    } catch (err) {
      setCanResend(true);
      setCooldown(0);
      setError("Failed to resend. Please try again.");
      console.warn(err);
    }
  };
  useEffect(() => {
    if (!canResend) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [canResend]);
  useEffect(() => {
    if (step === "OTP" && otpInputRef.current) {
      otpInputRef.current.focus(); // ✅ Naya: OTP step par input ko focus karein
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-100 p-10 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 ">Patient Login</h2>
          <p className="text-sm text-slate-500 mt-1 ">
            Enter your credentials to access your UHID account
          </p>
        </div>
        <AnimatePresence mode="wait">
          {/* Form Content */}
          {step === "CREDENTIALS" ? (
            <motion.form
              key="credentials"
              id="credentialsForm"
              onSubmit={handleSubmitCredentials}
              className="space-y-6"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  UHID ID
                </label>
                <input
                  type="text"
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value.slice(0, 12))}
                  placeholder="Enter 12-digit UHID"
                  maxLength={12}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Password
                </label>
                <div className="relative">
                  {" "}
                  {/* Wrapper added for positioning */}
                  <input
                    type={showPassword ? "text" : "password"} // Type toggle logic
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    required
                  />
                  <button
                    type="button" // Important: type button rakho warna form submit ho jayega
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded-xl bg-linear-to-r from-[#6a1b9a] to-[#4a148c] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {loading ? "Processing..." : "Continue"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              id="otpForm"
              onSubmit={handleVerifyOtp}
              className="space-y-6"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => setStep("CREDENTIALS")}
                className="text-sm font-medium text-purple-600 hover:underline flex items-center gap-1"
              >
                ← Back
              </button>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Enter OTP
                </label>
                <input
                  ref={otpInputRef}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full p-3 rounded-xl border border-slate-200 text-center tracking-widest focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-700 text-center leading-relaxed">
                📧 Please check <b className="text-blue-900">{emailHint}</b> for
                the 6-digit verification code.
              </div>

              <p className="text-xs text-slate-500 text-center">
                Didn't receive?{" "}
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResend}
                  className="text-purple-600 font-bold hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                >
                  {canResend ? (
                    "Resend OTP"
                  ) : (
                    <span className="flex items-center gap-1 justify-center">
                      Resend in <span className="font-mono">{cooldown}s</span>
                    </span>
                  )}
                </button>
              </p>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded-xl bg-linear-to-r from-[#6a1b9a] to-[#4a148c] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Security Note */}
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-xs text-purple-700 flex items-center gap-2">
          🔒 Your login is protected with OTP verification and encrypted
          storage.
        </div>

        {/* Navigation Section */}
        <div className="mt-8 space-y-4">
          <div className="min-h-[32px] flex items-center justify-center mb-2">
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-xs font-medium text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100 text-center w-full"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Back to Registration */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/patient/register")}
                className="font-semibold text-purple-600 hover:underline"
              >
                Create UHID
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
