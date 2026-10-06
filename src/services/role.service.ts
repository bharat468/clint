import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Role, Permission } from "@/types";

export interface CreateRoleInput {
  name: string;
  slug?: string;
  description?: string;
  permissionKeys: string[];
  organizationId?: string;
}

export const roleService = {
  listRoles: () =>
    api.get(ENDPOINTS.ROLES.LIST).then((r) => (r.data?.data ?? r.data) as Role[]),

  listPermissions: () =>
    api.get(ENDPOINTS.ROLES.PERMISSIONS).then((r) => (r.data?.data ?? r.data) as Permission[]),

  createRole: (data: CreateRoleInput) =>
    api.post(ENDPOINTS.ROLES.CREATE, data).then((r) => (r.data?.data ?? r.data) as Role),

  updateRole: (id: string, data: Partial<CreateRoleInput>) =>
    api.put(ENDPOINTS.ROLES.UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as Role),

  deleteRole: (id: string) =>
    api.delete(ENDPOINTS.ROLES.DELETE(id)).then((r) => r.data?.data ?? r.data),
};
