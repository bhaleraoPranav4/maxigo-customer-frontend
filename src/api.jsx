const API_BASE = "https://api.maxigo.in/api";

const TOKEN_KEY = "maxigo_token";
const USER_KEY = "maxigo_user";

// =========================================================
// AUTH STORAGE
// =========================================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAuth(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

// =========================================================
// RESPONSE PARSER
// =========================================================

async function parseResponse(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// =========================================================
// COMMON API REQUEST
// =========================================================

export async function apiRequest(path, options = {}) {
  const {
    skipAuth = false,
    ...fetchOptions
  } = options;

  const isFormData =
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData;

  const headers = {
    ...(fetchOptions.headers || {}),
  };

  if (fetchOptions.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();

  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch (error) {
    console.error("MaxiGo API connection error:", error);
    throw new Error(
      "Unable to connect to MaxiGo backend. Please make sure Spring Boot is running on port 8080."
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401 && !skipAuth) {
      clearAuth();
    }

    let message = `Request failed (${response.status})`;

    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// =========================================================
// AUTH
// =========================================================

export async function loginUser(mobile, password) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      mobile,
      password,
    }),
    skipAuth: true,
  });

  const token =
    response?.token ||
    response?.jwt ||
    response?.accessToken;

  const user =
    response?.user ||
    response?.customer ||
    response;

  if (token) {
    saveAuth(token, user);
  }

  return response;
}

export async function registerUser(payload) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });

  const token =
    response?.token ||
    response?.jwt ||
    response?.accessToken;

  const user =
    response?.user ||
    response?.customer ||
    response;

  if (token) {
    saveAuth(token, user);
  }

  return response;
}

// =========================================================
// PRODUCTS
// =========================================================

export const getProducts = () =>
  apiRequest("/products", { skipAuth: true });

export const getProduct = (id) =>
  apiRequest(`/products/${id}`, { skipAuth: true });

export const getCategories = () =>
  apiRequest("/categories", { skipAuth: true });

// =========================================================
// CUSTOMER PROFILE
// =========================================================

export const getMyProfile = () =>
  apiRequest("/customer/profile");

export const updateMyProfile = (payload) =>
  apiRequest("/customer/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// =========================================================
// ADDRESSES
// =========================================================

export const getAddresses = () =>
  apiRequest("/customer/addresses");

export const createAddress = (payload) =>
  apiRequest("/customer/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAddress = (id, payload) =>
  apiRequest(`/customer/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteAddress = (id) =>
  apiRequest(`/customer/addresses/${id}`, {
    method: "DELETE",
  });

export const setDefaultAddress = (id) =>
  apiRequest(`/customer/addresses/${id}/default`, {
    method: "PUT",
  });

// =========================================================
// CART
// =========================================================

export const getCart = () =>
  apiRequest("/customer/cart");

export const addCartItem = (productId, quantity = 1) =>
  apiRequest(
    `/customer/cart/items/${Number(productId)}?quantity=${Number(quantity)}`,
    {
      method: "POST",
    }
  );

export const updateCartItem = (cartItemId, quantity) =>
  apiRequest(
    `/customer/cart/items/${Number(cartItemId)}?quantity=${Number(quantity)}`,
    {
      method: "PUT",
    }
  );

export const removeCartItem = (cartItemId) =>
  apiRequest(`/customer/cart/items/${cartItemId}`, {
    method: "DELETE",
  });

export const clearCart = () =>
  apiRequest("/customer/cart", {
    method: "DELETE",
  });

// =========================================================
// DELIVERY FEE
// =========================================================

export const getCustomerDeliveryFee = (deliveryAddressId) =>
  apiRequest(
    `/customer/orders/delivery-fee?deliveryAddressId=${encodeURIComponent(
      deliveryAddressId
    )}`
  );

// =========================================================
// ORDERS
// =========================================================

export const placeOrder = (payload) =>
  apiRequest("/customer/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMyOrders = () =>
  apiRequest("/customer/orders");

export const getMyOrder = (orderId) =>
  apiRequest(`/customer/orders/${orderId}`);

export const cancelMyOrder = (orderId) =>
  apiRequest(`/customer/orders/${orderId}/cancel`, {
    method: "PUT",
  });

// =========================================================
// ORDER TRACKING
// =========================================================

export const getOrderTracking = (orderId) =>
  apiRequest(`/customer/orders/${orderId}/tracking`);

export const getOrderAssignment = (orderId) =>
  apiRequest(`/customer/orders/${orderId}/assignment`);

// =========================================================
// OFFERS
// =========================================================

export const getActiveOffers = () =>
  apiRequest("/offers/active", { skipAuth: true });

export const getFirstActiveOffer = async () => {
  const data = await apiRequest("/offers/active", {
    skipAuth: true,
  });

  return Array.isArray(data) ? data[0] || null : data;
};

// =========================================================
// REFERRAL
// =========================================================

export const getMyReferral = () =>
  apiRequest("/customer/referral");

export const applyReferralCode = (referralCode) =>
  apiRequest(
    `/customer/referral/apply?referralCode=${encodeURIComponent(
      String(referralCode || "").trim()
    )}`,
    {
      method: "POST",
    }
  );

export const getReferralHistory = () =>
  apiRequest("/customer/referral/history");

// Applied referral status endpoint.
// If backend is not yet exposing this endpoint, the Referral page
// can still show the customer's own referral-program details.
export const getAppliedReferral = () =>
  apiRequest("/customer/referral/applied");

// Customer-facing referral settings.
export const getReferralSettings = () =>
  apiRequest("/customer/referral/settings");

// =========================================================
// WALLET
// =========================================================

export const getMyWallet = () =>
  apiRequest("/customer/wallet");

export const getWalletTransactions = () =>
  apiRequest("/customer/wallet/transactions");

// =========================================================
// ADMIN REFERRAL SETTINGS
// Kept here for admin-side reuse if needed.
// =========================================================

export const getAdminReferralSettings = () =>
  apiRequest("/admin/referral/settings");

export const updateAdminReferralSettings = (payload) =>
  apiRequest("/admin/referral/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// =========================================================
// GENERIC EXPORT
// =========================================================

export { API_BASE };