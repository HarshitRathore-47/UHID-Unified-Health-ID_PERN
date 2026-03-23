import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query"; // ✅ Step 1: QueryClient import kiya

import TreatmentForm from "./MedicalsForms/Treatments";
import PrescriptionForm from "./MedicalsForms/Prescriptions";
import LabReportForm from "./MedicalsForms/LabReports";
import DietForm from "./MedicalsForms/DietForm";
import VisitForm from "./MedicalsForms/VisitForm";
import VaccinationForm from "./MedicalsForms/VaccinationsForm";

function MedicalRecordModal({ open, type, patientId, onClose }) {
  const queryClient = useQueryClient(); // ✅ Step 2: QueryClient initialize kiya

  if (!open) return null;

  // ✅ Step 3: Smart Close function banaya
  const handleSmartClose = () => {
    // Ye line dashboard ke counters aur charts ko refresh kar degi bina reload ke
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); 
    queryClient.invalidateQueries({ queryKey: ["activeConsents"] });
    
    // Parent component (PatientRecord) ko band karne aur reload karne ka signal
    onClose(); 
  };

  const renderForm = () => {
    // ✅ Har form ko handleSmartClose pass kiya taaki submit ke baad global refresh ho
    switch (type) {
      case "treatment":
        return <TreatmentForm patientId={patientId} onClose={handleSmartClose} />;
      case "prescription":
        return <PrescriptionForm patientId={patientId} onClose={handleSmartClose} />;
      case "lab":
        return <LabReportForm patientId={patientId} onClose={handleSmartClose} />;
      case "diet":
        return <DietForm patientId={patientId} onClose={handleSmartClose} />;
      case "visit":
        return <VisitForm patientId={patientId} onClose={handleSmartClose} />;
      case "vaccination":
        return <VaccinationForm patientId={patientId} onClose={handleSmartClose} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative"
        >
          {/* Close Button use handleSmartClose for safety refresh */}
          <button
            onClick={handleSmartClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>

          {/* Dynamic Form */}
          {renderForm()}
        </motion.div>
      </motion.div>
      
    </AnimatePresence>
  );
}

export default MedicalRecordModal;