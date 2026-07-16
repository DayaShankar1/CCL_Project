/**
 * Centralized Form Validation and Input Sanitization Utilities
 * Prevents SQL Injection, XSS, HTML tags, and Script Injections.
 */

export const sanitizeInput = (text) => {
  if (typeof text !== 'string') return text;
  let s = text.trim();
  // Strip HTML tags
  s = s.replace(/<[^>]*>?/gm, '');
  // Remove javascript: URI scheme
  s = s.replace(/javascript\s*:/gi, '');
  // Remove event handlers and dangerous JS functions
  s = s.replace(/\b(onerror|onclick|onload|onmouseover|onfocus|onblur|onchange|onsubmit|eval|alert|prompt|confirm)\b/gi, '');
  // Escape SQL injection patterns (e.g., double dashes)
  s = s.replace(/--/g, '');
  return s;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return "Name is required.";
  const val = name.trim();
  if (val.length < 3) return "Name must be at least 3 characters.";
  if (val.length > 50) return "Name must not exceed 50 characters.";
  if (!/^[a-zA-Z\s]+$/.test(val)) return "Name must contain only alphabets and spaces.";
  return null;
};

export const validateEmployeeId = (id) => {
  if (!id || !id.trim()) return "Employee ID is required.";
  const val = id.trim();
  if (val.length > 20) return "Employee ID must not exceed 20 characters.";
  if (/\s/.test(val)) return "Employee ID must not contain spaces.";
  if (!/^[A-Z0-9\-]+$/.test(val)) return "Employee ID must contain only uppercase letters, numbers, and hyphens.";
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return "Email address is required.";
  const val = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!emailRegex.test(val)) return "Invalid email address format.";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return "Phone number is required.";
  const val = phone.trim();
  if (!/^\d+$/.test(val)) return "Phone number must contain numbers only.";
  if (val.length !== 10) return "Phone number must be exactly 10 digits.";
  return null;
};

export const validateAge = (age) => {
  if (age === undefined || age === null || age === "") return "Age is required.";
  const val = Number(age);
  if (isNaN(val) || !Number.isInteger(val)) return "Age must be a valid integer.";
  if (val < 18 || val > 70) return "Age must be between 18 and 70.";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 32) return "Password must not exceed 32 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password must contain at least one special character.";
  return null;
};

export const validateBloodGroup = (bg) => {
  const allowed = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  if (!bg) return "Blood group is required.";
  if (!allowed.includes(bg.trim())) return "Invalid blood group. Allowed: A+, A-, B+, B-, AB+, AB-, O+, O-.";
  return null;
};

export const validateHeight = (h) => {
  if (h === undefined || h === null || h === "") return "Height is required.";
  const val = Number(h);
  if (isNaN(val)) return "Height must be numeric.";
  if (val < 100 || val > 250) return "Height must be between 100 cm and 250 cm.";
  return null;
};

export const validateWeight = (w) => {
  if (w === undefined || w === null || w === "") return "Weight is required.";
  const val = Number(w);
  if (isNaN(val)) return "Weight must be numeric.";
  if (val < 20 || val > 250) return "Weight must be between 20 kg and 250 kg.";
  return null;
};

export const validateTemperature = (t) => {
  if (t === undefined || t === null || t === "") return "Temperature is required.";
  const val = Number(t);
  if (isNaN(val)) return "Temperature must be numeric.";
  if (val < 90 || val > 110) return "Temperature must be between 90°F and 110°F.";
  return null;
};

export const validateBP = (sys, dia) => {
  if (sys === undefined || sys === null || sys === "") return "Systolic BP is required.";
  if (dia === undefined || dia === null || dia === "") return "Diastolic BP is required.";
  const sysVal = Number(sys);
  const diaVal = Number(dia);
  if (isNaN(sysVal)) return "Systolic BP must be numeric.";
  if (isNaN(diaVal)) return "Diastolic BP must be numeric.";
  if (sysVal < 70 || sysVal > 250) return "Systolic BP must be between 70 and 250.";
  if (diaVal < 40 || diaVal > 150) return "Diastolic BP must be between 40 and 150.";
  return null;
};

export const validateSpo2 = (spo2) => {
  if (spo2 === undefined || spo2 === null || spo2 === "") return "SpO2 is required.";
  const val = Number(spo2);
  if (isNaN(val) || !Number.isInteger(val)) return "SpO2 must be an integer.";
  if (val < 50 || val > 100) return "SpO2 must be between 50% and 100%.";
  return null;
};
