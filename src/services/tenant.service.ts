import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Tenant, TenantInput } from "@/types";

export const tenantService = {
  list: () =>
    api.get(ENDPOINTS.TENANTS.LIST).then((r) => (r.data?.data ?? r.data) as Tenant[]),
  get: (id: string) =>
    api.get(ENDPOINTS.TENANTS.DETAIL(id)).then((r) => (r.data?.data ?? r.data) as Tenant),
  create: (data: TenantInput) =>
    api.post(ENDPOINTS.TENANTS.CREATE, data).then((r) => (r.data?.data ?? r.data) as Tenant),
  update: (id: string, data: Partial<TenantInput>) =>
    api.put(ENDPOINTS.TENANTS.UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as Tenant),
  remove: (id: string) =>
    api.delete(ENDPOINTS.TENANTS.DELETE(id)).then((r) => r.data?.data ?? r.data),
};
