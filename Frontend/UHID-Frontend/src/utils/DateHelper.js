// SAFE DATE PARSER
// this is for not displaying invalid date like "Not-a-date". this function return null and we display "-" this with formate date function help !
const parseSafeDate = (value) => {
  if (!value) return null; // 👈 critical fix

  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return d;
};

// FORMATTERS

export const formatDate = (value) => {
  const d = parseSafeDate(value);
  if (!d) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

export const formatDateTime = (value) => {
  const d = parseSafeDate(value);
  if (!d) return "-";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

export const calculateAge = (dob) => {
  if (!dob) return "-";

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return "-";

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
