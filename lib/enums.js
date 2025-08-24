// lib/enums.js
// Plain JavaScript "enums" using frozen objects for immutability.

// Auth & roles
export const UserRole = Object.freeze({
  ADMIN: "ADMIN",
  TECHNICIAN: "TECHNICIAN",
  MANAGER: "MANAGER",
  CUSTOMER: "CUSTOMER",
});

// Job status lifecycle
export const JobStatus = Object.freeze({
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  NEW: "NEW",
  PENDING: "PENDING",
});

// Job categories
export const Category = Object.freeze({
  AC: "A/C",
  FRIDGE: "FRIDGE",
  WASHING_MACHINE: "WASHING_MACHINE",
});

// Pagination defaults
export const Pagination = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: Object.freeze([10, 20, 50, 100]),
});

// Common cookie names
export const CookieName = Object.freeze({
  TOKEN: "token",
  THEME: "theme",
  LOCALE: "locale",
  USER: "user",
});

// Storage keys
export const StorageKey = Object.freeze({
  TOKEN: "token",
  LAST_ROUTE: "last_route",
});

// API routes (relative to NEXT_PUBLIC_API_BASE)
export const ApiRoute = Object.freeze({
  USER: "/user",
  CUSTOMERS: "/customer",
  JOBS: "/job",
});

// UI routes (Next.js pages)
export const UiRoute = Object.freeze({
  LOGIN: "/login",
  CUSTOMERS: "/customers",
  JOBS: "/jobs",
});

// Toast defaults
export const ToastDefaults = Object.freeze({
  AUTO_CLOSE_MS: 3000,
  POSITION: "top-right",
});

// Sort directions
export const SortOrder = Object.freeze({
  ASC: "ascend",
  DESC: "descend",
});

// HTTP status short list
export const HttpStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});

// Theme preference
export const ThemeMode = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
});
