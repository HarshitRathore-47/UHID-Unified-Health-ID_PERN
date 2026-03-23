import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import patientService from "../services/patientService";

export default function PatientRegistration() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  //OtpUseStates
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [tempLoginId, setTempLoginId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    guardianName: "",
    password: "",
    confirmPassword: "",
    aadhaar: "",
    aadhaarFile: null,
  });

  //   Universal Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email" && value !== formData.email ) {
      setOtpVerified(false);
      setOtpSent(false);
      setTempLoginId(null);
      setOtp("");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (strongPassword.test(formData.password)) {
      setErrors((prev) => ({ ...prev, password: null }));
    }

    if (formData.password === formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
  }, [formData.password, formData.confirmPassword]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, aadhaarFile: file }));
  };

  //Validations Centralized
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Required";
      if (!formData.dob) newErrors.dob = "Required";
      if (!formData.gender) newErrors.gender = "Required";
    }

    if (step === 2) {
      if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = "Enter valid 10-digit phone number";
      }
      if (!formData.email) {
        newErrors.email = "Required";
      } else if (!otpVerified) {
        newErrors.email = "Verify email before continuing";
      }
      if (isMinor && !formData.guardianName)
        newErrors.guardianName = "Guardian required for minors";
    }

    if (step === 3) {
      const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

      if (!strongPassword.test(formData.password)) {
        newErrors.password =
          "Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char";
      }
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";

      setErrors({});
    }

    if (step === 4) {
      if (!formData.aadhaarFile) {
        newErrors.aadhaarFile = "Upload Aadhaar document";
      }
      if (!formData.aadhaar) {
        newErrors.aadhaar = "Required";
      } else if (!/^\d{12}$/.test(formData.aadhaar)) {
        newErrors.aadhaar = "Aadhaar must be 12 digits";
      }
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  //OtpFunctions
  const handleSendOtp = async () => {
    if (!formData.email) return;

    try {
      setSendOtpLoading(true);
      setErrors({});

      const res = await patientService.sendOtp({
        email: formData.email,
        purpose: "REGISTER",
      });
      console.log("FULL RESPONSE:", res);
      if (res?.tempLoginId) {
        setTempLoginId(res.tempLoginId);
        setOtpSent(true);
      }
    } catch (err) {
      setErrors({
        email: err.message || "Failed to send OTP",
      });
    } finally {
      setSendOtpLoading(false);
    }
  };

  //VerifyOtp
  const handleVerifyOtp = async () => {
    if (!otp || !tempLoginId) return;

    try {
      setVerifyOtpLoading(true);
      setErrors({});

      const res = await patientService.verifyLoginOtp({
        tempLoginId,
        otp,
      });

      // //debugOnly
      // console.log("verify response:", res);
      // console.log("otpVerified before:", otpVerified);

      if (res?.verified) {
        setOtpVerified(true);
        setOtp("");
      }
    } catch (err) {
      setOtpVerified(false);
      // extractData error throw karega toh wo seedha catch mein aayega
      setErrors({
        email: err.message || "Invalid OTP",
      });
    } finally {
      setVerifyOtpLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (!tempLoginId) return;

    try {
      setResendOtpLoading(true);
      setErrors({});
      setOtp(""); // clear old otp
      setOtpVerified(false); // reset verify state

      await patientService.resendOtp({ tempLoginId });
    } catch (err) {
      setErrors({
        email: err.message || "Resend failed",
      });
    } finally {
      setResendOtpLoading(false);
    }
  };

  //Submit
  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      setLoading(true);

      const payload = new FormData();

      // Append normal fields only
      const { aadhaarFile, aadhaar, ...rest } = formData;

      Object.entries(rest).forEach(([key, value]) => {
        payload.append(key, value);
      });

      payload.append("aadhaarNumber", formData.aadhaar); //number
      payload.append("aadhaar", formData.aadhaarFile); //file
      payload.append("verifyOtpId", tempLoginId);

      await patientService.registerPatient(payload);

      navigate("/patient/login");
    } catch (err) {
      console.error(err);
      setErrors({
        general: err.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };
  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = calculateAge(formData.dob) < 18;

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };
  //Password Strength Logic
  const getPasswordStrength = () => {
    const pwd = formData.password;

    if (!pwd) return { label: "", width: 0 };

    if (pwd.length < 6) return { label: "Weak", width: 30 };

    if (pwd.length >= 6 && pwd.length < 10)
      return { label: "Medium", width: 60 };

    return { label: "Strong", width: 100 };
  };

  const strength = getPasswordStrength();

  console.log("current step" + step);

  //Now layout
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-100 p-10">
        {/* Header */}
        {/* Progress */}
        <p className="text-sm text-slate-400 mb-2">Step {step} of 4</p>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-linear-to-r from-[#6a1b9a] to-[#4a148c] transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <div className="space-y-8">
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Identity Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Basic details for generating your Unique Health ID
                  </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    />

                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    />

                    {errors.dob && (
                      <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>

                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Aadhaar Info Box */}
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-xs text-purple-700">
                  Identity verification is integrated via Aadhaar to prevent
                  redundant UHID records. Currently, the system utilizes
                  synthetic datasets for development and testing purposes.
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-8">
                
                {/* DEBUG STATE
                <p style={{ color: "red" }}>otpSent: {String(otpSent)}</p>
                <p style={{ color: "blue" }}>
                  otpVerified: {String(otpVerified)}
                </p> */}

                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Contact Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Used for communication and verification purposes
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled={otpVerified}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    />
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendOtpLoading}
                        className="mt-3 text-sm font-semibold text-purple-600"
                      >
                        {sendOtpLoading ? "Sending..." : "Send OTP"}
                      </button>
                    )}
                    {otpSent && !otpVerified && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="w-full p-3 rounded-xl border border-slate-200 text-center tracking-widest focus:ring-2 focus:ring-purple-500/30 outline-none"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpLoading}
                          className="text-sm font-semibold text-purple-600"
                        >
                          {verifyOtpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    )}
                    {otpSent && !otpVerified && (
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">Didn't receive?</span>

                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendOtpLoading}
                          className="text-purple-600 font-semibold hover:underline"
                        >
                          {resendOtpLoading ? "Resending..." : "Resend"}
                        </button>
                      </div>
                    )}
                    {otpVerified && (
                      <p className="text-green-600 text-xs mt-2">
                        Email verified successfully
                      </p>
                    )}
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Guardian (Conditional) */}
                  {isMinor && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                        Guardian Name
                      </label>

                      <input
                        type="text"
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                      />

                      <p className="text-xs text-slate-400 mt-1">
                        Required for minors below 18 years
                      </p>

                      {errors.guardianName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.guardianName}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-8">
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Account Security
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Create a secure password to protect your health identity
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Password */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Create Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    />

                    {/* Strength Bar */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-purple-600 to-indigo-500 transition-all duration-300"
                            style={{ width: `${strength.width}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Strength: {strength.label}
                        </p>
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                    />

                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center gap-3 text-sm text-purple-700">
                  <span className="text-purple-600">🔒</span>
                  Your data is encrypted and stored securely.
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="w-full py-3 mt-4 space-y-8">
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Aadhaar Verification
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Required to prevent duplicate UHID creation
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Aadhaar Input */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Aadhaar Number
                    </label>

                    <input
                      type="text"
                      name="aadhaar"
                      maxLength={12}
                      value={formData.aadhaar}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({
                          ...prev,
                          aadhaar: onlyNums,
                        }));
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all tracking-widest"
                    />

                    {errors.aadhaar && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.aadhaar}
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Upload Aadhaar Document
                    </label>

                    <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:bg-purple-50/40 transition">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="aadhaarUpload"
                      />

                      <label
                        htmlFor="aadhaarUpload"
                        className="cursor-pointer text-sm text-purple-600 font-semibold"
                      >
                        Click to upload document
                      </label>

                      {formData.aadhaarFile && (
                        <p className="text-xs text-slate-500 mt-2">
                          {formData.aadhaarFile.name}
                        </p>
                      )}
                    </div>

                    {errors.aadhaarFile && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.aadhaarFile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Privacy Box */}
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-xs text-purple-700">
                  Aadhaar is used strictly for identity verification. No
                  financial data is stored. Access is consent-based.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {/* Navigation Section */}
        <div className="mt-8 space-y-4">
          {/* Error */}
          {errors.general && (
            <p className="text-sm text-red-500 text-center">{errors.general}</p>
          )}

          {/* Login Link - Only Step 1 */}
          {step === 1 && (
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/patient/login")}
                  className="font-semibold text-purple-600 hover:underline"
                >
                  Login here
                </button>
              </p>
            </div>
          )}

          {/* Buttons Row */}
          {step < 4 && (
            <div
              className={`flex ${step > 1 ? "justify-between" : "justify-end"}`}
            >
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  className="font-semibold text-purple-600 hover:underline"
                >
                  Back
                </button>
              ) : (
                <div /> // spacer
              )}

              <button
                onClick={nextStep}
                disabled={step === 2 && !otpVerified}
                className="font-semibold text-purple-600 hover:underline"
              >
                Continue
              </button>
            </div>
          )}

          {/* Final Submit Button */}
          {step === 4 && (
            <div className="space-y-3">
              <button
                onClick={prevStep}
                className="font-semibold text-purple-600 hover:underline"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-linear-to-r from-[#6a1b9a] to-[#4a148c] text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? "Creating UHID..." : "Create UHID"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
