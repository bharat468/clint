import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  IndianRupee,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Home,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { propertyService } from "@/services/property.service";
import { tenantService } from "@/services/tenant.service";
import { paymentService } from "@/services/payment.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { formatINR } from "@/lib/utils";
import { ReportsModal } from "@/features/reports/ReportsModal";
import type { Payment, Property, Tenant } from "@/types";

const fetchAll = async () => {
  const [properties, tenants, payments] = await Promise.all([
    propertyService.list(),
    tenantService.list(),
    paymentService.list(),
  ]);
  return { properties, tenants, payments };
};

const initial = {
  properties: [] as Property[],
  tenants: [] as Tenant[],
  payments: [] as Payment[],
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportTab, setReportTab] = useState<"collections" | "defaulters" | "pnl">("collections");
  const { data, loading, error } = useApi(fetchAll, initial);
  const properties = Array.isArray(data?.properties) ? data.properties : [];
  const tenants = Array.isArray(data?.tenants) ? data.tenants : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];

  // Financial Calculations
  const paidPayments = payments.filter((p) => p && p.status === "PAID");
  const pendingPayments = payments.filter((p) => p && p.status === "PENDING");
  const overduePayments = payments.filter((p) => p && p.status === "OVERDUE");

  const collectedAmount = paidPayments.reduce((a, p) => a + Number(p?.amount || 0), 0);
  const pendingAmount = [...pendingPayments, ...overduePayments].reduce((a, p) => a + Number(p?.amount || 0), 0);

  // Occupancy Calculations
  const occupiedProperties = properties.filter((p) => p && p.status === "OCCUPIED");
  const vacantProperties = properties.filter((p) => p && p.status === "VACANT");
  const occupancyRate =
    properties.length > 0 ? Math.round((occupiedProperties.length / properties.length) * 100) : 0;
  const collectionRate =
    payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0;

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? "Tenant";

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Portfolio Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time occupancy status, revenue collections, and tenant lease management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setReportTab("collections");
              setReportsOpen(true);
            }}
            className="gap-2 text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Reports</span>
          </Button>
          <Link to="/properties">
            <Button variant="outline" size="sm" className="gap-2 text-slate-700 font-semibold border-slate-300">
              <Home className="h-4 w-4 text-blue-600" />
              <span>Properties</span>
            </Button>
          </Link>
          <Link to="/payments">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </Button>
          </Link>
        </div>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <>
          {/* Top 4 KPI Metrics (Clickable Navigation to Modules) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Properties -> /properties */}
            <Card
              hoverEffect
              onClick={() => navigate("/properties")}
              className="p-5 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                  Total Properties
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {properties.length}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {occupiedProperties.length} Occupied
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-500">{vacantProperties.length} Vacant</span>
                </div>
              </div>
            </Card>

            {/* Metric 2: Active Tenants -> /tenants */}
            <Card
              hoverEffect
              onClick={() => navigate("/tenants")}
              className="p-5 cursor-pointer transition-all duration-200 hover:border-cyan-400 hover:shadow-md group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan-600 transition-colors">
                  Active Tenants
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-xs">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                  {tenants.length}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-cyan-700 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Assigned to rental leases</span>
                </div>
              </div>
            </Card>

            {/* Metric 3: Rent Collected -> /payments?status=PAID */}
            <Card
              hoverEffect
              onClick={() => navigate("/payments?status=PAID")}
              className="p-5 cursor-pointer transition-all duration-200 hover:border-emerald-400 hover:shadow-md group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors">
                  Rent Collected
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                  {formatINR(collectedAmount)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{paidPayments.length} payments completed</span>
                </div>
              </div>
            </Card>

            {/* Metric 4: Pending / Overdue -> /payments?status=PENDING */}
            <Card
              hoverEffect
              onClick={() => navigate("/payments?status=PENDING")}
              className="p-5 cursor-pointer transition-all duration-200 hover:border-amber-400 hover:shadow-md group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-amber-600 transition-colors">
                  Pending Dues
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                  {formatINR(pendingAmount)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {pendingPayments.length + overduePayments.length} pending / overdue invoices
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Rate Progress Card (Clean Light Theme) */}
          <Card className="p-6 border-slate-200/90 bg-white shadow-xs">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span className="tracking-wide">PORTFOLIO OCCUPANCY RATE</span>
                  <span className="font-bold text-blue-600 text-sm">{occupancyRate}%</span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {occupiedProperties.length} of {properties.length} total units currently occupied by active tenants.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span className="tracking-wide">COLLECTION EFFICIENCY</span>
                  <span className="font-bold text-emerald-600 text-sm">{collectionRate}%</span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {paidPayments.length} of {payments.length || 1} rental dues collected on schedule.
                </p>
              </div>
            </div>
          </Card>

          {/* Real Dashboard Widgets: Recent Payments & Property Status */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Widget 1: Recent Payments */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                  <p className="text-xs text-slate-500">Latest rent records and dues</p>
                </div>
                <Link
                  to="/payments"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No payment records logged yet.</div>
                ) : (
                  payments.slice(0, 5).map((p) => {
                    const statusTone =
                      p.status === "PAID" ? "green" : p.status === "PENDING" ? "yellow" : "red";
                    return (
                      <div key={p.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                            {tenantName(p.tenantId).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{tenantName(p.tenantId)}</p>
                            <p className="text-xs text-slate-500">{p.month}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{formatINR(p.amount)}</p>
                          <Badge tone={statusTone} dot className="mt-0.5">
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Widget 2: Portfolio Properties */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Portfolio Properties</h3>
                  <p className="text-xs text-slate-500">Status of registered apartments & homes</p>
                </div>
                <Link
                  to="/properties"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {properties.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No properties added yet.</div>
                ) : (
                  properties.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-500">
                            {p.city} • {p.bedrooms} BHK
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatINR(p.rent)}/mo</p>
                        <Badge tone={p.status === "VACANT" ? "green" : "purple"} dot className="mt-0.5">
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Financial & Operational Reports Modal (BRD Sec 25) */}
      <ReportsModal
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        defaultTab={reportTab}
      />
    </div>
  );
}
