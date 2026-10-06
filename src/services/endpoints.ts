/**
 * Central API Endpoints Configuration
 * Single source of truth for all backend API routes.
 */

export const ENDPOINTS = {
  // Health Check
  HEALTH: "/health",

  // Authentication & Identity
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },

  // Properties Management
  PROPERTIES: {
    LIST: "/properties",
    CREATE: "/properties",
    DETAIL: (id: string) => `/properties/${id}`,
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
  },

  // Tenants Management
  TENANTS: {
    LIST: "/tenants",
    CREATE: "/tenants",
    DETAIL: (id: string) => `/tenants/${id}`,
    UPDATE: (id: string) => `/tenants/${id}`,
    DELETE: (id: string) => `/tenants/${id}`,
  },

  // Payments & Invoices
  PAYMENTS: {
    LIST: "/payments",
    CREATE: "/payments",
    DETAIL: (id: string) => `/payments/${id}`,
    UPDATE: (id: string) => `/payments/${id}`,
    DELETE: (id: string) => `/payments/${id}`,
  },

  // Organizations & Roles
  ORGANIZATIONS: {
    LIST: "/organizations",
    CREATE: "/organizations",
    DETAIL: (id: string) => `/organizations/${id}`,
  },
  ROLES: {
    LIST: "/roles",
    DETAIL: (id: string) => `/roles/${id}`,
  },
} as const;

export default ENDPOINTS;
