import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { Plan } from "@/types";

export interface CreatePlanInput {
  name: string;
  slug?: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxProperties: number;
  maxTenants: number;
  maxStaff: number;
  features: string[];
  isActive?: boolean;
}

export const planService = {
  listPlans: () =>
    api.get(ENDPOINTS.PLANS.LIST).then((r) => (r.data?.data ?? r.data) as Plan[]),

  createPlan: (data: CreatePlanInput) =>
    api.post(ENDPOINTS.PLANS.CREATE, data).then((r) => (r.data?.data ?? r.data) as Plan),

  updatePlan: (id: string, data: Partial<CreatePlanInput>) =>
    api.put(ENDPOINTS.PLANS.UPDATE(id), data).then((r) => (r.data?.data ?? r.data) as Plan),

  deletePlan: (id: string) =>
    api.delete(ENDPOINTS.PLANS.DELETE(id)).then((r) => r.data?.data ?? r.data),
};
