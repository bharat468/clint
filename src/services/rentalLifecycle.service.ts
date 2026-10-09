import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  type: string;
  areaSqFt?: number;
  rentAmount: number;
  depositAmount: number;
  furnishing: string;
  status: "VACANT" | "LISTED" | "APPLICATION_PENDING" | "OCCUPIED" | "MAINTENANCE";
  createdAt: string;
  property?: {
    id: string;
    title: string;
    city: string;
    address: string;
  };
  listings?: RentalListing[];
  leases?: Lease[];
}

export interface RentalListing {
  id: string;
  unitId: string;
  propertyId: string;
  title: string;
  description?: string;
  category: "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "OTHER";
  monthlyRent: number;
  securityDeposit: number;
  furnishing?: string;
  amenities: string[];
  photos: string[];
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  unit?: Unit;
  property?: {
    id: string;
    title: string;
    city: string;
    address: string;
  };
  applications?: RentalApplication[];
}

export interface RentalApplication {
  id: string;
  listingId: string;
  applicantId: string;
  name: string;
  email?: string;
  phone: string;
  occupation?: string;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  listing?: RentalListing;
  applicant?: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
  };
  lease?: Lease;
}

export interface RentRule {
  id: string;
  leaseId: string;
  frequency: string;
  dueDay: number;
  graceDays: number;
  penaltyType: string;
  penaltyAmount: number;
  maxPenaltyCap: number;
}

export interface RentSchedule {
  id: string;
  leaseId: string;
  period: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  penaltyAmount: number;
  status: "UPCOMING" | "DUE" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  paidOn?: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  depositPaid: number;
  depositStatus: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRING" | "EXPIRED" | "TERMINATED";
  property?: {
    id: string;
    title: string;
    city: string;
    address: string;
    owner?: {
      name: string;
      mobile: string;
    };
  };
  unit?: Unit;
  tenant?: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
  };
  rentRule?: RentRule;
  schedules?: RentSchedule[];
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unitId?: string;
  tenantId: string;
  assignedStaffId?: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  cost: number;
  notes?: string;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    city: string;
    address: string;
  };
  unit?: {
    id: string;
    unitNumber: string;
    type: string;
  };
  assignedStaff?: {
    id: string;
    name: string;
    mobile: string;
  };
}

export const rentalLifecycleService = {
  // Units
  async listUnits(propertyId?: string, status?: string) {
    const params: any = {};
    if (propertyId) params.propertyId = propertyId;
    if (status) params.status = status;
    const res = await api.get(ENDPOINTS.UNITS.LIST, { params });
    return res.data.data as Unit[];
  },

  async createUnit(data: Partial<Unit>) {
    const res = await api.post(ENDPOINTS.UNITS.CREATE, data);
    return res.data.data as Unit;
  },

  async updateUnit(id: string, data: Partial<Unit>) {
    const res = await api.patch(ENDPOINTS.UNITS.UPDATE(id), data);
    return res.data.data as Unit;
  },

  // Listings
  async listPublicListings(params?: any) {
    const res = await api.get(ENDPOINTS.LISTINGS.PUBLIC_LIST, { params });
    return res.data.data as RentalListing[];
  },

  async getPublicListing(id: string) {
    const res = await api.get(ENDPOINTS.LISTINGS.PUBLIC_DETAIL(id));
    return res.data.data as RentalListing;
  },

  async listOwnerListings(propertyId?: string) {
    const res = await api.get(ENDPOINTS.LISTINGS.OWNER_LIST, { params: { propertyId } });
    return res.data.data as RentalListing[];
  },

  async createListing(data: any) {
    const res = await api.post(ENDPOINTS.LISTINGS.CREATE, data);
    return res.data.data as RentalListing;
  },

  // Applications
  async submitApplication(data: {
    listingId: string;
    name: string;
    phone: string;
    occupation?: string;
    message?: string;
    proposedMoveIn?: string;
  }) {
    const res = await api.post(ENDPOINTS.APPLICATIONS.SUBMIT, data);
    return res.data.data as RentalApplication;
  },

  async listMyApplications() {
    const res = await api.get(ENDPOINTS.APPLICATIONS.MY_LIST);
    return res.data.data as RentalApplication[];
  },

  async listOwnerApplications(status?: string) {
    const res = await api.get(ENDPOINTS.APPLICATIONS.OWNER_LIST, { params: { status } });
    return res.data.data as RentalApplication[];
  },

  async approveApplication(id: string, rentRule?: any) {
    const res = await api.post(ENDPOINTS.APPLICATIONS.APPROVE(id), { rentRule });
    return res.data.data;
  },

  async rejectApplication(id: string, notes?: string) {
    const res = await api.post(ENDPOINTS.APPLICATIONS.REJECT(id), { notes });
    return res.data.data;
  },

  // Leases & My Rentals
  async listMyRentals() {
    const res = await api.get(ENDPOINTS.LEASES.MY_RENTALS);
    return res.data.data as Lease[];
  },

  async listOwnerLeases() {
    const res = await api.get(ENDPOINTS.LEASES.OWNER_LIST);
    return res.data.data as Lease[];
  },

  async payRentSchedule(scheduleId: string, amount: number) {
    const res = await api.post(ENDPOINTS.LEASES.PAY_SCHEDULE(scheduleId), { amount });
    return res.data.data;
  },

  // Maintenance
  async listMaintenanceTickets(propertyId?: string, status?: string) {
    const res = await api.get(ENDPOINTS.MAINTENANCE.LIST, { params: { propertyId, status } });
    return res.data.data as MaintenanceRequest[];
  },

  async listMyTenantTickets() {
    const res = await api.get(ENDPOINTS.MAINTENANCE.MY_LIST);
    return res.data.data as MaintenanceRequest[];
  },

  async createMaintenanceTicket(data: {
    propertyId: string;
    unitId?: string;
    title: string;
    description: string;
    category: string;
    priority: string;
  }) {
    const res = await api.post(ENDPOINTS.MAINTENANCE.CREATE, data);
    return res.data.data as MaintenanceRequest;
  },

  async updateMaintenanceStatus(id: string, status: string, cost?: number, notes?: string) {
    const res = await api.patch(ENDPOINTS.MAINTENANCE.STATUS(id), { status, cost, notes });
    return res.data.data as MaintenanceRequest;
  },
};
