import { useState } from "react";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { planService } from "@/services/plan.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { formatINR } from "@/lib/utils";
import PlanModal from "../components/PlanModal";
import type { Plan } from "@/types";

export default function SuperAdminPlansPage() {
  const { data: plans, loading, error, reload: reloadPlans } = useApi(
    planService.listPlans,
    [] as Plan[]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Monetization & Quotas
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dynamic SaaS Pricing Plans
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define dynamic subscription pricing tiers, property and tenant quotas, and enabled feature flags.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Dynamic Plan</span>
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
                <span
                  className={`text-[11px] font-bold ${
                    p.isActive ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {p.isActive ? "Active Tier" : "Inactive"}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(p)}
                  className="text-xs"
                >
                  Edit Plan Specs
                </Button>
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
    </div>
  );
}
