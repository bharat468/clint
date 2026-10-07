import { CreditCard } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { organizationService } from "@/services/organization.service";
import { propertyService } from "@/services/property.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import type { Property } from "@/types";

export default function BillingSettingsPage() {
  const { data: orgs } = useApi(organizationService.list, [] as any[]);
  const currentOrg = orgs[0] || { id: "default", name: "Bharat Estates", slug: "bharat-estates" };

  const fetchMembers = async () => {
    if (!currentOrg?.id || currentOrg.id === "default") {
      const list = await organizationService.list();
      if (list && list.length > 0) {
        return organizationService.listMembers(list[0].id);
      }
      return [];
    }
    return organizationService.listMembers(currentOrg.id);
  };

  const { data: members } = useApi(fetchMembers, [] as any[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);

  const activeSub = currentOrg?.subscriptions?.[0] || null;
  const currentPlan = activeSub?.plan || {
    name: "Growth Plan",
    priceMonthly: 1499,
    maxProperties: 25,
    maxTenants: 60,
    maxStaff: 5,
  };
  const isExpired = activeSub?.expiresAt && new Date(activeSub.expiresAt).getTime() < Date.now();
  const daysRemaining = activeSub?.expiresAt
    ? Math.ceil((new Date(activeSub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Module Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CreditCard className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Subscription Plan & Quotas
          </h2>
          <Badge tone={isExpired ? "red" : "green"}>
            {isExpired ? "Expired" : "Active Subscription"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Review your subscription tier, track portfolio quota usage, and manage license longevity.
        </p>
      </div>

      {/* Plan Card */}
      <Card className="p-7 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="blue" className="bg-blue-800/80 text-blue-200 border-none">
                Active Tier
              </Badge>
              {isExpired ? (
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                  EXPIRED
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  {activeSub?.status || "ACTIVE"}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-2xl font-black">{currentPlan.name}</h3>
            <p className="mt-1 text-xs text-blue-200">
              {activeSub?.expiresAt
                ? `Valid until ${new Date(activeSub.expiresAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })} (${daysRemaining} days remaining)`
                : "Active Perpetual SaaS License"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold">{formatINR(currentPlan.priceMonthly)}</span>
            <span className="text-xs text-blue-200"> / month</span>
          </div>
        </div>

        {/* Quota Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-blue-800/80 pt-5 text-center">
          <div className="rounded-xl bg-blue-950/40 p-3 border border-blue-800/50">
            <p className="text-2xl font-bold">
              {properties.length} <span className="text-sm font-normal text-blue-300">/ {currentPlan.maxProperties}</span>
            </p>
            <p className="text-[11px] text-blue-200 mt-0.5 font-medium">Properties Deployed</p>
          </div>
          <div className="rounded-xl bg-blue-950/40 p-3 border border-blue-800/50">
            <p className="text-2xl font-bold">
              {members.length} <span className="text-sm font-normal text-blue-300">/ {currentPlan.maxStaff}</span>
            </p>
            <p className="text-[11px] text-blue-200 mt-0.5 font-medium">Staff Accounts Used</p>
          </div>
          <div className="rounded-xl bg-blue-950/40 p-3 border border-blue-800/50">
            <p className="text-2xl font-bold">
              {currentPlan.maxTenants}
            </p>
            <p className="text-[11px] text-blue-200 mt-0.5 font-medium">Max Tenant Limit</p>
          </div>
        </div>
      </Card>

      {/* Quota Policy Note */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
        <p className="font-bold text-slate-800">Plan Quota Enforcement Notice:</p>
        <p className="leading-relaxed">
          When property or staff quotas are reached, or if your subscription reaches expiration, creating new units or onboarding additional staff will require an upgrade from Platform SuperAdmin.
        </p>
      </div>
    </div>
  );
}
