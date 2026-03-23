import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lineicons } from "@lineiconshq/react-lineicons";
import patientService from "../services/patientService";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneSolid,
  MailchimpOutlined,
  Locked1Solid,
  ArrowLeftSolid,
} from "@lineiconshq/free-icons";

export default function LoginPatient() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // phone or email
  const [password, setPassword] = useState(""); // CHANGE: password field added
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false); // will be set true when server responds with tempLoginId
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CHANGE: two-step state
  const [tempLoginId, setTempLoginId] = useState(null);
  const [step, setStep] = useState("CREDENTIALS"); // or "OTP"

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await patientService.login({
        identifier,
        password,
      });

      if (!data.tempLoginId) {
        throw new Error("Login failed");
      }

      setTempLoginId(data.tempLoginId);
      setStep("OTP");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
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
    try {
      await patientService.resendOtp({
        tempLoginId,
        purpose: "LOGIN",
      });
      setResendCount((c) => c + 1);
    } catch (err) {
      console.warn(err);
    }
  };

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
              key={step}
              id="credentialsForm"
              onSubmit={handleSubmitCredentials}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Phone or Email
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone number or email"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
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
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                  required
                />
              </div>
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
                  className="w-full p-3 rounded-xl border border-slate-200 text-center tracking-widest focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                  required
                />
              </div>

              <p className="text-xs text-slate-500 text-center">
                Didn't receive?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Resend ({resendCount})
                </button>
              </p>
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
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {step === "OTP" && (
            <button
              onClick={() => setStep("CREDENTIALS")}
              className="text-sm text-slate-600 hover:underline"
            >
              Back
            </button>
          )}

          <button
            disabled={loading}
            type="submit"
            form={step === "CREDENTIALS" ? "credentialsForm" : "otpForm"}
            className="w-full py-3 rounded-xl bg-linear-to-r from-[#6a1b9a] to-[#4a148c] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {step === "CREDENTIALS" ? "Continue" : "Verify & Login"}
          </button>
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
