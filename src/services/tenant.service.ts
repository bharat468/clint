import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Tenant, TenantInput } from "@/types";

export const tenantService = {
  list: () => api.get<Tenant[]>(ENDPOINTS.TENANTS.LIST).then((r) => r.data),
  get: (id: string) => api.get<Tenant>(ENDPOINTS.TENANTS.DETAIL(id)).then((r) => r.data),
  create: (data: TenantInput) => api.post<Tenant>(ENDPOINTS.TENANTS.CREATE, data).then((r) => r.data),
  update: (id: string, data: Partial<TenantInput>) =>
    api.put<Tenant>(ENDPOINTS.TENANTS.UPDATE(id), data).then((r) => r.data),
  remove: (id: string) => api.delete(ENDPOINTS.TENANTS.DELETE(id)).then((r) => r.data),
};
