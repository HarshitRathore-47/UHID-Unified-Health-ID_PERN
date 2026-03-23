
export const toCleanDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0); 
  return d;
};
export const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);

  let age = today.getFullYear() - birth.getFullYear();

  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};