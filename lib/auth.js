import { getCookie } from "./cookies-client";
import { CookieName } from "./enums";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken() {
  if (!isBrowser()) return null;
  return getCookie(CookieName.TOKEN);
}

export function setToken(token) {
  if (isBrowser()) {
    localStorage.setItem("token", token);
  }
}

export function clearToken() {
  if (isBrowser()) {
    localStorage.removeItem("token");
  }
}
