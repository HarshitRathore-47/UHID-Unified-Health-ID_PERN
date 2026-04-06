import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doctorService from "../services/doctorServices";
import useTheme from "../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorLogin() {
  useTheme("doctor");

  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); //
  const [password, setPassword] = useState(""); //
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [tempLoginId, setTempLoginId] = useState(null);
  const [step, setStep] = useState("CREDENTIALS"); // or "OTP"

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setStep("OTP");

      const data = await doctorService.login({
        identifier,
        password,
      });

      if (!data?.tempLoginId) {
        throw new Error("Login failed");
      }

      setTempLoginId(data.tempLoginId);
      setStep("OTP");
    } catch (err) {
      setStep("CREDENTIALS");
      setTempLoginId(null);
      console.log("LOGIN ERROR:", err);
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
      const data = await doctorService.verifyLoginOtp({
        tempLoginId,
        otp,
      });

      if (!data) {
        throw new Error("OTP verification failed");
      }
      localStorage.setItem("role", "DOCTOR");
      const statusData = await doctorService.getDoctorStatus();

      if (statusData.status === "PENDING") {
        navigate("/doctor/pending");
        return;
      }

      if (statusData.status === "REJECTED") {
        navigate("/doctor/rejected");
        return;
      }

      navigate("/doctor");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!tempLoginId || !canResend) return;

    setOtp(""); // Purana input saaf
    setCooldown(40); // Timer turant reset
    setCanResend(false); // Button turant disable
    try {
      await doctorService.resendOtp({
        tempLoginId,
        purpose: "LOGIN",
      });
    } catch (err) {
      // Agar server fail hua tabhi wapas enable karo
      setCanResend(true);
      setCooldown(0);
      setError("Failed to resend. Please try again.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-100 p-10 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 ">Doctor Login</h2>
          <p className="text-sm text-slate-500 mt-1 ">
            Enter your credentials to access your UHID account
          </p>
        </div>
        <AnimatePresence mode="wait">
          {step === "CREDENTIALS" && (
            <motion.form
              key="credentials"
              id="credentialsForm"
              onSubmit={handleSubmitCredentials}
              className="space-y-6"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Phone or Email
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone number or email"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring)/30 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring)/30 outline-none transition-all"
                  required
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--primary-dark) text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                Continue
              </button>
            </motion.form>
          )}

          {step === "OTP" && (
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
                className="text-sm text-(--primary) hover:underline"
              >
                Back
              </button>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Enter OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full p-3 rounded-xl border border-slate-200 text-center tracking-widest focus:ring-2 focus:ring-(--ring)/30 outline-none transition-all"
                  required
                />
              </div>

              <p className="text-xs text-slate-500 text-center">
                Didn't receive?{" "}
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResend}
                  className="text-(--primary) font-bold hover:underline disabled:opacity-50 disabled:no-underline transition-all"
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
                className="w-full py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--primary-dark) text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                Verify & Login
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {/* Back to Registration */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/doctor/register")}
              className="font-semibold text-(--primary) hover:underline"
            >
              Register Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
