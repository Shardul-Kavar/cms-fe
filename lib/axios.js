// lib/axios.js
// Updated to:
// - Prefer Bearer token from a cookie read via document.cookie (client-side)
// - Fall back to localStorage token
// - Always send Authorization: Bearer <token> to match the provided curl
// - Keep toast errors and 401 redirect to /login

import axios from "axios";
import { toastError } from "./toast";

// ---- client-side cookie helpers ----
function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function parseDocumentCookies() {
  if (!isBrowser()) return {};
  const raw = document.cookie || "";
  if (!raw) return {};
  return raw.split(";").reduce((acc, part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return acc;
    const v = rest.join("=");
    try {
      acc[k] = decodeURIComponent(v);
    } catch {
      acc[k] = v;
    }
    return acc;
  }, {});
}

function getCookie(name) {
  const map = parseDocumentCookies();
  return Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null;
}

// Name of the auth cookie (customize if different)
const TOKEN_COOKIE_NAME = "token";
// Name of the storage key (fallback)
const TOKEN_STORAGE_KEY = "token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api",
  withCredentials: false,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    // Prefer cookie token to mirror the curl header usage
    let token = null;

    if (isBrowser()) {
      token = getCookie(TOKEN_COOKIE_NAME) || localStorage.getItem(TOKEN_STORAGE_KEY);
    }

    if (token) {
      config.headers = config.headers || {};
      const hasBearer = token.startsWith("Bearer ");
      config.headers.Authorization = hasBearer ? token : `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Log and toast request configuration errors
    // (network errors will be handled in the response interceptor)
    console.log("axios.request error:", error);
    toastError(error?.message || "Request error");
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log("axios.response error:", error);

    const msg =
      (typeof error?.response?.data?.error == "object" &&
        Array.isArray(error?.response?.data?.error) &&
        error?.response?.data?.error?.[0]) ||
      (typeof error?.response?.data == "string" && error?.response?.data) ||
      error?.response?.data?.message ||
      error?.response?.statusText ||
      error?.message ||
      "Request failed";

    // Avoid spamming on 401 if you already redirect
    if (error?.response?.status !== 401) {
      toastError(msg);
    }

    if (error?.response?.status === 401 && isBrowser()) {
      // Clear client-side storages
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {}
      // Best-effort cookie clear (client can’t clear HttpOnly cookies)
      try {
        document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
      } catch {}

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
