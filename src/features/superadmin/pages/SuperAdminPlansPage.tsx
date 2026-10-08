import { useState } from "react";
import { Plus, CheckCircle2, Trash2, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import { planService } from "@/services/plan.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { formatINR } from "@/lib/utils";
import PlanModal from "../components/PlanModal";
import type { Plan } from "@/types";

export default function SuperAdminPlansPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManagePlans = canAccessPlatform(user, "PLATFORM_MANAGE_PLANS");

  const { data: plans, loading, error, reload: reloadPlans } = useApi(
    canManagePlans ? planService.listPlans : async () => [],
    [] as Plan[]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleToggleActive = async (p: Plan) => {
    try {
      await planService.updatePlan(p.id, { isActive: !p.isActive });
      showFeedback(`Plan "${p.name}" status updated to ${!p.isActive ? "Active" : "Inactive"}`);
      reloadPlans();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to update plan status", "error");
    }
  };

  const handleRequestDelete = (p: Plan) => {
    setDeletingPlan(p);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    setIsDeleting(true);
    try {
      await planService.deletePlan(deletingPlan.id);
      showFeedback(`Plan "${deletingPlan.name}" deleted successfully`);
      setDeletingPlan(null);
      reloadPlans();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to delete plan", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canManagePlans) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the required platform permission ('PLATFORM_MANAGE_PLANS') to manage SaaS subscription tiers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bottom Center Toast */}
      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Subscription Plans
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define subscription pricing tiers, property and tenant quotas, and plan features.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Plan</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card
              key={p.id}
              className="p-6 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xs hover:border-blue-300 transition-all"
            >
              {p.slug === "growth-plan" && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                  Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {p.slug}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">
                  {p.description || "Comprehensive property management tier"}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">{formatINR(p.priceMonthly)}</span>
                  <span className="text-xs text-slate-500"> / month</span>
                  <span className="text-[10px] text-slate-400 ml-2">({formatINR(p.priceYearly)}/yr)</span>
                </div>

                <div className="mt-4 space-y-2 rounded-xl bg-slate-50/80 p-3.5 text-xs border border-slate-100">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Max Properties:</span>
                    <span className="font-bold text-slate-900">{p.maxProperties} Units</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Max Tenants:</span>
                    <span className="font-bold text-slate-900">{p.maxTenants} Leases</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Staff Limit:</span>
                    <span className="font-bold text-slate-900">{p.maxStaff} Team Members</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Features:
                  </span>
                  <div className="space-y-1">
                    {(p.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(p)}
                  title={`Click to ${p.isActive ? "deactivate" : "activate"} plan tier`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                    p.isActive
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                      : "text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.isActive ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  {p.isActive ? "Active Tier" : "Inactive"}
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(p)}
                    className="text-xs h-7 px-2.5"
                  >
                    Edit Specs
                  </Button>
                  <button
                    onClick={() => handleRequestDelete(p)}
                    title="Delete Plan Tier"
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      <PlanModal
        open={modalOpen}
        planToEdit={editingPlan}
        onClose={() => setModalOpen(false)}
        onSuccess={(msg) => {
          showFeedback(msg);
          reloadPlans();
        }}
      />

      {/* Delete Plan Confirm Modal */}
      <ConfirmModal
        open={Boolean(deletingPlan)}
        title="Delete Plan Tier?"
        description={
          deletingPlan
            ? `Are you sure you want to permanently delete plan "${deletingPlan.name}"? Organizations currently subscribed to this tier should be transitioned to a different plan.`
            : "Are you sure you want to delete this plan?"
        }
        confirmText="Yes, Delete Plan"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingPlan(null)}
      />
    </div>
  );
}
