import useResource from "../../../hooks/useResource";
import patientService from "../../../services/patientService";
import { formatDate } from "../../../utils/DateHelper";
import { Syringe, Calendar, User, Hospital } from "lucide-react";

function Vaccinations() {
  const { data, loading, error } = useResource(
    patientService.getVaccinationHistory,
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 font-medium">
        Loading vaccinations...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-40 text-red-500 font-semibold">
        {error}
      </div>
    );

  const records = data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Vaccination History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete immunization record overview
          </p>
        </div>

        {/* Empty State */}
        {records.length === 0 && (
          <div className="py-28 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Syringe className="text-purple-600" size={28} />
            </div>
            <p className="text-slate-500 font-medium">
              No vaccination history found.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="relative space-y-10">
          {records.map((v, index) => {
            const isOverdue =
              v.nextDueDate && new Date(v.nextDueDate) < new Date();

            return (
              <div key={v.vaccinationId} className="relative">
                {/* Timeline Line */}
                {index !== records.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-slate-200" />
                )}

                <div className="flex gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 mt-2">
                    <div className="w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <h3 className="font-bold text-xl text-slate-800">
                          {v.vaccineName}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-purple-50 text-purple-700 border border-purple-100">
                            {v.vaccineType}
                          </span>

                          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Dose {v.doseNumber}
                          </span>
                        </div>
                      </div>

                      {/* Due Status */}
                      {v.nextDueDate && (
                        <div
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            isOverdue
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {isOverdue
                            ? "Overdue"
                            : `Next Due: ${formatDate(v.nextDueDate)}`}
                        </div>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm font-medium">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Calendar size={18} className="text-purple-600" />
                        <span>
                          Vaccine Date:{" "}
                          <span className="text-slate-800 font-semibold">
                            {formatDate(v.vaccineDate)}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600">
                        <Hospital size={18} className="text-purple-600" />
                        <span>{v.hospitalName || "-"}</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600">
                        <User size={18} className="text-purple-600" />
                        <span>
                          Dr. {v.doctor?.fullName || v.providerName || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Vaccinations;
