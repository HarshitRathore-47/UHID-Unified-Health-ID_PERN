import { Pill, Clock } from "lucide-react";

function PrescriptionCard({ prescription }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-purple-700">
            Prescribed by Dr. {prescription.doctor?.fullName}
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Medicine System Badge */}
            <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-purple-50 text-purple-700 border border-purple-100">
              {prescription.medicineSystem}
            </span>

            {/* Diagnosis Badge */}
            {prescription.diagnosis && (
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700  border-indigo-200">
                Diagnosis: {prescription.diagnosis}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="space-y-6">
        {prescription.medicines.map((med) => (
          <div
            key={med.id}
            className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50 p-5 rounded-2xl hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Pill size={18} className="text-purple-700" />
                </div>
                <h4 className="font-bold text-slate-800">
                  {med.prescribedMedicineName}
                </h4>
              </div>

              <div className="text-xs text-slate-500 mt-2">
                Brand: {med.brand}
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-bold text-purple-700 text-sm">
                {med.dosage}
              </div>

              <div className="flex items-center justify-end gap-1 text-slate-500 text-xs">
                <Clock size={12} />
                {med.frequency} – {med.instructedTime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrescriptionCard;
