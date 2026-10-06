/**
 * Central API Endpoints Configuration
 * Single source of truth for all backend API routes.
 */

export const ENDPOINTS = {
  // Health Check
  HEALTH: "/health",

  // Authentication & Identity
  AUTH: {
    LOOKUP: "/auth/lookup",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    REFRESH_TOKEN: "/auth/refresh-token",
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

  // Dynamic RBAC Roles & Permissions
  ROLES: {
    LIST: "/roles",
    PERMISSIONS: "/roles/permissions",
    CREATE: "/roles",
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
  },

  // SuperAdmin Control Center
  ADMIN: {
    OVERVIEW: "/admin/overview",
    USERS_LIST: "/admin/users",
    USER_CREATE: "/admin/users",
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    USER_ADMIN_ROLE: (id: string) => `/admin/users/${id}/admin-role`,
    ROLES_LIST: "/admin/roles",
    ROLE_CREATE: "/admin/roles",
    ROLE_UPDATE: (id: string) => `/admin/roles/${id}`,
    ROLE_DELETE: (id: string) => `/admin/roles/${id}`,
    ORGANIZATIONS_LIST: "/admin/organizations",
    ORGANIZATION_SUBSCRIPTION: (id: string) => `/admin/organizations/${id}/subscription`,
  },

  // SaaS Plans & Subscriptions
  PLANS: {
    LIST: "/plans",
    CREATE: "/plans",
    DETAIL: (id: string) => `/plans/${id}`,
    UPDATE: (id: string) => `/plans/${id}`,
    DELETE: (id: string) => `/plans/${id}`,
  },

  // Organizations
  ORGANIZATIONS: {
    LIST: "/organizations",
    CREATE: "/organizations",
    DETAIL: (id: string) => `/organizations/${id}`,
    MEMBERS_LIST: (orgId: string) => `/organizations/${orgId}/members`,
    MEMBER_ADD: (orgId: string) => `/organizations/${orgId}/members`,
    MEMBER_REMOVE: (orgId: string, userId: string) => `/organizations/${orgId}/members/${userId}`,
  },
} as const;

export default ENDPOINTS;
