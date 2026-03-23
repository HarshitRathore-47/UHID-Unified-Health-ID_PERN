import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import patientimage from "../assets/patient image.jpg";
import doctorimage from "../assets/doctor-image.jpg";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-linear-to-br from-[#F8F7FF] via-white to-[#F3F0FF] flex items-center justify-center p-6 overflow-hidden">

      {/* Animated Glow Background */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[700px] h-[700px] bg-[#4a148c]/10 rounded-full blur-3xl top-[-250px] right-[-200px]"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-[#7b1fa2]/10 rounded-full blur-3xl bottom-[-250px] left-[-200px]"
      />

      <div className="relative max-w-5xl w-full">

        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-[#6a1b9a] to-[#4a148c] rounded-2xl mb-6 shadow-xl"
          >
            <ShieldCheck className="text-white" size={24} />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-[#4a148c] to-[#7b1fa2] bg-clip-text text-transparent tracking-tight">
            Unified Health ID
          </h1>

          <p className="text-gray-500 mt-3 text-sm tracking-wide">
            Secure • Intelligent • Consent-Driven Healthcare Identity
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* PATIENT */}
          <motion.button
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/patient/register")}
            className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-14 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Light Sweep */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <div className="relative flex flex-col items-center">

              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-8 border border-[#4a148c]/20 shadow-lg">
                <img
                  src={patientimage}
                  alt="Patient"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h2 className="text-2xl font-bold text-[#4a148c] mb-2">
                Patient Portal
              </h2>

              <p className="text-gray-500 text-center text-sm">
                Manage your digital health records seamlessly
              </p>
            </div>
          </motion.button>

          {/* DOCTOR */}
          <motion.button
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/doctor/register")}
            className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-14 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <div className="relative flex flex-col items-center">

              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-8 border border-[#4a148c]/20 shadow-lg">
                <img
                  src={doctorimage}
                  alt="Doctor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h2 className="text-2xl font-bold text-[#4a148c] mb-2">
                Doctor Portal
              </h2>

              <p className="text-gray-500 text-center text-sm">
                Access verified patient data with consent
              </p>
            </div>
          </motion.button>

        </div>

        {/* FOOTER */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-400 tracking-wide">
            Enterprise-grade Security • Zero Financial Data • Privacy First
          </p>
        </div>
      </div>
    </div>
  );
}