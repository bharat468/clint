import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  Users,
  Home,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { organizationService } from "@/services/organization.service";
import { propertyService } from "@/services/property.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import type { Property } from "@/types";

export default function OrganizationSettingsPage() {
  const { data: orgs } = useApi(organizationService.list, [] as any[]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

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

  const [activeTab, setActiveTab] = useState<"ALL" | "PROFILE" | "PLAN">("ALL");

  const activeSub = currentOrg?.subscriptions?.[0] || null;
  const currentPlan = activeSub?.plan || {
    name: "Growth Tier",
    priceMonthly: 1499,
    priceYearly: 14990,
    maxProperties: 25,
    maxTenants: 60,
    maxStaff: 5,
    features: [
      "Property & Inventory Management",
      "Instant Mobile OTP Onboarding",
      "Digital Rent Receipts & Invoices",
      "Dynamic CRUD RBAC Matrix",
    ],
  };

  const isExpired =
    activeSub?.expiresAt && new Date(activeSub.expiresAt).getTime() < Date.now();
  const daysRemaining = activeSub?.expiresAt
    ? Math.ceil(
        (new Date(activeSub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // Quota percentages
  const propertyQuotaPct = Math.min(
    100,
    Math.round((properties.length / (currentPlan.maxProperties || 1)) * 100)
  );
  const staffQuotaPct = Math.min(
    100,
    Math.round((members.length / (currentPlan.maxStaff || 1)) * 100)
  );

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Building2 className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Organization & Subscription Plan
            </h2>
            <Badge tone="blue">Verified Landlord</Badge>
            <Badge tone={isExpired ? "red" : "green"}>
              {currentPlan.name}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Unified workspace control: business identity, tenant isolation, active SaaS plan, and real-time portfolio quotas.
          </p>
        </div>

        {/* Multi-organization switcher if user owns multiple organizations */}
        {orgs.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Workspace:</span>
            <select
              value={selectedOrgId || currentOrg?.id || ""}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {orgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Top Quick Vitals Metric Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Active Tier */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Active SaaS Tier
            </span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">{currentPlan.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {formatINR(currentPlan.priceMonthly)} / month
          </p>
        </div>

        {/* Metric 2: Properties Quota */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Properties Deployed
            </span>
            <Home className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {properties.length}{" "}
            <span className="text-xs font-normal text-slate-400">
              / {currentPlan.maxProperties} limit
            </span>
          </p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                propertyQuotaPct >= 90
                  ? "bg-rose-500"
                  : propertyQuotaPct >= 70
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${propertyQuotaPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Staff Accounts */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Team Staff Accounts
            </span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {members.length}{" "}
            <span className="text-xs font-normal text-slate-400">
              / {currentPlan.maxStaff} limit
            </span>
          </p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                staffQuotaPct >= 90
                  ? "bg-rose-500"
                  : staffQuotaPct >= 70
                  ? "bg-amber-500"
                  : "bg-indigo-600"
              }`}
              style={{ width: `${staffQuotaPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Multi-Tenant Partitioning */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Security & Isolation
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-emerald-700 flex items-center gap-1.5">
            <span>Isolated</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">
            {currentOrg?.slug || "primary-workspace"}
          </p>
        </div>
      </div>

      {/* 3. View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "ALL"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Unified View (Profile & Plan)</span>
        </button>

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
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>SaaS Subscription & Quotas</span>
        </button>
      </div>

      {/* 4. Main Body: Profile & Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* SECTION A: ORGANIZATION PROFILE */}
        {(activeTab === "ALL" || activeTab === "PROFILE") && (
          <div className="space-y-6">
            <Card className="p-6 bg-white border-slate-200/90 shadow-2xs rounded-2xl space-y-6">
              {/* Header with Avatar Initial */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl shadow-md shadow-blue-500/20">
                    {(currentOrg?.name || "B")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {currentOrg?.name || "Bharat Estates"}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: #{currentOrg?.id?.slice(-8) || "default"}
                    </p>
                  </div>
                </div>
                <Badge tone="blue">Active Entity</Badge>
              </div>

              {/* Business Entity Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Business Legal Name
                  </span>
                  <p className="font-bold text-slate-800 text-sm mt-1 truncate">
                    {currentOrg?.name || "Bharat Estates"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Workspace Handle / Slug
                  </span>
                  <p className="font-mono text-slate-800 text-sm mt-1 truncate">
                    {currentOrg?.slug || "bharat-estates"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Owner / Account Holder
                  </span>
                  <p className="font-bold text-slate-800 text-sm mt-1 truncate">
                    {currentOrg?.owner?.name || "Landlord Account"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Registered Mobile Number
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-slate-800 font-bold text-sm">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{currentOrg?.owner?.mobile || "Not specified"}</span>
                  </div>
                </div>

                {currentOrg?.owner?.email && (
                  <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Registered Corporate Email
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-medium">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{currentOrg.owner.email}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Isolation Assurance */}
              <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">Multi-Tenant Tenant Isolation Active</p>
                  <p className="mt-0.5 text-slate-600 leading-relaxed">
                    Your properties, tenant rent ledgers, staff assignments, and lease contracts are securely sandboxed and completely partitioned from other platform landlords.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION B: SAAS SUBSCRIPTION PLAN & QUOTAS */}
        {(activeTab === "ALL" || activeTab === "PLAN") && (
          <div className="space-y-6">
            {/* Premium Gradient SaaS Plan Card */}
            <Card className="p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl shadow-xl space-y-6 border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                      Active SaaS License
                    </span>
                    {isExpired ? (
                      <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                        EXPIRED
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {activeSub?.status || "ACTIVE"}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-2xl font-black text-white tracking-tight">
                    {currentPlan.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    <span>
                      {activeSub?.expiresAt
                        ? `Valid until ${new Date(activeSub.expiresAt).toLocaleDateString(
                            "en-IN",
                            { year: "numeric", month: "short", day: "numeric" }
                          )} (${daysRemaining} days remaining)`
                        : "Active Perpetual SaaS License"}
                    </span>
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-3xl font-extrabold text-white">
                    {formatINR(currentPlan.priceMonthly)}
                  </span>
                  <span className="text-xs text-slate-300 block">/ monthly billing</span>
                </div>
              </div>

              {/* Quota Progress Meters */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                  Resource Quota Utilization
                </p>

                {/* Meter 1: Properties */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Managed Properties</span>
                    <span className="font-bold text-white">
                      {properties.length} / {currentPlan.maxProperties}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        propertyQuotaPct >= 90
                          ? "bg-rose-400"
                          : propertyQuotaPct >= 70
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      }`}
                      style={{ width: `${propertyQuotaPct}%` }}
                    />
                  </div>
                </div>

                {/* Meter 2: Staff */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Onboarded Staff Accounts</span>
                    <span className="font-bold text-white">
                      {members.length} / {currentPlan.maxStaff}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        staffQuotaPct >= 90
                          ? "bg-rose-400"
                          : staffQuotaPct >= 70
                          ? "bg-amber-400"
                          : "bg-indigo-400"
                      }`}
                      style={{ width: `${staffQuotaPct}%` }}
                    />
                  </div>
                </div>

                {/* Meter 3: Tenants Capacity */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Maximum Tenant Network Capacity</span>
                    <span className="font-bold text-white">
                      Up to {currentPlan.maxTenants} Tenants
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              {currentPlan.features && currentPlan.features.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80">
                  <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">
                    Included Capabilities
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    {currentPlan.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Quota Policy Card */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-4 text-xs text-slate-600 space-y-1 shadow-2xs">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>Need Higher Quotas or Custom Extensions?</span>
              </p>
              <p className="leading-relaxed text-slate-500">
                To expand your properties limit, staff capacity, or upgrade to Corporate Enterprise tiers, please contact your Platform SuperAdmin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
