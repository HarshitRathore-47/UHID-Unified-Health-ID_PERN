import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import doctorService from "../services/doctorServices";
import { Eye, EyeOff } from "lucide-react";

const AnimatedVerified = () => {
  const [showTick, setShowTick] = useState(false);

  return (
    <div className="flex  mt-4">
      <svg width="30" height="30" viewBox="0 0 100 100">
        {/* Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          stroke="var(--primary)"
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ rotate: -90, originX: "50%", originY: "50%" }}
          onAnimationComplete={() => setShowTick(true)}
        />

        {/* Tick appears AFTER circle */}
        {showTick && (
          <motion.path
            d="M35 52 L47 65 L68 40"
            stroke="var(--primary)"
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </svg>
    </div>
  );
};

export default function DoctorRegistration() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "doctor");
  }, []);

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    licenseNumber: "",
    specialization: "",
    qualification: "",
    hospital: "",
    experience: "",
    password: "",
    confirmPassword: "",
    certificateFile: null,
  });

  //   Universal Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "userName") {
      const usernameRegex = /^[a-z0-9_.]{8,15}$/;
      if (!usernameRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          userName:
            "8-15 characters. Only lowercase letters, numbers, _ or . allowed",
        }));
      } else {
        setErrors((prev) => ({ ...prev, userName: null }));
      }
    }
    if (name === "email" && value !== formData.email) {
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
    setFormData((prev) => ({ ...prev, certificateFile: file }));
  };

  //Validations Centralized
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Required";
      if (!formData.dob) newErrors.dob = "Required";
      if (!formData.gender) newErrors.gender = "Required";
      const usernameRegex = /^[a-z0-9_.]{8,15}$/;

      if (!formData.userName) {
        newErrors.userName = "Username required";
      } else if (!usernameRegex.test(formData.userName)) {
        newErrors.userName =
          "8-15 characters. Only lowercase letters, numbers, _ or . allowed";
      }
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
    }

    if (step === 3) {
      if (!formData.specialization) newErrors.specialization = "Required";

      if (!formData.qualification) newErrors.qualification = "Required";

      if (!formData.licenseNumber) newErrors.licenseNumber = "Required";

      if (!formData.experience) newErrors.experience = "Required";

      if (!formData.hospital) newErrors.hospital = "Required";
    }

    if (step === 4) {
      if (!formData.certificateFile) {
        newErrors.certificateFile = "Upload your Doctor Certificate";
      }
      const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

      if (!strongPassword.test(formData.password)) {
        newErrors.password =
          "Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char";
      }
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
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

      const res = await doctorService.sendOtp({
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
  const handleVerifyOtp = async () => {
    if (!otp || !tempLoginId) return;

    try {
      setVerifyOtpLoading(true);
      setErrors({});

      const res = await doctorService.verifyLoginOtp({
        tempLoginId,
        otp,
      });

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

      await doctorService.resendOtp({ tempLoginId });
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
      const { certificateFile, licenseNumber, ...rest } = formData;

      Object.entries(rest).forEach(([key, value]) => {
        payload.append(key, value);
      });

      payload.append("licenseNumber", formData.licenseNumber); //number
      payload.append("certificate", formData.certificateFile); //file
      payload.append("verifyOtpId", tempLoginId);

      await doctorService.register(payload);

      navigate("/doctor/login");
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);
      const backendMessage = err.response?.data?.message;
      setErrors({
        general: backendMessage || err.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };
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

  //Now layout
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-100 p-10">
        {/* Header */}
        {/* Progress */}
        <p className="text-sm text-slate-400 mb-2">Step {step} of 4</p>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-linear-to-r from-(--primary) to-(--primary-dark) transition-all duration-500"
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
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
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
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
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
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all bg-white"
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
                  {/* Username */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Username
                    </label>

                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Choose a unique username"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />

                    {errors.userName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.userName}
                      </p>
                    )}
                  </div>
                </div>

                {/* license Info Box */}
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-xs text-sky-700">
                  Identity verification is integrated via Medical License to
                  prevent Fake or Fraudalent doctor Records. Currently, the
                  system utilizes synthetic datasets for development and testing
                  purposes.
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-8">
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Contact Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Used for communication and verification purposes
                  </p>
                </div>

                <div className="grid md:grid-cols gap-6">
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
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
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
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendOtpLoading}
                        className="mt-3 text-sm font-semibold text-(--primary)"
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
                          className="w-full p-3 rounded-xl border border-slate-200 text-center tracking-widest focus:ring-2 focus:ring-(--ring) outline-none"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpLoading}
                          className="text-sm font-semibold text-(--primary)"
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
                          className="text-(--primary) font-semibold hover:underline"
                        >
                          {resendOtpLoading ? "Resending..." : "Resend"}
                        </button>
                      </div>
                    )}
                    {otpVerified && <AnimatedVerified />}
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-8">
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Professional Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Provide your verified medical credentials for professional
                    access
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Specialization */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Specialization
                    </label>

                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />

                    {errors.specialization && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.specialization}
                      </p>
                    )}
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Qualification
                    </label>

                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="MBBS, MD, BDS etc"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />

                    {errors.qualification && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Medical License Number
                    </label>

                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />

                    {errors.licenseNumber && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.licenseNumber}
                      </p>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Years of Experience
                    </label>

                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />

                    {errors.experience && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  {/* Hospital / Clinic */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Hospital / Clinic Name
                    </label>

                    <input
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-(--ring) outline-none transition-all"
                    />

                    {errors.hospital && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.hospital}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-xs text-sky-700">
                  All medical credentials will be reviewed by the platform
                  administrator before granting access to the doctor portal.
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="w-full py-3 mt-4 space-y-8">
                {/* Section Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Account Security & Verification
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Create a secure password and upload your medical certificate
                    for verification
                  </p>
                </div>

                {/* PASSWORD SECTION */}
                <div className="space-y-6">
                  {/* Password */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                      Create Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {/* Strength Bar */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-(--primary) to-(--primary-dark) transition-all duration-300"
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

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* CERTIFICATE UPLOAD */}
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                    Upload Medical Certificate
                  </label>

                  <div className="border-2 border-dashed border-sky-200 rounded-xl p-6 text-center hover:bg-sky-50/40 transition">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="certificateUpload"
                    />

                    <label
                      htmlFor="certificateUpload"
                      className="cursor-pointer text-sm text-(--primary) font-semibold"
                    >
                      Click to upload certificate
                    </label>

                    {formData.certificateFile && (
                      <p className="text-xs text-slate-500 mt-2">
                        {formData.certificateFile.name}
                      </p>
                    )}
                  </div>

                  {errors.certificateFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.certificateFile}
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-xs text-sky-700">
                  Your medical certificate will be reviewed by the administrator
                  to verify your professional credentials before activating your
                  doctor account.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {/* Navigation Section */}
        <div className="mt-8 space-y-4">
          {/* Error Section */}
          {errors.general && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <p className="text-sm font-semibold text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* Login Link - Only Step 1 */}
          {step === 1 && (
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/doctor/login")}
                  className="font-semibold text-(--primary) hover:underline"
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
                  className="font-semibold text-(--primary) hover:underline"
                >
                  Back
                </button>
              ) : (
                <div /> // spacer
              )}

              <button
                onClick={nextStep}
                disabled={step === 2 && !otpVerified}
                className="font-semibold text-(--primary) hover:underline"
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
                className="font-semibold text-(--primary) hover:underline"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--primary-dark) text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? "Creating Doctor Account..." : "Register as Doctor"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
