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
    USER_UPDATE: (id: string) => `/admin/users/${id}`,
    USER_DELETE: (id: string) => `/admin/users/${id}`,
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    USER_ADMIN_ROLE: (id: string) => `/admin/users/${id}/admin-role`,
    ROLES_LIST: "/admin/roles",
    ROLE_CREATE: "/admin/roles",
    ROLE_UPDATE: (id: string) => `/admin/roles/${id}`,
    ROLE_DELETE: (id: string) => `/admin/roles/${id}`,
    ORGANIZATIONS_LIST: "/admin/organizations",
    ORGANIZATION_CREATE: "/admin/organizations",
    ORGANIZATION_UPDATE: (id: string) => `/admin/organizations/${id}`,
    ORGANIZATION_DELETE: (id: string) => `/admin/organizations/${id}`,
    ORGANIZATION_SUBSCRIPTION: (id: string) => `/admin/organizations/${id}/subscription`,
    SETTINGS_LIST: "/admin/settings",
    SETTINGS_CREATE: "/admin/settings",
    SETTING_UPDATE: (key: string) => `/admin/settings/${key}`,
    SETTING_DELETE: (key: string) => `/admin/settings/${key}`,
    PROPERTIES_LIST: "/admin/properties",
    LEASES_LIST: "/admin/leases",
    MAINTENANCE_LIST: "/admin/maintenance",
  },

  // SaaS Plans & Subscriptions
  PLANS: {
    LIST: "/plans",
    CREATE: "/plans",
    DETAIL: (id: string) => `/plans/${id}`,
    UPDATE: (id: string) => `/plans/${id}`,
    DELETE: (id: string) => `/plans/${id}`,
  },

  // Multi-Unit Management
  UNITS: {
    LIST: "/units",
    CREATE: "/units",
    DETAIL: (id: string) => `/units/${id}`,
    UPDATE: (id: string) => `/units/${id}`,
    DELETE: (id: string) => `/units/${id}`,
  },

  // Rental Listings & Marketplace
  LISTINGS: {
    PUBLIC_LIST: "/listings/public",
    PUBLIC_DETAIL: (id: string) => `/listings/public/${id}`,
    OWNER_LIST: "/listings",
    CREATE: "/listings",
    UPDATE: (id: string) => `/listings/${id}`,
    DELETE: (id: string) => `/listings/${id}`,
  },

  // Rental Applications
  APPLICATIONS: {
    SUBMIT: "/applications",
    MY_LIST: "/applications/my",
    OWNER_LIST: "/applications",
    APPROVE: (id: string) => `/applications/${id}/approve`,
    REJECT: (id: string) => `/applications/${id}/reject`,
  },

  // Leases & Rent Schedules
  LEASES: {
    MY_RENTALS: "/leases/my-rentals",
    OWNER_LIST: "/leases",
    DETAIL: (id: string) => `/leases/${id}`,
    PAY_SCHEDULE: (scheduleId: string) => `/leases/schedules/${scheduleId}/pay`,
  },

  // Maintenance & Complaints
  MAINTENANCE: {
    LIST: "/maintenance",
    MY_LIST: "/maintenance/my",
    CREATE: "/maintenance",
    ASSIGN: (id: string) => `/maintenance/${id}/assign`,
    STATUS: (id: string) => `/maintenance/${id}/status`,
  },

  // Organizations
  ORGANIZATIONS: {
    LIST: "/organizations",
    CREATE: "/organizations",
    DETAIL: (id: string) => `/organizations/${id}`,
    MEMBERS_LIST: (orgId: string) => `/organizations/${orgId}/members`,
    MEMBER_ADD: (orgId: string) => `/organizations/${orgId}/members`,
    MEMBER_UPDATE: (orgId: string, userId: string) => `/organizations/${orgId}/members/${userId}`,
    MEMBER_REMOVE: (orgId: string, userId: string) => `/organizations/${orgId}/members/${userId}`,
  },
} as const;

export default ENDPOINTS;
