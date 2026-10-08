export interface User {
  id: string;
  mobile: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role?: string;
  isSuperAdmin?: boolean;
  adminRole?: string;
  permissions?: string[];
  platformPermissions?: string[];
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  rent: number;
  bedrooms: number;
  status: "VACANT" | "OCCUPIED";
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    name?: string | null;
    mobile?: string;
    email?: string | null;
  } | null;
}
export type PropertyInput = Omit<Property, "id">;

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId?: string | null;
  property?: Property | null;
  leaseStart?: string;
  leaseEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}
export type TenantInput = Omit<Tenant, "id">;

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  tenant?: Tenant;
  property?: Property;
  amount: number;
  month: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidOn?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
export type PaymentInput = Omit<Payment, "id">;

export interface Permission {
  id: string;
  key: string;
  module: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  permissions: {
    permission: Permission;
  }[];
}

export interface AdminUser {
  id: string;
  mobile: string;
  name?: string | null;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt?: string;
  organizationMembers: {
    role: string;
    organization: { id: string; name: string };
  }[];
  userRoles: {
    propertyScope: string[];
    role: Role;
    organization: { id: string; name: string };
  }[];
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxProperties: number;
  maxTenants: number;
  maxStaff: number;
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformOverview {
  totalUsers: number;
  totalProperties: number;
  totalTenants: number;
  totalPayments: number;
  totalCollected: number;
  totalOrganizations: number;
  activePlans: number;
  activeSubscriptions: number;
  expiringSubscriptions: number;
  mrr: number;
  collectionRate: number;
}

export interface SuperAdminRole {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  owner?: {
    id: string;
    name?: string | null;
    mobile: string;
    email?: string | null;
  };
  memberCount: number;
  propertyCount: number;
  subscription?: {
    id: string;
    status: string;
    planId: string;
    planName?: string;
    planSlug?: string;
    maxProperties?: number;
    maxStaff?: number;
    expiresAt?: string | null;
  } | null;
  createdAt: string;
  updatedAt?: string;
}
