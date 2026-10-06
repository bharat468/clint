import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Property, PropertyInput } from "@/types";

export const propertyService = {
  list: () => api.get<Property[]>(ENDPOINTS.PROPERTIES.LIST).then((r) => r.data),
  get: (id: string) => api.get<Property>(ENDPOINTS.PROPERTIES.DETAIL(id)).then((r) => r.data),
  create: (data: PropertyInput) => api.post<Property>(ENDPOINTS.PROPERTIES.CREATE, data).then((r) => r.data),
  update: (id: string, data: Partial<PropertyInput>) =>
    api.put<Property>(ENDPOINTS.PROPERTIES.UPDATE(id), data).then((r) => r.data),
  remove: (id: string) => api.delete(ENDPOINTS.PROPERTIES.DELETE(id)).then((r) => r.data),
};
