import { Link } from "react-router-dom";
import {
  Building2,
  IndianRupee,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Sliders,
  Users,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { planService } from "@/services/plan.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { formatINR } from "@/lib/utils";
import type { Plan, AdminOrganization } from "@/types";

export default function SuperAdminOverviewPage() {
  const { data: overview, loading, error, reload } = useApi(adminService.getOverview, null);
  const { data: orgs } = useApi(adminService.listOrganizations, [] as AdminOrganization[]);
  const { data: plans } = useApi(planService.listPlans, [] as Plan[]);

  const expiringOrgs = orgs.filter((o) => {
    if (!o.subscription?.expiresAt) return false;
    const diffDays = Math.ceil(
      (new Date(o.subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 0 && diffDays <= 15;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Business Executive
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Platform Executive Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time monthly recurring revenue, client subscription portfolio health, and property telemetry.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => reload()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span>Refresh Metrics</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <>
          {/* Top 4 Business KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Monthly Recurring Revenue (MRR) */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Monthly Revenue (MRR)
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-emerald-700">
                  {formatINR(overview?.mrr ?? 0)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>ARR Projection:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatINR((overview?.mrr ?? 0) * 12)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Metric 2: Client Organizations (Landlords) */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Client Organizations
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {overview?.totalOrganizations ?? orgs.length}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-blue-700 font-medium">
                  <span>{overview?.activeSubscriptions ?? 0} active subscriptions</span>
                </div>
              </div>
            </Card>

            {/* Metric 3: Managed Units & Leases */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Units & Tenant Leases
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {overview?.totalProperties ?? 0} <span className="text-sm font-normal text-slate-400">Props</span>
                </div>
                <div className="mt-1.5 text-xs text-slate-500 font-medium">
                  {overview?.totalTenants ?? 0} active tenant leases
                </div>
              </div>
            </Card>

            {/* Metric 4: Gross Settled Rent Volume */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Gross Settled Rent
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-700">
                  {formatINR(overview?.totalCollected ?? 0)}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-purple-700 font-medium">
                  <span>{overview?.collectionRate ?? 100}% collection rate</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Required: Expiring Subscriptions Notification */}
          {expiringOrgs.length > 0 && (
            <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 sm:p-5 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-950">
                      {expiringOrgs.length} Subscription{expiringOrgs.length > 1 ? "s" : ""} Expiring Soon (Action Required)
                    </h3>
                    <Link
                      to="/superadmin/organizations"
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Review Organizations</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Client organizations will hit their grace period window unless their renewal is processed or tier adjusted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Commercial Monetization & Tiers Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Dynamic SaaS Tiers */}
            <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Active Commercial SaaS Tiers</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {plans.length} dynamic pricing plans configured in database
                  </p>
                </div>
                <Link to="/superadmin/plans">
                  <Button variant="outline" size="sm" className="text-xs">
                    Manage Plans
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {plans.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {p.slug}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Up to {p.maxProperties} properties • {p.maxStaff} staff members
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatINR(p.priceMonthly)}</span>
                      <span className="text-[11px] text-slate-400">/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Box 2: Portfolio Health & Conversion */}
            <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Platform Health & Client Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Portfolio metrics across registered landlord organizations
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-slate-600">Active Paid Subscriptions</span>
                  <span className="font-bold text-emerald-700">
                    {overview?.activeSubscriptions ?? 0} Organizations
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-slate-600">Expiring in &lt; 15 Days</span>
                  <span className="font-bold text-amber-700">
                    {overview?.expiringSubscriptions ?? 0} Organizations
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-slate-600">Total Pre-Registered Accounts</span>
                  <span className="font-bold text-slate-900">
                    {overview?.totalUsers ?? 0} Users
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Business Operations Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/superadmin/organizations">
              <Card hoverEffect className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Organizations & Expiry</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Manage landlord tiers & renewal dates</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </Card>
            </Link>

            <Link to="/superadmin/plans">
              <Card hoverEffect className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dynamic SaaS Plans</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Edit pricing tiers and quota limits</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </Card>
            </Link>

            <Link to="/superadmin/settings">
              <Card hoverEffect className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Platform Settings</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Dynamic DB settings & global parameters</p>
                </div>
                <Sliders className="h-4 w-4 text-blue-600" />
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
