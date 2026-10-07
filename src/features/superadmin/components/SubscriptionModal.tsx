import { useState, useEffect } from "react";
import { X, Calendar, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { AdminOrganization, Plan } from "@/types";
import { adminService } from "@/services/admin.service";

interface SubscriptionModalProps {
  org: AdminOrganization | null;
  plans: Plan[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function SubscriptionModal({
  org,
  plans,
  onClose,
  onSuccess,
}: SubscriptionModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [subExpiryDate, setSubExpiryDate] = useState("");
  const [subStatus, setSubStatus] = useState("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setSelectedPlanId(org.subscription?.planId || plans[0]?.id || "");
      setSubStatus(org.subscription?.status || "ACTIVE");
      if (org.subscription?.expiresAt) {
        const dt = new Date(org.subscription.expiresAt);
        setSubExpiryDate(dt.toISOString().split("T")[0]);
      } else {
        setSubExpiryDate("");
      }
    }
  }, [org, plans]);

  if (!org) return null;

  const setQuickExpiry = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSubExpiryDate(d.toISOString().split("T")[0]);
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await adminService.updateSubscription(org.id, {
        planId: selectedPlanId,
        status: subStatus,
        expiresAt: subExpiryDate ? new Date(subExpiryDate).toISOString() : null,
      });
      onSuccess(`Successfully updated subscription for ${org.name}`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update subscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white border border-slate-200 p-6 text-slate-900 rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Manage SaaS Plan & Expiry</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {org.name} ({org.owner?.name || "Landlord"})
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

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Assign SaaS Commercial Tier</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatINR(p.priceMonthly)}/mo - Max {p.maxProperties} Props, {p.maxStaff} Staff)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Subscription Status</label>
            <select
              value={subStatus}
              onChange={(e) => setSubStatus(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ACTIVE">ACTIVE (Full access permitted)</option>
              <option value="SUSPENDED">SUSPENDED (Temporarily blocked)</option>
              <option value="EXPIRED">EXPIRED (Forces renewal prompt)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Plan Expiration Date</label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setQuickExpiry(30)}
                className="text-[11px]"
              >
                +30 Days
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setQuickExpiry(90)}
                className="text-[11px]"
              >
                +90 Days
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setQuickExpiry(365)}
                className="text-[11px]"
              >
                +1 Year
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSubExpiryDate("")}
                className="text-[11px]"
              >
                Lifetime (Clear)
              </Button>
            </div>

            <input
              type="date"
              value={subExpiryDate}
              onChange={(e) => setSubExpiryDate(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              When expired, operations like adding new properties or staff will be blocked until renewed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5"
          >
            {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Save Subscription</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
