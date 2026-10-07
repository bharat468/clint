import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  IndianRupee,
  Layers,
  Server,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { planService } from "@/services/plan.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { formatINR } from "@/lib/utils";
import type { Plan, AdminUser } from "@/types";

export default function SuperAdminOverviewPage() {
  const { data: overview, loading, error, reload } = useApi(adminService.getOverview, null);
  const { data: users } = useApi(adminService.listUsers, [] as AdminUser[]);
  const { data: plans } = useApi(planService.listPlans, [] as Plan[]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Platform Executive Vitals
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time multi-tenant telemetry, gross payment volume, and SaaS platform health.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => reload()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span>Refresh Vitals</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Total Users */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pre-Registered Users
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {overview?.totalUsers ?? users.length}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Strict login gate active</span>
                </div>
              </div>
            </Card>

            {/* Metric 2: Properties */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Managed Real Estate
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {overview?.totalProperties ?? 0}
                </div>
                <div className="mt-1.5 text-xs text-slate-500 font-medium">
                  Active portfolio units across landlords
                </div>
              </div>
            </Card>

            {/* Metric 3: Gross Rent Volume */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Gross Payment Volume
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-emerald-700">
                  {formatINR(overview?.totalCollected ?? 0)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Settled tenant payments</span>
                </div>
              </div>
            </Card>

            {/* Metric 4: Dynamic SaaS Plans */}
            <Card hoverEffect className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Dynamic Plans
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-700">{plans.length} Tiers</div>
                <div className="mt-1.5 text-xs text-slate-500 font-medium">
                  Customizable quota engines
                </div>
              </div>
            </Card>
          </div>

          {/* Infrastructure Health Box */}
          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                <span>Enterprise Multi-Tenant Infrastructure</span>
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-slate-500 font-medium">Database Cluster</p>
                <p className="text-sm font-bold text-slate-900 mt-1">PostgreSQL 16 via Prisma</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">Healthy & Low Latency</p>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-slate-500 font-medium">Authentication Protocol</p>
                <p className="text-sm font-bold text-slate-900 mt-1">Dual-Token (JWT + Cookie)</p>
                <p className="text-[11px] text-blue-600 mt-1 font-medium">Access: 15m | Refresh: 7d</p>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-slate-500 font-medium">Login Security Gate</p>
                <p className="text-sm font-bold text-slate-900 mt-1">Pre-Registered Mobile Numbers</p>
                <p className="text-[11px] text-indigo-600 mt-1 font-medium">Auto-reject unverified users</p>
              </div>
            </div>
          </Card>

          {/* Quick Platform Shortcuts */}
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

            <Link to="/superadmin/roles">
              <Card hoverEffect className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Platform RBAC</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Define master administrative roles</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
