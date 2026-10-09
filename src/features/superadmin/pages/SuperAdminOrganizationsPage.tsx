import { useState } from "react";
import { Search, RefreshCw, Calendar, ShieldAlert, Plus, Pencil, Trash2, Clock, Building2 } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { planService } from "@/services/plan.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { Toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import SubscriptionModal from "../components/SubscriptionModal";
import OrganizationModal from "../components/OrganizationModal";
import { formatDateTime } from "@/lib/utils";
import type { AdminOrganization, Plan } from "@/types";

export default function SuperAdminOrganizationsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManageOrgs = canAccessPlatform(user, "PLATFORM_MANAGE_ORGANIZATIONS");

  const { data: orgs, loading, error, reload: reloadOrgs } = useApi(
    canManageOrgs ? adminService.listOrganizations : async () => [],
    [] as AdminOrganization[]
  );
  const { data: plans } = useApi(planService.listPlans, [] as Plan[]);

  const [searchOrg, setSearchOrg] = useState("");
  const [selectedOrgForSub, setSelectedOrgForSub] = useState<AdminOrganization | null>(null);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<AdminOrganization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setOrgModalOpen(true);
  };

  const handleOpenEdit = (o: AdminOrganization) => {
    setEditingOrg(o);
    setOrgModalOpen(true);
  };

  const handleRequestDelete = (o: AdminOrganization) => {
    setDeletingOrg(o);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrg) return;
    setIsDeleting(true);
    try {
      await adminService.deleteOrganization(deletingOrg.id);
      showFeedback(`Organization "${deletingOrg.name}" deleted successfully`);
      setDeletingOrg(null);
      reloadOrgs();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to delete organization", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleOrgStatus = async (o: AdminOrganization) => {
    const currentStatus = o.subscription?.status || "ACTIVE";
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateSubscription(o.id, { status: nextStatus });
      showFeedback(`Organization "${o.name}" status updated to ${nextStatus}`);
      reloadOrgs();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to update organization status", "error");
    }
  };

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.slug?.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.owner?.mobile?.includes(searchOrg)
  );

  if (!canManageOrgs) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the platform permission ('PLATFORM_MANAGE_ORGANIZATIONS') required to manage organizations and portfolios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Landlords & Client Organizations
            </h1>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60">
              {orgs.length} Landlords
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Provision and oversee client landlord accounts, assigned SaaS plans, quotas, and portal access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reloadOrgs()}
            className="gap-1.5 text-slate-700 font-semibold border-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Onboard Landlord</span>
          </Button>
        </div>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, slug or mobile..."
              value={searchOrg}
              onChange={(e) => setSearchOrg(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* Table */}
          <Card className="overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Organization</th>
                    <th className="px-5 py-3.5">Owner Contact</th>
                    <th className="px-5 py-3.5">Active SaaS Plan</th>
                    <th className="px-5 py-3.5">Quotas Used</th>
                    <th className="px-5 py-3.5">Plan Expiry Date</th>
                    <th className="px-5 py-3.5">Created & Updated</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No organizations found. Click &quot;New Organization&quot; to provision a client portfolio.
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((o) => {
                      const sub = o.subscription;
                      const isExpired = sub?.expiresAt && new Date(sub.expiresAt).getTime() < Date.now();
                      const daysRemaining = sub?.expiresAt
                        ? Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 text-sm">{o.name}</div>
                            <div className="font-mono text-[11px] text-slate-400">{o.slug}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-800">{o.owner?.name || "Landlord"}</div>
                            <div className="font-mono text-[11px] text-slate-500">{o.owner?.mobile}</div>
                            {o.owner?.email && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{o.owner.email}</div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                              {sub?.planName || "Starter Plan"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-[11px] space-y-0.5">
                              <div>
                                <span className="text-slate-400">Properties: </span>
                                <span className="font-bold text-slate-800">{o.propertyCount}</span>
                                <span className="text-slate-400"> / {sub?.maxProperties ?? "∞"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Staff: </span>
                                <span className="font-bold text-slate-800">{o.memberCount}</span>
                                <span className="text-slate-400"> / {sub?.maxStaff ?? "∞"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {sub?.expiresAt ? (
                              <div>
                                <div className="font-medium text-slate-800">
                                  {new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div
                                  className={`text-[10px] font-bold ${
                                    isExpired
                                      ? "text-rose-600"
                                      : daysRemaining !== null && daysRemaining <= 15
                                      ? "text-amber-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {isExpired
                                    ? "EXPIRED"
                                    : daysRemaining !== null
                                    ? `${daysRemaining} days left`
                                    : ""}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Lifetime / None</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-700">
                                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{formatDateTime(o.createdAt)}</span>
                              </div>
                              {o.updatedAt && o.updatedAt !== o.createdAt && (
                                <div className="text-[10px] text-slate-400">
                                  Updated: {formatDateTime(o.updatedAt)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleOrgStatus(o)}
                              title="Click to toggle Active / Suspended status"
                              className="transition-transform active:scale-95"
                            >
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                                  sub?.status === "SUSPENDED"
                                    ? "text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                                    : isExpired
                                    ? "text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                                    : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    sub?.status === "SUSPENDED"
                                      ? "bg-rose-500"
                                      : isExpired
                                      ? "bg-rose-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                {sub?.status === "SUSPENDED" ? "SUSPENDED" : isExpired ? "EXPIRED" : "ACTIVE"}
                              </span>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrgForSub(o)}
                                className="text-xs gap-1.5 h-7"
                                title="Change SaaS Subscription Plan"
                              >
                                <Calendar className="h-3 w-3 text-blue-600" />
                                <span>Plan</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(o)}
                                className="text-slate-500 hover:text-blue-600 p-1.5 h-7 w-7 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Edit Organization Details"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRequestDelete(o)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 h-7 w-7 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete Organization"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Organization Modal (Create & Edit) */}
      <OrganizationModal
        open={orgModalOpen}
        orgToEdit={editingOrg}
        plans={plans}
        onClose={() => {
          setOrgModalOpen(false);
          setEditingOrg(null);
        }}
        onSuccess={(msg) => {
          showFeedback(msg);
          reloadOrgs();
        }}
      />

      {/* Subscription Plan Modal */}
      <SubscriptionModal
        org={selectedOrgForSub}
        plans={plans}
        onClose={() => setSelectedOrgForSub(null)}
        onSuccess={(msg) => {
          showFeedback(msg);
          reloadOrgs();
        }}
      />

      {/* Delete Organization Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingOrg)}
        title="Delete Client Organization?"
        description={
          deletingOrg
            ? `Are you sure you want to permanently delete "${deletingOrg.name}" (${deletingOrg.slug})? All properties, tenants, team memberships, and associated subscriptions in this organization will be removed.`
            : "Are you sure you want to delete this organization?"
        }
        confirmText="Yes, Delete Organization"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingOrg(null)}
      />
    </div>
  );
}
