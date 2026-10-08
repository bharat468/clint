import { useState, useEffect } from "react";
import { X, Layers, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Plan } from "@/types";
import { planService, type CreatePlanInput } from "@/services/plan.service";

interface PlanModalProps {
  open: boolean;
  planToEdit: Plan | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function PlanModal({
  open,
  planToEdit,
  onClose,
  onSuccess,
}: PlanModalProps) {
  const [formData, setFormData] = useState<CreatePlanInput>({
    name: "",
    slug: "",
    description: "",
    priceMonthly: 999,
    priceYearly: 9999,
    maxProperties: 10,
    maxTenants: 25,
    maxStaff: 3,
    features: [],
    isActive: true,
  });
  const [featuresInput, setFeaturesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name,
        slug: planToEdit.slug,
        description: planToEdit.description || "",
        priceMonthly: planToEdit.priceMonthly,
        priceYearly: planToEdit.priceYearly,
        maxProperties: planToEdit.maxProperties,
        maxTenants: planToEdit.maxTenants,
        maxStaff: planToEdit.maxStaff,
        features: planToEdit.features || [],
        isActive: planToEdit.isActive,
      });
      setFeaturesInput((planToEdit.features || []).join(", "));
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        priceMonthly: 999,
        priceYearly: 9999,
        maxProperties: 10,
        maxTenants: 25,
        maxStaff: 3,
        features: [
          "Unlimited automated rent receipts",
          "Real-time SMS & WhatsApp alerts",
          "Team role delegation",
        ],
        isActive: true,
      });
      setFeaturesInput(
        "Unlimited automated rent receipts, Real-time SMS & WhatsApp alerts, Team role delegation"
      );
    }
    setError(null);
  }, [planToEdit, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const features = featuresInput
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        features,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };

      if (planToEdit) {
        await planService.updatePlan(planToEdit.id, payload);
        onSuccess(`Successfully updated dynamic plan: ${payload.name}`);
      } else {
        await planService.createPlan(payload);
        onSuccess(`Successfully created new dynamic plan: ${payload.name}`);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-xl w-full bg-white border border-slate-200 p-6 text-slate-900 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>{planToEdit ? "Edit Subscription Plan" : "Create Subscription Plan"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure plan pricing, resource limits, and feature flags
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Plan Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pro Landlord Suite"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">URL Identifier (Slug)</label>
              <input
                type="text"
                placeholder="e.g. pro-landlord"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <input
              type="text"
              placeholder="Target audience or tier highlight..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Monthly Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.priceMonthly}
                onChange={(e) =>
                  setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Yearly Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.priceYearly}
                onChange={(e) =>
                  setFormData({ ...formData, priceYearly: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Max Properties</label>
              <input
                type="number"
                min="1"
                value={formData.maxProperties}
                onChange={(e) =>
                  setFormData({ ...formData, maxProperties: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Max Tenants</label>
              <input
                type="number"
                min="1"
                value={formData.maxTenants}
                onChange={(e) =>
                  setFormData({ ...formData, maxTenants: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Max Staff Accounts</label>
              <input
                type="number"
                min="1"
                value={formData.maxStaff}
                onChange={(e) =>
                  setFormData({ ...formData, maxStaff: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Features (Comma-separated)</label>
            <textarea
              rows={2}
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Automated rent receipts, SMS & WhatsApp alerts, Team roles"
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="planIsActiveModal"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="planIsActiveModal" className="text-slate-700 font-medium">
              Plan is currently active and available for subscription assignment
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5"
            >
              {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{planToEdit ? "Update Plan Specs" : "Publish Dynamic Plan"}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
