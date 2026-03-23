import { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import useTheme from "../../../hooks/useTheme";
import {
  Filter,
  RefreshCcw,
  Calendar,
  Users,
  BarChart3,
  LayoutGrid,
} from "lucide-react";

import StatsCards from "./StatsCard";
import PatientTrendChart from "./PatientTrendChart";
import DoctorTrendChart from "./DoctorTrendChart";
import AgeDistributionPie from "./AgedistributionPie";
import GenderDistributionPie from "./GenderDistributionPie";

function AdminDashboard() {
  useTheme("admin-light");
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: "all",
    month: "all",
    gender: "all",
    age: "all",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const statsRes = await adminService.getDashboard();
      const analyticsRes = await adminService.getAnalytics(filters);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  }

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await adminService.getAnalytics(filters);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics load failed", err);
    } finally {
      setLoading(false);
    }
  }

  if (!stats || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = [
    { value: "all", label: "All Months" },
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-(--text-main) tracking-tight">
            Admin Analytics
          </h1>
          <p className="text-(--text-muted) text-sm font-bold uppercase tracking-widest mt-1">
            System Growth & Health
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="p-3 bg-white border border-(--border) text-(--text-muted) rounded-2xl hover:text-(--primary) transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* QUICK STATS */}
      <StatsCards stats={stats} />

      {/* FILTER PANEL */}
      <div className="bg-(--bg-card) border border-(--border) rounded-[2.5rem] p-8 shadow-(--shadow)">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-(--primary-soft) text-(--primary) rounded-xl">
            <Filter size={20} />
          </div>
          <h2 className="text-(--text-main) font-bold text-lg">
            Global Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <FilterSelect
            label="Year"
            value={filters.year}
            icon={Calendar}
            options={[
              { value: "all", label: "All Years" },
              ...years.map((y) => ({ value: y, label: y })),
            ]}
            onChange={(v) => setFilters({ ...filters, year: v })}
          />
          <FilterSelect
            label="Month"
            value={filters.month}
            icon={BarChart3}
            options={months}
            onChange={(v) => setFilters({ ...filters, month: v })}
          />
          <FilterSelect
            label="Gender"
            value={filters.gender}
            icon={Users}
            options={[
              { value: "all", label: "All" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
            onChange={(v) => setFilters({ ...filters, gender: v })}
          />
          <FilterSelect
            label="Age Group"
            value={filters.age}
            icon={LayoutGrid}
            options={[
              { value: "all", label: "All" },
              { value: "0-18", label: "0-18" },
              { value: "18-35", label: "18-35" },
              { value: "35-60", label: "35-60" },
              { value: "60+", label: "60+" },
            ]}
            onChange={(v) => setFilters({ ...filters, age: v })}
          />

          <div className="flex gap-2">
            <button
              onClick={loadAnalytics}
              className="flex-1 bg-(--primary) hover:bg-(--primary-dark) text-white font-bold h-[46px] rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              Apply
            </button>
            <button
              onClick={() =>
                setFilters({
                  year: "all",
                  month: "all",
                  gender: "all",
                  age: "all",
                })
              }
              className="px-4 bg-(--bg-main) text-(--text-muted) border border-(--border) font-bold h-[46px] rounded-2xl active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* CHARTS GRID - Direct components without wrapper divs to avoid double cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PatientTrendChart data={analytics.patientTrend} />
        <DoctorTrendChart data={analytics.doctorTrend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AgeDistributionPie data={analytics.ageDistribution} />
        <GenderDistributionPie data={analytics.genderDistribution} />
      </div>
    </div>
  );
}

// Helper Select Component
function FilterSelect({ label, value, options, onChange, icon: Icon }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-(--text-muted) text-[10px] font-extrabold uppercase tracking-widest px-1 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-(--bg-main) border border-(--border) px-4 py-2.5 rounded-2xl text-(--text-main) font-bold text-sm outline-none transition-all cursor-pointer appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AdminDashboard;
