// ─── Keys ────────────────────────────────────────────────────────────────────
const KEY = 'haatza_user';

/**
 * Save user details to sessionStorage and localStorage.
 * Call this after registration, login, or OTP verification.
 */
export function saveUser({ name, email, phone, logoUrl }) {
  const user = {
    name:  name  || '',
    email: email || '',
    phone: phone || '',
    logoUrl: logoUrl || '',
  };
  const jsonStr = JSON.stringify(user);
  sessionStorage.setItem(KEY, jsonStr);
  localStorage.setItem(KEY, jsonStr);

  // Sync legacy keys
  if (name) {
    sessionStorage.setItem("sellerName", name);
    localStorage.setItem("sellerName", name);
  }
  if (email) {
    sessionStorage.setItem("userEmail", email);
    localStorage.setItem("userEmail", email);
    sessionStorage.setItem("pendingEmail", email);
  }
  if (phone) {
    sessionStorage.setItem("sellerPhone", phone);
    localStorage.setItem("sellerPhone", phone);
  }
  if (logoUrl) {
    sessionStorage.setItem("sellerLogoUrl", logoUrl);
    localStorage.setItem("sellerLogoUrl", logoUrl);
  }
}

/**
 * Retrieve the logged-in user. Returns null if not found.
 */
export function getUser() {
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear user on logout.
 */
export function clearUser() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
  sessionStorage.removeItem('pendingEmail');
  localStorage.removeItem('userEmail');
  sessionStorage.removeItem('sellerName');
  localStorage.removeItem('sellerName');
  sessionStorage.removeItem('sellerPhone');
  localStorage.removeItem('sellerPhone');
  sessionStorage.removeItem('sellerLogoUrl');
  localStorage.removeItem('sellerLogoUrl');
}