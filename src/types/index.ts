export interface User {
  id: string;
  mobile: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role?: "OWNER" | "TENANT" | "ADMIN";
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  rent: number;
  bedrooms: number;
  status: "VACANT" | "OCCUPIED";
}
export type PropertyInput = Omit<Property, "id">;

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId?: string | null;
  leaseStart?: string;
  leaseEnd?: string;
}
export type TenantInput = Omit<Tenant, "id">;

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  month: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidOn?: string | null;
}
export type PaymentInput = Omit<Payment, "id">;
