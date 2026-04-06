import { useState } from "react";
import usePaginatedResource from "../../../hooks/usePaginatedResource";
import patientService from "../../../services/patientService";
import { formatDate } from "../../../utils/DateHelper";
import { Apple, Calendar, User } from "lucide-react";
import MealSection from "../../UI/DietUI";

function Diets() {
  const [currentPage, setCurrentPage] = useState(1);

  const { records, pagination, loading, error, load } = usePaginatedResource(
    patientService.getDiets,
    "diets",
    currentPage,
  );
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">
            Loading your diet plans...
          </p>
        </div>
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* 🔷 Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Diet Plans</h1>
            <p className="text-sm text-slate-500 mt-1">
              Personalized nutrition and dietary recommendations
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            {records.length} Plans
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-10">
          {!loading && records.length === 0 && (
            <div className="py-28 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Apple className="text-green-600" size={28} />
              </div>
              <p className="text-slate-500 font-medium">No diet plans found.</p>
            </div>
          )}

          {records.map((diet) => (
            <div
              key={diet.dietId}
              className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-800">
                    {diet.dietName}
                  </h3>

                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                        diet.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {diet.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meals Grid */}
              <div className="grid md:grid-cols-3 gap-y-5 gap-x-12">
                <MealSection
                  title="Breakfast"
                  items={diet.breakfastItems}
                  color="purple"
                />

                <MealSection
                  title="Lunch"
                  items={diet.lunchItems}
                  color="green"
                />

                <MealSection
                  title="Dinner"
                  items={diet.dinnerItems}
                  color="blue"
                />

                <MealSection
                  title="Avoid"
                  items={diet.avoidanceRestriction}
                  color="red"
                />
              </div>

              {/* Info Section */}
              <div className="grid md:grid-cols-3 gap-6 text-sm font-medium text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-purple-600" />
                  <span>
                    Start:{" "}
                    <span className="text-slate-800 font-semibold">
                      {formatDate(diet.startDate)}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-purple-600" />
                  <span>
                    End:{" "}
                    <span className="text-slate-800 font-semibold">
                      {formatDate(diet.endDate)}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3 md:col-span-1">
                  <User size={18} className="text-purple-600" />
                  {diet.doctorHospitalName || "-"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {pagination && (
          <div className="flex justify-center items-center gap-6 pt-8">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-40 hover:bg-purple-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Diets;
