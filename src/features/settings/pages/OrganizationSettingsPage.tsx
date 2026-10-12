import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  Users,
  Home,
  CreditCard,
  Phone,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { organizationService } from "@/services/organization.service";
import { propertyService } from "@/services/property.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import type { Property } from "@/types";

export default function OrganizationSettingsPage() {
  const { data: orgs } = useApi(organizationService.list, [] as any[]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"PROFILE" | "PLAN">("PROFILE");

  const currentOrg =
    (selectedOrgId ? orgs.find((o: any) => o.id === selectedOrgId) : orgs[0]) || {
      id: "default",
      name: "Bharat Estates",
      slug: "bharat-estates",
    };

  const fetchMembers = async () => {
    let orgId = selectedOrgId || currentOrg?.id;
    if (!orgId || orgId === "default") {
      const list = await organizationService.list();
      if (list && list.length > 0) {
        orgId = list[0].id;
      }
    }
    if (orgId && orgId !== "default") {
      return organizationService.listMembers(orgId);
    }
    return [];
  };

  const { data: members } = useApi(fetchMembers, [] as any[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);

  const activeSub = currentOrg?.subscriptions?.[0] || null;
  const currentPlan = activeSub?.plan || {
    name: "Growth Tier",
    priceMonthly: 1499,
    maxProperties: 25,
    maxTenants: 60,
    maxStaff: 5,
  };

  const isExpired =
    activeSub?.expiresAt && new Date(activeSub.expiresAt).getTime() < Date.now();
  const daysRemaining = activeSub?.expiresAt
    ? Math.ceil(
        (new Date(activeSub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const propertyPct = Math.min(
    100,
    Math.round((properties.length / (currentPlan.maxProperties || 1)) * 100)
  );
  const staffPct = Math.min(
    100,
    Math.round((members.length / (currentPlan.maxStaff || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Organization & Plan
            </h2>
            <Badge tone="blue">Verified Landlord</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            General business entity metadata, unique organization slug, SaaS plan, and portfolio quotas.
          </p>
        </div>

        {/* Multi-organization switcher if user owns multiple organizations */}
        {orgs.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Workspace:</span>
            <div className="w-48">
              <Select
                value={selectedOrgId || currentOrg?.id || ""}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="h-8.5 text-xs font-bold"
              >
                {orgs.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("PROFILE")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "PROFILE"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Organization Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("PLAN")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "PLAN"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Plan & Quotas</span>
        </button>
      </div>

      {/* TAB 1: ORGANIZATION PROFILE */}
      {activeTab === "PROFILE" && (
        <Card className="p-6 bg-white border-slate-200 shadow-2xs space-y-6 rounded-2xl">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-xl shadow-xs">
              {(currentOrg?.name || "B")[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentOrg?.name || "Bharat Estates"}</h3>
              <p className="text-xs text-slate-400 font-mono">Organization ID: #{currentOrg?.id?.slice(-8) || "default"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Business Legal Name
              </span>
              <p className="font-bold text-slate-800 text-sm mt-1">{currentOrg?.name || "Bharat Estates"}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Workspace Handle / Slug
              </span>
              <p className="font-mono text-slate-800 text-sm mt-1">{currentOrg?.slug || "bharat-estates"}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Managed Real Estate Units
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Home className="h-4 w-4 text-blue-600" />
                <p className="font-bold text-slate-800 text-sm">{properties.length} Active Properties</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Onboarded Staff Accounts
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-indigo-600" />
                <p className="font-bold text-slate-800 text-sm">{members.length} Team Members</p>
              </div>
            </div>

            {currentOrg?.owner?.name && (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Owner / Account Holder
                </span>
                <p className="font-bold text-slate-800 text-sm mt-1">{currentOrg.owner.name}</p>
              </div>
            )}

            {currentOrg?.owner?.mobile && (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Registered Mobile Number
                </span>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-slate-800 text-sm">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{currentOrg.owner.mobile}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-100 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <p className="font-bold">Multi-Tenant Tenant Isolation Active</p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                Your organization data, tenant rent payments, leases, and properties are completely partitioned from other landlords on the platform.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: PLAN & QUOTAS */}
      {activeTab === "PLAN" && (
        <Card className="p-6 bg-white border-slate-200 shadow-2xs space-y-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xl shadow-xs">
                <CreditCard className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{currentPlan.name}</h3>
                  <Badge tone={isExpired ? "red" : "green"}>
                    {isExpired ? "Expired" : activeSub?.status || "Active Subscription"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeSub?.expiresAt
                    ? `Valid until ${new Date(activeSub.expiresAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })} (${daysRemaining} days remaining)`
                    : "Active Perpetual SaaS License"}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-slate-900">{formatINR(currentPlan.priceMonthly)}</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Properties Quota
              </span>
              <div className="flex items-center justify-between mt-1">
                <p className="font-bold text-slate-800 text-sm">
                  {properties.length} <span className="text-xs font-normal text-slate-400">/ {currentPlan.maxProperties} limit</span>
                </p>
                <Home className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${propertyPct}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Staff Accounts Quota
              </span>
              <div className="flex items-center justify-between mt-1">
                <p className="font-bold text-slate-800 text-sm">
                  {members.length} <span className="text-xs font-normal text-slate-400">/ {currentPlan.maxStaff} limit</span>
                </p>
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${staffPct}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Max Tenant Limit
              </span>
              <div className="flex items-center justify-between mt-1">
                <p className="font-bold text-slate-800 text-sm">
                  {currentPlan.maxTenants} <span className="text-xs font-normal text-slate-400">Tenants</span>
                </p>
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Platform tenant capacity</p>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-100 flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950">
              <p className="font-bold">Plan Quota Enforcement Notice</p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                When property or staff quotas are reached, or if your subscription reaches expiration, creating new units or onboarding additional staff will require an upgrade from Platform SuperAdmin.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
