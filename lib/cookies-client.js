// lib/cookies-client.js

export function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Parse document.cookie into an object
 */
export function parseDocumentCookies() {
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

function isLikelyJson(str) {
  if (typeof str !== "string") return false;
  const s = str.trim();
  if (!s) return false;
  // Quick checks for common JSON shapes
  if (
    (s.startsWith("{") && s.endsWith("}")) ||
    (s.startsWith("[") && s.endsWith("]"))
  )
    return true;
  // Also allow quoted JSON primitives like "true", "123", "\"text\""
  if (s.startsWith('"') && s.endsWith('"')) return true;
  // Heuristic: primitives without quotes (true, false, null, numbers)
  if (s === "true" || s === "false" || s === "null") return true;
  if (!Number.isNaN(Number(s))) return true;
  return false;
}

function parseIfJson(value) {
  if (!isLikelyJson(value)) return value;
  try {
    const parsed = JSON.parse(value);
    // Handle empty strings parsed from quotes: JSON.parse('""') => ''
    return parsed === undefined ? value : parsed;
  } catch {
    return value;
  }
}

/**
 * Get a cookie by name (client-only)
 */
export function getCookie(name) {
  const map = parseDocumentCookies();
  return Object.prototype.hasOwnProperty.call(map, name)
    ? parseIfJson(map[name])
    : null;
}

/**
 * Serialize a cookie key/value with options to a cookie string
 */
export function serializeCookie(name, value, options = {}) {
  const enc = (v) => encodeURIComponent(v);
  const parts = [`${name}=${enc(String(value))}`];

  if (options.maxAge !== undefined)
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.expires instanceof Date)
    parts.push(`Expires=${options.expires.toUTCString()}`);
  parts.push(`Path=${options.path || "/"}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.secure) parts.push(`Secure`);
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`); // 'lax' | 'strict' | 'none'

  // Note: httpOnly cannot be set from client-side JS (browser will ignore it).
  return parts.join("; ");
}

/**
 * Set a cookie (client-only). HttpOnly cannot be set from JS.
 */
export function setCookie(name, value, options = {}) {
  if (!isBrowser()) return;

  const data = typeof value === "object" ? JSON.stringify(value) : value;

  const defaults = {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // maxAge: 60 * 60 * 24 * 7, // uncomment to default to 7 days
  };
  const cookieStr = serializeCookie(name, data, {
    ...defaults,
    ...options,
  });
  document.cookie = cookieStr;
}

/**
 * Delete a cookie (client-only) by setting Max-Age=0 and same path/domain
 */
export function deleteCookie(name, options = {}) {
  if (!isBrowser()) return;
  const defaults = { path: "/" };
  const cookieStr = serializeCookie(name, "", {
    ...defaults,
    ...options,
    maxAge: 0,
  });
  document.cookie = cookieStr;
}
