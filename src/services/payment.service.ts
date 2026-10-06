import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Payment, PaymentInput } from "@/types";

export const paymentService = {
  list: () =>
    api.get(ENDPOINTS.PAYMENTS.LIST).then((r) => (r.data?.data ?? r.data) as Payment[]),
  get: (id: string) =>
    api.get(ENDPOINTS.PAYMENTS.DETAIL(id)).then((r) => (r.data?.data ?? r.data) as Payment),
  create: (data: PaymentInput) =>
    api.post(ENDPOINTS.PAYMENTS.CREATE, data).then((r) => (r.data?.data ?? r.data) as Payment),
  update: (id: string, data: Partial<PaymentInput>) =>
    api.put(ENDPOINTS.PAYMENTS.UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as Payment),
  remove: (id: string) =>
    api.delete(ENDPOINTS.PAYMENTS.DELETE(id)).then((r) => r.data?.data ?? r.data),
};
