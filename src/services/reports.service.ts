import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export interface MonthlyCollectionReportItem {
  id: string;
  receiptNo: string;
  month: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyAddress: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidOn: string | null;
  createdAt: string;
}

export interface MonthlyCollectionReportResponse {
  summary: {
    filterMonth: string;
    filterPropertyId: string;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    totalExpected: number;
    collectionRate: number;
    totalTransactions: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  items: MonthlyCollectionReportItem[];
}

export interface DefaulterReportItem {
  id: string;
  source: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyId: string;
  propertyTitle: string;
  unitNumber: string;
  month: string;
  dueDate: string;
  daysOverdue: number;
  baseAmount: number;
  penaltyAmount: number;
  totalOutstanding: number;
  status: "DUE" | "OVERDUE" | "PENDING" | string;
}

export interface DefaulterReportResponse {
  summary: {
    totalDefaulters: number;
    totalOverdueAmount: number;
    totalPenaltyAccrued: number;
    totalOutstanding: number;
  };
  items: DefaulterReportItem[];
}

export interface PropertyPnlReportItem {
  propertyId: string;
  propertyTitle: string;
  address: string;
  city: string;
  status: string;
  monthlyRentBase: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  grossIncome: number;
  pendingReceivables: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  maintenanceTicketsCount: number;
  resolvedTicketsCount: number;
}

export interface PropertyPnlReportResponse {
  summary: {
    totalProperties: number;
    portfolioRevenue: number;
    portfolioPending: number;
    portfolioExpenses: number;
    netOperatingIncome: number;
    portfolioMargin: number;
  };
  items: PropertyPnlReportItem[];
}

export const reportsService = {
  getMonthlyCollections: (params?: { month?: string; propertyId?: string }) =>
    api
      .get(ENDPOINTS.REPORTS.MONTHLY_COLLECTIONS, { params })
      .then((r) => (r.data?.data ?? r.data) as MonthlyCollectionReportResponse),

  getDefaulters: () =>
    api
      .get(ENDPOINTS.REPORTS.DEFAULTERS)
      .then((r) => (r.data?.data ?? r.data) as DefaulterReportResponse),

  getPropertyPnl: () =>
    api
      .get(ENDPOINTS.REPORTS.PROPERTY_PNL)
      .then((r) => (r.data?.data ?? r.data) as PropertyPnlReportResponse),
};
