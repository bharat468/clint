import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { AdminUser, PlatformOverview, SuperAdminRole, AdminOrganization } from "@/types";

export interface CreateUserInput {
  mobile: string;
  name?: string;
  email?: string;
  roleId?: string;
  organizationId?: string;
  propertyScope?: string[];
}

export interface CreateSuperAdminRoleInput {
  name: string;
  slug?: string;
  description?: string;
  permissions: string[];
}

export interface UpdateSubscriptionInput {
  planId?: string;
  expiresAt?: string | null;
  status?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedAt: string;
}

export const adminService = {
  getOverview: () =>
    api.get(ENDPOINTS.ADMIN.OVERVIEW).then((r) => (r.data?.data ?? r.data) as PlatformOverview),

  listUsers: () =>
    api.get(ENDPOINTS.ADMIN.USERS_LIST).then((r) => (r.data?.data ?? r.data) as AdminUser[]),

  createUser: (data: CreateUserInput) =>
    api.post(ENDPOINTS.ADMIN.USER_CREATE, data).then((r) => (r.data?.data ?? r.data) as AdminUser),

  updateUser: (id: string, data: { name?: string; email?: string; mobile?: string }) =>
    api.put(ENDPOINTS.ADMIN.USER_UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as AdminUser),

  deleteUser: (id: string) =>
    api.delete(ENDPOINTS.ADMIN.USER_DELETE(id)).then((r) => r.data?.data ?? r.data),

  updateStatus: (id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") =>
    api.put(ENDPOINTS.ADMIN.USER_STATUS(id), { status }).then((r) => (r.data?.data ?? r.data) as AdminUser),

  updateRole: (id: string, data: { roleId: string; organizationId: string; propertyScope: string[] }) =>
    api.put(ENDPOINTS.ADMIN.USER_ROLE(id), data).then((r) => (r.data?.data ?? r.data) as AdminUser),

  assignAdminRole: (userId: string, data: { isSuperAdmin: boolean; adminRole?: string }) =>
    api.put(ENDPOINTS.ADMIN.USER_ADMIN_ROLE(userId), data).then((r) => r.data?.data ?? r.data),

  // SuperAdmin RBAC platform roles
  listRoles: () =>
    api.get(ENDPOINTS.ADMIN.ROLES_LIST).then((r) => (r.data?.data ?? r.data) as SuperAdminRole[]),

  createRole: (data: CreateSuperAdminRoleInput) =>
    api.post(ENDPOINTS.ADMIN.ROLE_CREATE, data).then((r) => (r.data?.data ?? r.data) as SuperAdminRole),

  updateRoleDefinition: (id: string, data: Partial<CreateSuperAdminRoleInput>) =>
    api.put(ENDPOINTS.ADMIN.ROLE_UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as SuperAdminRole),

  deleteRole: (id: string) =>
    api.delete(ENDPOINTS.ADMIN.ROLE_DELETE(id)).then((r) => r.data?.data ?? r.data),

  // Client Organizations & Subscription / Expiry Controls
  listOrganizations: () =>
    api.get(ENDPOINTS.ADMIN.ORGANIZATIONS_LIST).then((r) => (r.data?.data ?? r.data) as AdminOrganization[]),

  createOrganization: (data: {
    name: string;
    slug?: string;
    ownerMobile: string;
    ownerName?: string;
    ownerEmail?: string;
    planId?: string;
  }) =>
    api.post(ENDPOINTS.ADMIN.ORGANIZATION_CREATE, data).then((r) => r.data?.data ?? r.data),

  updateOrganization: (id: string, data: { name?: string; slug?: string }) =>
    api.put(ENDPOINTS.ADMIN.ORGANIZATION_UPDATE(id), data).then((r) => r.data?.data ?? r.data),

  deleteOrganization: (id: string) =>
    api.delete(ENDPOINTS.ADMIN.ORGANIZATION_DELETE(id)).then((r) => r.data?.data ?? r.data),

  updateSubscription: (orgId: string, data: UpdateSubscriptionInput) =>
    api.put(ENDPOINTS.ADMIN.ORGANIZATION_SUBSCRIPTION(orgId), data).then((r) => r.data?.data ?? r.data),

  // Dynamic Platform System Settings (Stored in DB)
  listSettings: () =>
    api.get(ENDPOINTS.ADMIN.SETTINGS_LIST).then((r) => (r.data?.data ?? r.data) as SystemSetting[]),

  updateSetting: (key: string, value: string) =>
    api.put(ENDPOINTS.ADMIN.SETTING_UPDATE(key), { value }).then((r) => (r.data?.data ?? r.data) as SystemSetting),

  // Platform Oversight
  listProperties: () =>
    api.get(ENDPOINTS.ADMIN.PROPERTIES_LIST).then((r) => (r.data?.data ?? r.data) as any[]),

  listLeases: () =>
    api.get(ENDPOINTS.ADMIN.LEASES_LIST).then((r) => (r.data?.data ?? r.data) as any[]),

  listMaintenance: () =>
    api.get(ENDPOINTS.ADMIN.MAINTENANCE_LIST).then((r) => (r.data?.data ?? r.data) as any[]),
};

