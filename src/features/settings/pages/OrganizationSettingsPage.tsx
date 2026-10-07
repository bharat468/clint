import { Building2, ShieldCheck, Users, Home } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { organizationService } from "@/services/organization.service";
import { propertyService } from "@/services/property.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";

export default function OrganizationSettingsPage() {
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Module Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Organization Profile
          </h2>
          <Badge tone="blue">Verified Landlord</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          General business entity metadata, unique organization slug, and portfolio overview.
        </p>
      </div>

      {/* Main Profile Card */}
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
    </div>
  );
}
