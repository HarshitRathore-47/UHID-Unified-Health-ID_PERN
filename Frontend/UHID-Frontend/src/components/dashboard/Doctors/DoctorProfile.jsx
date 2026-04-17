import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Building2,
  Save,
  Edit2,
  X,
  Loader2,
  Camera,
  ShieldCheck,
  Mail,
  Calendar,
  UserCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useResource from "../../../hooks/useResource";
import doctorService from "../../../services/doctorServices";

export default function DoctorProfile() {
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1️⃣ Load Profile
  const { data: profile, isLoading } = useResource(
    doctorService.getDoctorProfile,
    "doctorProfile",
  );

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    specialization: "",
    hospital: "",
    experience: "",
    qualification: "",
    dob: "",
    gender: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        email: profile.email || "",
        specialization: profile.specialization || "",
        hospital: profile.hospital || "",
        experience: profile.experience || "",
        qualification: profile.qualification || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
      });
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await doctorService.updateDoctorProfile(formData);
      queryClient.invalidateQueries(["doctorProfile"]);
      toast.success("Profile Updated Successfully");
      setIsEdit(false);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      toast.error(backendMessage || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-slate-500 font-black">
        Loading Healthcare Profile...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* 🟦 BANNER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-24 bg-linear-to-r from-(--primary) to-(--primary-dark)" />
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12">
          <div className="relative">
            <div className="size-36 rounded-2xl bg-slate-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              {profile?.profilePhotoKey ? (
                <img
                  src={profile.profilePhotoKey}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={60} className="text-slate-200" />
              )}
            </div>
            <label className="absolute bottom-1 right-1 p-2.5 bg-(--primary) text-white rounded-xl shadow-lg cursor-pointer hover:bg-(--primary-dark) transition">
              <Camera size={16} />
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  doctorService
                    .updateProfilePhoto(file)
                    .then(() => {
                      queryClient.invalidateQueries(["doctorProfile"]);
                      toast.success("Photo Updated Successfully");
                    })
                    .catch((err) => {
                      const backendMessage = err.response?.data?.message;
                      toast.error(backendMessage || "Photo upload failed");
                    });
                }}
              />
            </label>
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              Dr. {profile?.fullName}{" "}
              <ShieldCheck size={24} className="text-sky-500" />
            </h1>
            <p className="text-sm font-black text-slate-400 mt-1 tracking-widest uppercase">
              @{profile?.userName}
            </p>
          </div>

          <button
            onClick={() => setIsEdit(!isEdit)}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all mb-2 flex items-center gap-2 border ${
              isEdit
                ? "bg-slate-50 text-slate-600 border-slate-200"
                : "bg-slate-900 text-white border-slate-900 shadow-xl"
            }`}
          >
            {isEdit ? (
              <>
                <X size={16} /> Cancel
              </>
            ) : (
              <>
                <Edit2 size={16} /> Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 📋 LEFT: CORE IDENTITY (NON-EDITABLE) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">
              Identity Details
            </h3>

            <StaticField
              label="Registered Email"
              value={profile?.email}
              icon={<Mail size={16} />}
            />
            <StaticField
              label="Gender"
              value={profile?.gender}
              icon={<UserCircle size={16} />}
            />
            <StaticField
              label="Date of Birth"
              value={
                profile?.dob
                  ? new Date(profile.dob).toLocaleDateString("en-GB")
                  : "Not Set"
              }
              icon={<Calendar size={16} />}
            />
            <StaticField
              label="Account Status"
              value={profile?.status}
              icon={<ShieldCheck size={16} />}
              isStatus
            />
          </div>

          {isEdit && (
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full py-4 bg-(--primary) hover:bg-(--primary-dark) text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-100 flex items-center justify-center gap-3 transition-all"
            >
              {isSaving ? (
                <Loader2 className="animate-spin size-5" />
              ) : (
                <Save size={18} />
              )}
              Save All Changes
            </button>
          )}
        </div>

        {/* 🛠️ RIGHT: PROFESSIONAL INFO (EDITABLE) */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">
            Professional Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <EditField
              label="Specialization"
              value={formData.specialization}
              isEdit={isEdit}
              icon={<Briefcase size={18} />}
              onChange={(v) => setFormData({ ...formData, specialization: v })}
            />

            <EditField
              label="Hospital / Clinic"
              value={formData.hospital}
              isEdit={isEdit}
              icon={<Building2 size={18} />}
              onChange={(v) => setFormData({ ...formData, hospital: v })}
            />

            <EditField
              label="Total Experience"
              value={formData.experience}
              isEdit={isEdit}
              icon={<Loader2 size={18} />}
              type="number"
              suffix="Years"
              onChange={(v) => setFormData({ ...formData, experience: v })}
            />

            <EditField
              label="Qualifications"
              value={formData.qualification}
              isEdit={isEdit}
              icon={<GraduationCap size={18} />}
              onChange={(v) => setFormData({ ...formData, qualification: v })}
            />

            <div className="md:col-span-2 max-w-sm">
              <EditField
                label="Contact Number"
                value={formData.phone}
                isEdit={isEdit}
                icon={<Phone size={18} />}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🧱 Sub-Component: Identity Details (Static)
function StaticField({ label, value, icon, isStatus }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-slate-300">{icon}</span>
        <p
          className={`text-sm font-bold ${isStatus ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest" : "text-slate-700"}`}
        >
          {value || "---"}
        </p>
      </div>
    </div>
  );
}

// 🖊️ Sub-Component: Editable Professional Info
function EditField({
  label,
  value,
  isEdit,
  icon,
  onChange,
  type = "text",
  suffix = "",
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {isEdit ? (
          <div className="relative w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-(--primary) transition-colors">
              {icon}
            </span>
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-(--primary) focus:ring-4 focus:ring-sky-50 transition-all"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full bg-slate-50/50 border border-transparent px-4 py-3 rounded-xl group hover:border-slate-200 transition-all">
            <span className="text-slate-300 group-hover:text-(--primary) transition-colors">
              {icon}
            </span>
            <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">
              {value || "Not Provided"}{" "}
              {value && suffix && !isEdit && ` ${suffix}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
