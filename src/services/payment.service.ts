import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Payment, PaymentInput } from "@/types";

export const paymentService = {
  list: () => api.get<Payment[]>(ENDPOINTS.PAYMENTS.LIST).then((r) => r.data),
  get: (id: string) => api.get<Payment>(ENDPOINTS.PAYMENTS.DETAIL(id)).then((r) => r.data),
  create: (data: PaymentInput) => api.post<Payment>(ENDPOINTS.PAYMENTS.CREATE, data).then((r) => r.data),
  update: (id: string, data: Partial<PaymentInput>) =>
    api.put<Payment>(ENDPOINTS.PAYMENTS.UPDATE(id), data).then((r) => r.data),
  remove: (id: string) => api.delete(ENDPOINTS.PAYMENTS.DELETE(id)).then((r) => r.data),
};
