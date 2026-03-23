import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useResource from "../../../hooks/useResource";
import patientService from "../../../services/patientService";
import {
  formatDate,
  calculateAge,
  formatDateTime,
} from "../../../utils/DateHelper";
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  HeartPulse,
  Edit3,
  Save,
  AlertCircle,
  Camera,
  Stethoscope,
  Activity,
  Fingerprint,
  MapPin,
  Trash2,
  Plus,
  Copy,
  CheckCircle2,
} from "lucide-react";

//helper function
const toArray = (str) =>
  str
    ? str
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
    : [];

function HealthProfile() {
  const { data, loading, error, reload } = useResource(
    patientService.getHealthProfile,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (data) {
      setProfile({
        ...data.identity,
        ...data.healthData,
        guardianName: data.identity?.guardianName || "",
        chronicConditions: data.healthData?.chronicConditions?.join(", ") || "",
        allergies: data.healthData?.allergies?.join(", ") || "",
        longTermDiseases: data.healthData?.longTermDiseases?.join(", ") || "",
      });
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Loading...</div>;

  // 3. INPUT HANDLING
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // 4. PERSISTENCE (SAVE)
  const handleSave = async () => {
    try {
      // Payload limited to HealthProfile table fields in controller
      const healthPayload = {
        height: profile.height !== "" ? Number(profile.height) : null,
        weight: profile.weight !== "" ? Number(profile.weight) : null,
        bp: profile.bp !== "" ? Number(profile.bp) : null,
        heartRate: profile.heartRate !== "" ? Number(profile.heartRate) : null,

        bloodGroup: profile.bloodGroup,
        chronicConditions: toArray(profile.chronicConditions),
        allergies: toArray(profile.allergies),
        longTermDiseases: toArray(profile.longTermDiseases),
      };
      // Update local state with server-confirmed data
      setSaving(true);
      await patientService.updateHealthProfile(healthPayload);
      setSaving(false);
      reload(); // re-fetch fresh data
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("photo", file);

      await patientService.uploadProfilePhoto(formData);

      await reload(); // wait for fresh signed URL
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const calculateBMI = (w, h) => {
    if (!w || !h) return "0.00";
    return (parseFloat(w) / (parseFloat(h) / 100) ** 2).toFixed(2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.uhid);
    setShowTick(true);
    // Hide the tick after 2 seconds
    setTimeout(() => setShowTick(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full min-h-screen bg-slate-50 p-6 md:p-10"
    >
      {/* ACTION HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-md border border-slate-200 mb-8 gap-6">
        <div className="flex flex-col  gap-4">
          <div className="flex flex-row">
            <div className="w-12 h-12 mr-2  bg-purple-100 rounded-xl flex items-center justify-center text-[#4a148c] ">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                Health Profile
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Digital Health ID & Records
              </p>
            </div>
          </div>
          {/* uhid DISPLAY */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-mono font-black text-white bg-linear-to-r from-purple-700 to-indigo-600 px-4 py-1 rounded-xl tracking-widest shadow-md">
              UHID: {profile.uhid}
            </span>
            <div className="flex items-center gap-1.5">
              {/* MAIN COPY BUTTON */}
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-400 hover:text-[#4a148c] transition-all active:scale-90"
                title="Copy UHID"
              >
                <Copy size={16} />
              </button>

              {/* APPEARING GREEN TICK */}
              <AnimatePresence>
                {showTick && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="text-emerald-500"
                  >
                    <CheckCircle2 size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* CIRCULAR PHOTO SECTION */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-slate-300" />
              )}
            </div>

            {/* PHOTO UPLOAD OPTION - ONLY VISIBLE IN EDIT MODE */}
            <AnimatePresence>
              {isEditing && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#4a148c] text-white rounded-full border-2 border-white shadow-lg hover:bg-[#311b92]"
                >
                  <Camera size={16} />
                </motion.button>
              )}
            </AnimatePresence>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleImageUpload}
              accept="image/*"
            />
          </div>

          <button
            disabled={saving}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 ${
              isEditing
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-linear-to-r from-purple-700 to-indigo-600 text-white hover:scale-105"
            } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isEditing ? (
              <>
                <Save size={20} /> Save Changes
              </>
            ) : (
              <>
                <Edit3 size={20} /> Edit Details
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: IDENTITY (LOCKED) */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <Fingerprint className="absolute -right-6 -bottom-6 text-slate-200 w-40 h-40 z-0" />
            <SectionHeader
              icon={<ShieldCheck className="text-red-500" />}
              title="Primary Identity"
            />
            <div className="space-y-5 relative z-10">
              <DataField label="Full Name" value={profile.fullName} locked />
              <DataField
                label="Date of Birth"
                value={`${formatDate(profile.dob)}`}
                locked
              />
              <DataField
                label="Age"
                value={`${calculateAge(profile.dob)} Years`}
                locked
              />
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-red-400 bg-red-50 p-2 rounded-lg uppercase relative z-10">
              <AlertCircle size={14} /> Identity fields cannot be changed
            </div>
          </section>

          {/* VITALS SECTION */}
          <section className="bg-linear-to-br from-[#4a148c] to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
            <SectionHeader
              icon={<HeartPulse className="text-purple-200" />}
              title="Vitals & BMI"
              light
            />
            <div className="grid grid-cols-2 gap-6">
              <EditableField
                label="Height (cm)"
                name="height"
                value={profile.height}
                isEdit={isEditing}
                onChange={handleInputChange}
                type="number"
                dark
              />
              <EditableField
                label="Weight (kg)"
                name="weight"
                value={profile.weight}
                isEdit={isEditing}
                onChange={handleInputChange}
                type="number"
                dark
              />
              <EditableField
                label="BP (mmHg)"
                name="bp"
                value={profile.bp}
                isEdit={isEditing}
                onChange={handleInputChange}
                type="number"
                dark
              />
              <EditableField
                label="Pulse (BPM)"
                name="heartRate"
                value={profile.heartRate}
                isEdit={isEditing}
                onChange={handleInputChange}
                type="number"
                dark
              />
            </div>
            <div className="mt-6 p-4 bg-white/10 rounded-2xl flex justify-between items-center border border-white/10">
              <span className="text-xs font-bold text-purple-200 uppercase">
                BMI Rating
              </span>
              <motion.span
                key={calculateBMI(profile.weight, profile.height)}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-black"
              >
                {calculateBMI(profile.weight, profile.height)}
              </motion.span>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: EDITABLE SECTIONS */}
        <div className="lg:col-span-8 space-y-8">
          {/* MEDICAL HISTORY SECTION */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
            <SectionHeader
              icon={<Activity className="text-orange-500" />}
              title="Medical History"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ListInput
                label="Chronic Conditions (e.g., Sugar, High BP)"
                data={profile.chronicConditions}
                isEdit={isEditing}
                color="orange"
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    chronicConditions: e.target.value,
                  }))
                }
              />
              <ListInput
                label="Allergies (All Types)"
                data={profile.allergies}
                isEdit={isEditing}
                color="red"
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    allergies: e.target.value,
                  }))
                }
              />
              <div className="md:col-span-2 border-t border-slate-50 pt-6">
                <ListInput
                  label="Long-Term Diseases (e.g., Cervical, Thyroid)"
                  data={profile.longTermDiseases}
                  isEdit={isEditing}
                  color="purple"
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      longTermDiseases: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </section>

          {/* CONTACT & GUARDIAN */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
            <SectionHeader
              icon={<Phone className="text-blue-500" />}
              title="Communication & Guardian"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField
                label="Phone"
                name="phone"
                value={profile.phone}
                isEdit={isEditing}
                onChange={handleInputChange}
              />
              <EditableField
                label="Email"
                name="email"
                value={profile.email}
                isEdit={isEditing}
                onChange={handleInputChange}
              />
              <EditableField
                label="Guardian Name"
                name="guardianName"
                value={profile.guardianName}
                isEdit={isEditing}
                onChange={handleInputChange}
              />
              <div className="md:col-span-2">
                <EditableField
                  label="Address"
                  name="address"
                  value={profile.address}
                  isEdit={isEditing}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

// UI HELPER COMPONENTS
const SectionHeader = ({ icon, title, light }) => (
  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
    {icon}
    <h3
      className={`font-black uppercase tracking-tight text-sm ${
        light ? "text-white" : "text-slate-700"
      }`}
    >
      {title}
    </h3>
  </div>
);

const DataField = ({ label, value, locked }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest">
      {label}
    </label>
    <div className="font-bold text-lg text-slate-800">{value}</div>
  </div>
);

const EditableField = ({
  label,
  name,
  value,
  isEdit,
  onChange,
  type = "text",
  dark,
}) => (
  <div>
    <label
      className={`text-[10px] font-black uppercase block mb-1 tracking-widest ${
        dark ? "text-purple-300" : "text-slate-400"
      }`}
    >
      {label}
    </label>
    {isEdit ? (
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={`w-full p-2 border-b-2 bg-transparent outline-none font-bold text-base transition-all ${
          dark
            ? "border-white/30 text-white focus:border-white"
            : "border-slate-100 text-slate-800 focus:ring-2 focus:ring-purple-300 focus:border-transparent"
        }`}
      />
    ) : (
      <div
        className={`font-bold text-base py-2 break-all ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {value}
      </div>
    )}
  </div>
);

const ListInput = ({ label, data, isEdit, onChange, color }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest">
      {label}
    </label>
    {isEdit ? (
      <textarea
        rows="2"
        value={data || ""}
        onChange={onChange}
        placeholder="Comma separated list..."
        className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800"
      />
    ) : (
      <div className="flex flex-wrap gap-2">
        {(data || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                color === "orange"
                  ? "bg-orange-50 text-orange-600 border-orange-100"
                  : color === "red"
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-purple-50 text-purple-600 border-purple-100"
              }`}
            >
              {item}
            </motion.span>
          ))}
      </div>
    )}
  </div>
);

export default HealthProfile;
