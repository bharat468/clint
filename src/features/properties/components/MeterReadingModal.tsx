import React, { useState, useEffect } from "react";
import {
  Zap,
  Droplets,
  History,
  FileCheck2,
} from "lucide-react";
import {
  rentalLifecycleService,
  type Unit,
  type UnitMeterReadingsResponse,
} from "@/services/rentalLifecycle.service";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { formatINR } from "@/lib/utils";

interface MeterReadingModalProps {
  unit: Unit | null;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function MeterReadingModal({
  unit,
  propertyTitle,
  open,
  onClose,
  onSaved,
}: MeterReadingModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readingsData, setReadingsData] = useState<UnitMeterReadingsResponse | null>(null);

  const [utilityType, setUtilityType] = useState<"ELECTRICITY" | "WATER">("ELECTRICITY");
  const [previousReading, setPreviousReading] = useState<number>(0);
  const [currentReading, setCurrentReading] = useState<string>("");
  const [customRate, setCustomRate] = useState<string>("");
  const [readingMonth, setReadingMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [notes, setNotes] = useState<string>("");

  const monthOptions = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      list.push({ value: val, label });
    }
    return list;
  }, []);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    if (open && unit) {
      loadUnitReadings();
    }
  }, [open, unit]);

  const loadUnitReadings = async () => {
    if (!unit) return;
    setLoading(true);
    try {
      const data = await rentalLifecycleService.getMeterReadings(unit.id);
      setReadingsData(data);

      // Auto-set previous reading from latest reading matching utilityType
      const last = data.readings?.find((r) => r.utilityType === utilityType);
      if (last) {
        setPreviousReading(last.currentReading);
      } else {
        setPreviousReading(0);
      }

      // Pre-fill rate from Landlord's Organization Settings
      const defaultRate =
        utilityType === "WATER"
          ? data.unit?.organizationRates?.waterRate ?? 20.0
          : data.unit?.organizationRates?.electricityRate ?? 9.0;
      setCustomRate(String(defaultRate));
    } catch (err) {
      console.error("Failed to load meter readings", err);
    } finally {
      setLoading(false);
    }
  };

  // When utilityType changes, adjust default rate and previous reading
  useEffect(() => {
    if (readingsData) {
      const last = readingsData.readings?.find((r) => r.utilityType === utilityType);
      setPreviousReading(last ? last.currentReading : 0);

      const defaultRate =
        utilityType === "WATER"
          ? readingsData.unit?.organizationRates?.waterRate ?? 20.0
          : readingsData.unit?.organizationRates?.electricityRate ?? 9.0;
      setCustomRate(String(defaultRate));
    }
  }, [utilityType, readingsData]);

  // Live Math calculations
  const parsedCurrent = parseFloat(currentReading);
  const parsedRate = parseFloat(customRate) || 0;
  const isValidCurrent = !isNaN(parsedCurrent) && parsedCurrent >= previousReading;
  const consumedUnits = isValidCurrent
    ? Math.round((parsedCurrent - previousReading) * 100) / 100
    : 0;
  const calculatedTotal = isValidCurrent
    ? Math.round((consumedUnits * parsedRate) * 100) / 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;

    if (!isValidCurrent) {
      setToast({
        show: true,
        type: "error",
        message: `Current reading must be a valid number greater than or equal to previous reading (${previousReading}).`,
      });
      return;
    }

    setSaving(true);
    try {
      await rentalLifecycleService.recordMeterReading(unit.id, {
        utilityType,
        readingMonth,
        previousReading,
        currentReading: parsedCurrent,
        customRate: parsedRate,
        notes: notes || undefined,
      });

      setToast({
        show: true,
        type: "success",
        message: `Meter reading saved! Consumed: ${consumedUnits} units, Bill Amount: INR ${calculatedTotal.toLocaleString("en-IN")}.`,
      });

      setCurrentReading("");
      setNotes("");
      await loadUnitReadings();
      if (onSaved) onSaved();
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Failed to record meter reading",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open || !unit) return null;

  const orgRates = readingsData?.unit?.organizationRates || {
    electricityRate: 9.0,
    waterRate: 20.0,
  };

  return (
    <>
      <Modal
        open={open}
        title={`Sub-Meter Billing: Unit ${unit.unitNumber}`}
        subtitle={`${propertyTitle} • Floor ${unit.floor} • ${unit.type.replace("_", " ")}`}
        maxWidth="max-w-2xl"
        onClose={onClose}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Sub-Meter Billing: Unit {unit.unitNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {propertyTitle} • Floor {unit.floor} • {unit.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Landlord Settings Badge */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Landlord Tariff Rates
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-700">
                <span>Electricity: ₹{orgRates.electricityRate}/kWh</span>
                <span className="text-slate-300">|</span>
                <span>Water: ₹{orgRates.waterRate}/kL</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Utility Type Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Utility Service Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUtilityType("ELECTRICITY")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    utilityType === "ELECTRICITY"
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Electricity (kWh)</span>
                  </span>
                  <Badge tone="blue">₹{orgRates.electricityRate}/kWh</Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setUtilityType("WATER")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    utilityType === "WATER"
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    <span>Water Supply (kL)</span>
                  </span>
                  <Badge tone="blue">₹{orgRates.waterRate}/kL</Badge>
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Previous Reading */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previous Reading
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(parseFloat(e.target.value) || 0)}
                  className="font-bold text-slate-800"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Auto-loaded from last log
                </span>
              </div>

              {/* Current Reading */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Reading <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={previousReading}
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                  placeholder={`Min ${previousReading}`}
                  className="font-bold text-blue-700 focus:border-blue-500"
                  required
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  New reading from physical meter
                </span>
              </div>

              {/* Rate per Unit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Rate per Unit
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                    From Settings
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="pl-7 font-bold text-slate-800"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Default from Org Settings
                </span>
              </div>
            </div>

            {/* Billing Month & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Period (Month)
                </label>
                <Select
                  value={readingMonth}
                  onChange={(e) => setReadingMonth(e.target.value)}
                  className="text-xs font-semibold"
                  required
                >
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Memo (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Sub-meter inspected by caretaker"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
                <span className="text-slate-700 font-semibold">Automatic Consumption Calculation</span>
                <span className="text-xs text-slate-500 font-medium">
                  {utilityType === "ELECTRICITY" ? "Electricity Tariff" : "Water Tariff"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">
                    Units Consumed
                  </span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {consumedUnits}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      {utilityType === "ELECTRICITY" ? "kWh" : "kL"}
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">
                    Applied Tariff
                  </span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    ₹{parsedRate}{" "}
                    <span className="text-xs font-normal text-slate-500">/unit</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">
                    Total Utility Due
                  </span>
                  <p className="text-lg font-bold text-blue-700 mt-0.5">
                    {formatINR(calculatedTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !isValidCurrent}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {saving ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FileCheck2 className="h-4 w-4" />
                    <span>Record Reading {formatINR(calculatedTotal)}</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Past Meter Readings History Table */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <History className="h-4 w-4 text-slate-400" />
                <span>Recorded Meter History for Unit {unit.unitNumber}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {readingsData?.readings?.length || 0} entries logged
              </span>
            </div>

            {loading ? (
              <div className="h-16 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : !readingsData?.readings || readingsData.readings.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                No meter readings recorded for this unit yet. Enter the first reading above.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">Service</th>
                      <th className="py-2 px-3 text-right">Previous</th>
                      <th className="py-2 px-3 text-right">Current</th>
                      <th className="py-2 px-3 text-right">Consumed</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {readingsData.readings.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {r.readingMonth}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-700">
                          {r.utilityType === "ELECTRICITY" ? "Electricity" : "Water Supply"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">
                          {r.previousReading}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                          {r.currentReading}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-700">
                          {r.consumedUnits}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">
                          ₹{r.ratePerUnit}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          {formatINR(r.amount)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge tone="green">{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {toast.show && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "" })}
        />
      )}
    </>
  );
}
