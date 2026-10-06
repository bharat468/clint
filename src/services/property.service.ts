import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Property, PropertyInput } from "@/types";

export const propertyService = {
  list: () =>
    api.get(ENDPOINTS.PROPERTIES.LIST).then((r) => (r.data?.data ?? r.data) as Property[]),
  get: (id: string) =>
    api.get(ENDPOINTS.PROPERTIES.DETAIL(id)).then((r) => (r.data?.data ?? r.data) as Property),
  create: (data: PropertyInput) =>
    api.post(ENDPOINTS.PROPERTIES.CREATE, data).then((r) => (r.data?.data ?? r.data) as Property),
  update: (id: string, data: Partial<PropertyInput>) =>
    api.put(ENDPOINTS.PROPERTIES.UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as Property),
  remove: (id: string) =>
    api.delete(ENDPOINTS.PROPERTIES.DELETE(id)).then((r) => r.data?.data ?? r.data),
};
