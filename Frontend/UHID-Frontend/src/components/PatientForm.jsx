import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lineicons } from "@lineiconshq/react-lineicons";
import patientService from "../services/patientService";
import patientImage from "../assets/eldery_treatment_05.jpg";
import {
  User4Solid,
  CalendarDaysDuotone,
  PhoneSolid,
  MailchimpOutlined,
  MapPin5Solid,
  ArrowLeftSolid,
  Locked1Solid,
  Shield2Solid,
  CreditCardMultipleSolid,
} from "@lineiconshq/free-icons";

export default function PatientRegistration({ onBack }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    GuardianName: "",
    email: "",
    aadhaar: "",
    address: "",
    otp: "",
    password: "", // CHANGE: added password
    confirmPassword: "",
  });
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const [tempLoginId, setTempLoginId] = useState(null); // store tempLoginId here
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [uhid, setUhid] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value })); // <-- use ...s spread
  };

  const handleSendOtp = async () => {
    if (!formData.email) return;
    setLoading(true);
    try {
      await patientService.sendOtp({
        email: formData.email,
        purpose: "REGISTER",
      });

      if (res?.data?.ok && res.data.tempLoginId) {
        setTempLoginId(res.data.tempLoginId);
        setOtpSent(true);
        setOtpMessage(` OTP is sent to Your email ${formData.email}`);
      } else {
        throw new Error(res?.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Send OTP failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    try {
      // verify OTP (this will mark authOtp.verified on server)
      await patientService.verifyOtp({
        tempLoginId,
        otp: formData.otp,
      });
      if (!verifyRes?.data?.ok) {
        throw new Error(verifyRes?.data?.message || "OTP verification failed");
      }
      setOtpVerified(true);
    } catch (err) {
      console.error("Otp error", err);
      alert(
        err?.response?.data?.message || err.message || "Verification Failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // 2) Create UHID: verify OTP first, then call register
  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "confirmPassword" && key !== "aadhaarFile") {
          payload.append(key, value);
        }
      });

      // append file separately
      if (formData.aadhaarFile) {
        payload.append("aadhaar", formData.aadhaarFile);
      }

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

  // Resend using tempLoginId
  async function handleResend() {
    if (!tempLoginId) return alert("No OTP session found. Send OTP first.");
    try {
      await patientService.resendOtp({
        tempLoginId,
      });
    } catch (err) {
      console.warn(err);
      alert(err?.response?.data?.message || "Resend failed");
    }
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-[#F4F7F5] via-[#F8FAF9] to-[#E3EFE8] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full min-h-1/2 items-center animate-slide-in-right">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 row-3 gap-6 ">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#2E7D6A] hover:text-[#1B6B5A] mb-6 transition-colors"
          >
            <Lineicons icon={ArrowLeftSolid} className="w-5 h-5" />
            Back
          </button>
          <div className="columns-2 ">
            <div className="h-50">
              <div className="mb-8 pt-10 text-center">
                <h1 className="text-4xl font-bold text-[#2E7D6A] mb-1 tracking-wide">
                  Create Your
                </h1>
                <h1 className="text-7xl font-bold text-[#2E7D6A] tracking-widest">
                  UHID
                </h1>
                <p className="text-gray-600 text-sm">
                  Secure • Private • Consent-based
                </p>
              </div>
            </div>
            <div className="justify-items-center-safe">
              <img
                src={patientImage}
                alt="patient_image"
                className="h-50 justify-center"
              />
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <Lineicons
                    icon={User4Solid}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Lineicons
                      icon={CalendarDaysDuotone}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Lineicons
                    icon={PhoneSolid}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    maxLength={10}
                    minLength={10}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Name
                </label>
                <div className="relative">
                  <Lineicons
                    icon={User4Solid}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="text"
                    name="GuardianName"
                    value={formData.GuardianName}
                    onChange={handleInputChange}
                    placeholder="Enter Guardian Name"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Lineicons
                    icon={MailchimpOutlined}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors mb-5"
                    required
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-4 bg-[#1B6B5A] text-white font-semibold rounded-full hover:bg-[#2E7D6A] transition-colors shadow-lg hover:shadow-xl"
                  >
                    Send OTP
                  </button>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-[#DDE7E2] rounded-xl bg-white text-center text-lg tracking-widest focus:outline-none focus:border-[#1B6B5A]"
                      required
                    />
                    <h4 className="text-center text-[#1B6B5A] font-semibold">
                      {otpMessage}
                    </h4>
                    <p className="text-sm text-gray-600 text-center mt-2 mb-3">
                      Didn't receive?
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-[#1B6B5A] font-semibold ml-2 hover:text-[#19876f]"
                      >
                        Resend
                      </button>
                    </p>
                    {!otpVerified ? (
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full py-4 bg-[#1B6B5A] text-white font-semibold rounded-full hover:bg-[#2E7D6A] transition-colors shadow-lg hover:shadow-xl"
                      >
                        Verify OTP
                      </button>
                    ) : (
                      <h4 className="w-full py-3 bg-[#1B6B5A] text-center text-2xl text-white font-semibold rounded-full hover:bg-[#2E7D6A] transition-colors shadow-lg hover:shadow-xl">
                        Verified
                      </h4>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                  required
                />
                {errors.confirmPassword && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="bg-[#F8FAF9] rounded-2xl p-6 border-2 border-[#DDE7E2]">
                <div className="flex items-center gap-2 mb-4">
                  <Lineicons
                    icon={Shield2Solid}
                    className="w-5 h-5 text-[#1B6B5A]"
                  />
                  <h3 className="font-semibold text-[#2E7D6A]">
                    Aadhaar Verification
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Lineicons
                      icon={CreditCardMultipleSolid}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    />
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleInputChange}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={12}
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl bg-white focus:outline-none focus:border-[#1B6B5A]"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="bg-[#F8FAF9] rounded-2xl p-6 border-2 border-dashed border-[#DDE7E2]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-[#2E7D6A]">
                    Upload Aadhaar
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Upload your Aadhaar Card Photo from Front
                </p>
                <input
                  type="file"
                  id="aadhaar"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAadhaarFile(e.target.files[0])}
                  className="hidden"
                />

                <label
                  htmlFor="aadhaar"
                  className="block w-full text-center py-3 bg-white border-2 border-[#DDE7E2] text-[#2E7D6A] font-semibold rounded-xl hover:bg-[#F4F7F5] cursor-pointer transition-colors"
                >
                  {aadhaarFile ? "Change File" : "Choose File"}
                </label>

                {aadhaarFile && (
                  <p className="text-xs text-green-700 mt-2">
                    Selected: {aadhaarFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <Lineicons
                    icon={MapPin5Solid}
                    className="absolute left-4 top-4 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#DDE7E2] rounded-xl focus:outline-none focus:border-[#1B6B5A] transition-colors"
                    required
                  />
                </div>
              </div>
              {!isRegistered ? (
                <button
                  type="submit"
                  className="w-full py-4 bg-[#1B6B5A] text-white font-semibold rounded-full hover:bg-[#2E7D6A] transition-colors shadow-lg hover:shadow-xl"
                >
                  Create UHID
                </button>
              ) : (
                <h4 className="text-4xl font-bold text-[#2E7D6A] text-center">
                  Registered Succesfully And Your ID is : {uhid}
                </h4>
              )}
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <Lineicons icon={Locked1Solid} className="w-4 h-4" />
                Your data is encrypted & shared only with your consent
              </p>
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/patient/login")}
                    className="text-[#1B6B5A] font-semibold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
