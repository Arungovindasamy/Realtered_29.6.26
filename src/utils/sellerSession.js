const CANONICAL_SELLER_KEY = "__haatza_sellerId";

/**
 * Resolves the logged-in seller's ID from session/local storage.
 * @returns {string} The active seller ID.
 */
export const resolveSellerId = () => {
  if (typeof window === "undefined") return "";

  const keys = [
    "haatzaSeller",
    CANONICAL_SELLER_KEY,
    "sellerId",
    "seller_id",
    "userId",
    "user_id",
    "user",
    "authUser",
    "currentUser",
    "userData",
    "sellerData",
    "auth",
    "session"
  ];

  for (const key of keys) {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal && sessionVal.trim().length >= 2) {
      const val = sessionVal.trim();
      if (!val.startsWith("{") && !val.startsWith("[")) {
        return val;
      }
      try {
        const obj = JSON.parse(val);
        const id =
          obj?.sellerId ||
          obj?.seller_id ||
          obj?.userId ||
          obj?.user_id ||
          obj?.user?.sellerId ||
          obj?.user?.seller_id ||
          obj?.data?.sellerId ||
          obj?.data?.seller_id ||
          obj?.seller?.sellerId ||
          obj?.seller?.seller_id ||
          obj?.id ||
          obj?.uid ||
          obj?.userEmail;
        if (id && typeof id === "string" && id.length >= 2) return id;
      } catch {}
    }

    const localVal = localStorage.getItem(key);
    if (localVal && localVal.trim().length >= 2) {
      const val = localVal.trim();
      if (!val.startsWith("{") && !val.startsWith("[")) {
        return val;
      }
      try {
        const obj = JSON.parse(val);
        const id =
          obj?.sellerId ||
          obj?.seller_id ||
          obj?.userId ||
          obj?.user_id ||
          obj?.user?.sellerId ||
          obj?.user?.seller_id ||
          obj?.data?.sellerId ||
          obj?.data?.seller_id ||
          obj?.seller?.sellerId ||
          obj?.seller?.seller_id ||
          obj?.id ||
          obj?.uid ||
          obj?.userEmail;
        if (id && typeof id === "string" && id.length >= 2) return id;
      } catch {}
    }
  }

  return "";
};

/**
 * Sync function mapping to the centralized resolver
 */
export const getSellerId = () => resolveSellerId();

/**
 * Resolves the logged-in seller's email address from session/local storage.
 * @returns {string} The active email address.
 */
export const resolveSellerEmail = () => {
  if (typeof window === "undefined") return "";

  const keys = [
    "haatzaSeller",
    "pendingEmail", "userEmail", "email", "sellerEmail",
    "user_email", "seller_email", "currentUserEmail",
    "user", "authUser", "currentUser", "userData", "sellerData",
    "auth", "session", "loginData", "accountData",
  ];
  const emailFields = [
    "email", "userEmail", "sellerEmail", "user_email",
    "seller_email", "emailAddress", "loginEmail",
  ];
  const isValidEmail = (v) => v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  for (const key of keys) {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal) {
      if (isValidEmail(sessionVal)) return sessionVal.trim().toLowerCase();
      try {
        const parsed = JSON.parse(sessionVal);
        for (const field of emailFields) {
          if (isValidEmail(parsed?.[field])) return String(parsed[field]).trim().toLowerCase();
        }
      } catch {}
    }

    const localVal = localStorage.getItem(key);
    if (localVal) {
      if (isValidEmail(localVal)) return localVal.trim().toLowerCase();
      try {
        const parsed = JSON.parse(localVal);
        for (const field of emailFields) {
          if (isValidEmail(parsed?.[field])) return String(parsed[field]).trim().toLowerCase();
        }
        for (const nest of ["user", "data", "account", "seller", "profile"]) {
          if (parsed?.[nest] && typeof parsed[nest] === "object") {
            for (const field of emailFields) {
              if (isValidEmail(parsed[nest][field])) {
                return String(parsed[nest][field]).trim().toLowerCase();
              }
            }
          }
        }
      } catch {}
    }
  }

  return "";
};

/**
 * Resolves the logged-in seller's phone number from session/local storage.
 * @returns {string} The active phone number.
 */
export const resolveSellerPhone = () => {
  if (typeof window === "undefined") return "";

  const keys = [
    "haatzaSeller",
    "pendingPhone", "userPhone", "phone", "sellerPhone",
    "user_phone", "seller_phone", "currentUserPhone", "mobile",
    "user", "authUser", "currentUser", "userData", "sellerData",
    "auth", "session", "loginData", "accountData",
  ];
  const phoneFields = [
    "phone", "userPhone", "sellerPhone", "user_phone",
    "seller_phone", "mobile", "mobileNumber", "phoneNumber",
    "contactNumber", "loginPhone",
  ];
  const isValidPhone = (v) => v && /^[6-9]\d{9}$/.test(String(v).trim());

  for (const key of keys) {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal) {
      if (isValidPhone(sessionVal)) return sessionVal.trim();
      try {
        const parsed = JSON.parse(sessionVal);
        for (const field of phoneFields) {
          if (isValidPhone(parsed?.[field])) return String(parsed[field]).trim();
        }
        for (const nest of ["user", "data", "account", "seller", "profile"]) {
          if (parsed?.[nest] && typeof parsed[nest] === "object") {
            for (const field of phoneFields) {
              if (isValidPhone(parsed[nest][field])) {
                return String(parsed[nest][field]).trim();
              }
            }
          }
        }
      } catch {}
    }

    const localVal = localStorage.getItem(key);
    if (localVal) {
      if (isValidPhone(localVal)) return localVal.trim();
      try {
        const parsed = JSON.parse(localVal);
        for (const field of phoneFields) {
          if (isValidPhone(parsed?.[field])) return String(parsed[field]).trim();
        }
        for (const nest of ["user", "data", "account", "seller", "profile"]) {
          if (parsed?.[nest] && typeof parsed[nest] === "object") {
            for (const field of phoneFields) {
              if (isValidPhone(parsed[nest][field])) {
                return String(parsed[nest][field]).trim();
              }
            }
          }
        }
      } catch {}
    }
  }

  return "";
};

/**
 * Resolves the logged-in seller's display name from session/local storage.
 * @returns {string} The active seller name.
 */
export const resolveSellerName = () => {
  if (typeof window === "undefined") return "";

  const keys = [
    "haatzaSeller",
    "pendingFullName", "sellerFullName", "fullName", "userName",
    "user", "authUser", "currentUser", "userData", "sellerData",
    "auth", "session", "loginData", "accountData",
  ];
  const nameFields = [
    "fullName", "name", "sellerName", "userName",
    "companyName", "tradeName", "businessName", "storeName",
  ];
  const isValidName = (v) =>
    v && typeof v === "string" && v.trim().length >= 2 && v.trim().toLowerCase() !== "seller";

  for (const key of keys) {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal) {
      const trimmed = sessionVal.trim();
      if (isValidName(trimmed) && !trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return trimmed;
      }
      try {
        const parsed = JSON.parse(sessionVal);
        for (const field of nameFields) {
          if (isValidName(parsed?.[field])) return String(parsed[field]).trim();
        }
        for (const nest of ["user", "data", "account", "seller", "profile"]) {
          if (parsed?.[nest] && typeof parsed[nest] === "object") {
            for (const field of nameFields) {
              if (isValidName(parsed[nest][field])) {
                return String(parsed[nest][field]).trim();
              }
            }
          }
        }
      } catch {}
    }

    const localVal = localStorage.getItem(key);
    if (localVal) {
      const trimmed = localVal.trim();
      if (isValidName(trimmed) && !trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return trimmed;
      }
      try {
        const parsed = JSON.parse(localVal);
        for (const field of nameFields) {
          if (isValidName(parsed?.[field])) return String(parsed[field]).trim();
        }
        for (const nest of ["user", "data", "account", "seller", "profile"]) {
          if (parsed?.[nest] && typeof parsed[nest] === "object") {
            for (const field of nameFields) {
              if (isValidName(parsed[nest][field])) {
                return String(parsed[nest][field]).trim();
              }
            }
          }
        }
      } catch {}
    }
  }

  return "";
};