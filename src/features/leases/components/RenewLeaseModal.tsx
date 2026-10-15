import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rentalLifecycleService, Lease } from "@/services/rentalLifecycle.service";
import { formatINR } from "@/lib/utils";

interface RenewLeaseModalProps {
  open: boolean;
  onClose: () => void;
  lease: Lease | null;
  onSuccess?: () => void;
}

export function RenewLeaseModal({ open, onClose, lease, onSuccess }: RenewLeaseModalProps) {
  const [escalationType, setEscalationType] = useState<"5" | "10" | "custom">("10");
  const [customRent, setCustomRent] = useState<number>(0);
  const [durationMonths, setDurationMonths] = useState<number>(11);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lease) return null;

  const currentRent = Number(lease.monthlyRent || 0);

  const calculatedRent =
    escalationType === "5"
      ? Math.round(currentRent * 1.05)
      : escalationType === "10"
      ? Math.round(currentRent * 1.1)
      : customRent > 0
      ? customRent
      : currentRent;

  const rentDifference = calculatedRent - currentRent;

  const handleRenew = async () => {
    setLoading(true);
    setError(null);
    try {
      await rentalLifecycleService.renewLease(lease.id, {
        escalationPercentage: escalationType !== "custom" ? Number(escalationType) : undefined,
        newMonthlyRent: calculatedRent,
        durationMonths,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to renew lease");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Renew Lease with Rent Escalation"
      subtitle="Extend tenant lease tenure and apply standard annual rent escalation."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pt-1">
        {/* Lease Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Property & Unit</span>
            <span className="font-semibold text-slate-700">
              {lease.property?.title || "Property"} • Unit {lease.unit?.unitNumber || "101"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tenant</span>
            <span className="font-semibold text-slate-900">{lease.tenant?.name || "Tenant"}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Monthly Rent</span>
            <span className="font-bold text-slate-900">{formatINR(currentRent)}/month</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Term Ends</span>
            <span className="font-semibold text-slate-700">
              {lease.endDate ? new Date(lease.endDate).toLocaleDateString("en-IN") : "N/A"}
            </span>
          </div>
        </div>

        {/* Escalation Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Rent Escalation (Annual Hike)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setEscalationType("5")}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                escalationType === "5"
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>+5% Standard</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{formatINR(Math.round(currentRent * 1.05))}</div>
            </button>

            <button
              type="button"
              onClick={() => setEscalationType("10")}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                escalationType === "10"
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>+10% Market</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{formatINR(Math.round(currentRent * 1.1))}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEscalationType("custom");
                if (customRent === 0) setCustomRent(currentRent);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                escalationType === "custom"
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>Custom Amount</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Custom input</div>
            </button>
          </div>
        </div>

        {/* Custom Rent Input if selected */}
        {escalationType === "custom" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">New Monthly Rent Amount (₹)</label>
            <Input
              type="number"
              min={1}
              value={customRent || ""}
              onChange={(e) => setCustomRent(Number(e.target.value))}
              placeholder="e.g. 18000"
            />
          </div>
        )}

        {/* Tenure selection */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Renewal Tenure Duration</label>
          <div className="flex gap-2">
            {[11, 12, 6].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMonths(m)}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                  durationMonths === m
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {m} Months {m === 11 ? "(Standard Indian Deed)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">New Monthly Rent</div>
            <div className="text-xl font-bold text-slate-900">{formatINR(calculatedRent)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Net Monthly Increase</div>
            <div className="text-sm font-semibold text-emerald-700">
              +{formatINR(rentDifference)}/mo
            </div>
          </div>
        </div>

        {error && <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</div>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRenew} disabled={loading || calculatedRent <= 0} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Confirm Renewal</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
