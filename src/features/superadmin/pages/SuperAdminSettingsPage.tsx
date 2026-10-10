import { useState, useMemo } from "react";
import {
  Sliders,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Building2,
  Copy,
  Check,
  Undo2,
  Search,
  Sparkles,
  Lock,
  Clock,
  HelpCircle,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import { adminService, type SystemSetting } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { State } from "@/components/ui/page";
import { Toast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

const CATEGORY_META: Record<
  string,
  { label: string; icon: any; color: string; badgeColor: string; bg: string; border: string }
> = {
  AUTH_SECURITY: {
    label: "Authentication & Security",
    icon: Lock,
    color: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  BILLING_COMMERCE: {
    label: "Billing & Financials",
    icon: CreditCard,
    color: "text-emerald-600",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  PLATFORM_GENERAL: {
    label: "Platform & Branding",
    icon: Building2,
    color: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  SYSTEM_OPS: {
    label: "System Operations",
    icon: Sliders,
    color: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
};

export default function SuperAdminSettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManageBilling = canAccessPlatform(user, "PLATFORM_MANAGE_BILLING");

  const { data: settings, loading, error, reload } = useApi(
    canManageBilling ? adminService.listSettings : async () => [],
    [] as SystemSetting[]
  );

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const handleValueChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetValue = (key: string) => {
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getCurrentValue = (s: SystemSetting) => {
    return editValues[s.key] !== undefined ? editValues[s.key] : s.value;
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (s: SystemSetting) => {
    const val = editValues[s.key];
    if (val === undefined || val === s.value) return;
    setSavingKey(s.key);
    try {
      await adminService.updateSetting(s.key, val);
      showFeedback(`Parameter "${s.key}" updated to "${val}"`);
      handleResetValue(s.key);
      await reload();
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || err?.message || "Failed to update setting", "error");
    } finally {
      setSavingKey(null);
    }
  };

  // Categories list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    settings.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [settings]);

  // Filtered settings
  const filteredSettings = useMemo(() => {
    return settings.filter((s) => {
      const matchesCategory = selectedCategory === "ALL" || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.key.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.unit && s.unit.toLowerCase().includes(q)) ||
        s.value.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [settings, selectedCategory, searchQuery]);

  // Key KPI values
  const tokenAccess = settings.find((s) => s.key === "jwt_access_expiry_minutes")?.value || "15";
  const tokenRefresh = settings.find((s) => s.key === "jwt_refresh_expiry_days")?.value || "7";
  const isMaintenance = settings.find((s) => s.key === "maintenance_mode")?.value === "true";
  const currencySymbol = settings.find((s) => s.key === "currency_symbol")?.value || "₹";
  const currencyCode = settings.find((s) => s.key === "currency_code")?.value || "INR";
  const gstRate = settings.find((s) => s.key === "gst_rate_percent")?.value || "18";

  if (!canManageBilling) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the platform permission ('PLATFORM_MANAGE_BILLING') required to view or modify system settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              System Settings
            </h1>
            <Badge tone="blue" className="gap-1 py-0.5 font-semibold text-xs">
              <Sparkles className="h-3 w-3" />
              <span>Runtime Dynamic</span>
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Control global authentication timeouts, currency units, GST taxation, and maintenance window parameters in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reload()}
            className="gap-1.5 text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Token Expiry */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Session Tokens
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900">
              {tokenAccess}m <span className="text-xs font-normal text-slate-500">/ {tokenRefresh}d refresh</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Live silent rotation threshold</p>
          </div>
        </Card>

        {/* Metric 2: Operational Mode */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Platform Status
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isMaintenance ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isMaintenance ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
              />
              <span className="text-lg font-bold text-slate-900">
                {isMaintenance ? "Maintenance Mode" : "All Systems Live"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMaintenance ? "Restricted to SuperAdmins" : "Public and Landlord APIs Open"}
            </p>
          </div>
        </Card>

        {/* Metric 3: Currency & GST */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Billing Defaults
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900">
              {currencySymbol} {currencyCode} <span className="text-xs font-normal text-slate-500">• {gstRate}% GST</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Used across invoices & plans</p>
          </div>
        </Card>

        {/* Metric 4: Total Parameters */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Parameters
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Sliders className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900">{settings.length} Variables</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Synced with cache memory</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            All Parameters ({settings.length})
          </button>
          {availableCategories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isSelected = selectedCategory === cat;
            const count = settings.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {meta && <meta.icon className="h-3 w-3" />}
                <span>{meta?.label || cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search parameter, unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      <State loading={loading} error={error} empty={filteredSettings.length === 0} />

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredSettings.map((s) => {
            const isChanged = editValues[s.key] !== undefined && editValues[s.key] !== s.value;
            const currentValue = getCurrentValue(s);
            const isBusy = savingKey === s.key;
            const meta = CATEGORY_META[s.category] || {
              label: s.category || "General",
              icon: HelpCircle,
              color: "text-slate-600",
              badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
              bg: "bg-slate-50",
              border: "border-slate-100",
            };

            const isBoolean = s.dataType === "boolean" || s.value === "true" || s.value === "false";
            const isNumber = s.dataType === "number";

            return (
              <Card
                key={s.id || s.key}
                className={`p-5 bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isChanged
                    ? "border-blue-400 shadow-md ring-2 ring-blue-500/10"
                    : "border-slate-200/90 shadow-xs hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Header: Category & Key */}
                  <div className="flex items-start justify-between gap-2 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeColor}`}>
                        <meta.icon className="h-2.5 w-2.5" />
                        <span>{meta.label}</span>
                      </span>

                      {s.unit && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          Unit: {s.unit}
                        </span>
                      )}

                      {isChanged && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                          ● Unsaved Change
                        </span>
                      )}
                    </div>

                    {/* Copy Key Button */}
                    <button
                      onClick={() => handleCopyKey(s.key)}
                      title="Copy variable key name"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {copiedKey === s.key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Variable Key */}
                  <div className="mt-1">
                    <code className="text-xs font-mono font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 select-all">
                      {s.key}
                    </code>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {s.description || "System runtime parameter configured for platform operations."}
                  </p>
                </div>

                {/* Input & Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Control input based on type */}
                    {isBoolean ? (
                      <div className="flex items-center gap-1.5 flex-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleValueChange(s.key, "true")}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            currentValue === "true"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Enabled (true)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleValueChange(s.key, "false")}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            currentValue === "false"
                              ? "bg-slate-700 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Disabled (false)
                        </button>
                      </div>
                    ) : isNumber ? (
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={currentValue}
                          onChange={(e) => handleValueChange(s.key, e.target.value)}
                          className="w-full pl-3 pr-14 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all"
                        />
                        {s.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none">
                            {s.unit.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleValueChange(s.key, e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all"
                        />
                      </div>
                    )}

                    {/* Reset Button (If modified) */}
                    {isChanged && (
                      <Button
                        size="sm"
                        variant="outline"
                        title="Discard changes and revert to saved value"
                        onClick={() => handleResetValue(s.key)}
                        className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 border-slate-200 hover:border-rose-200 hover:bg-rose-50"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Save Button */}
                    <Button
                      size="sm"
                      disabled={!isChanged || isBusy}
                      onClick={() => handleSave(s)}
                      className={`h-9 px-3.5 text-xs font-semibold gap-1.5 transition-all shadow-xs ${
                        isChanged
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none"
                      }`}
                    >
                      {isBusy ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span>{isBusy ? "Saving..." : "Save"}</span>
                    </Button>
                  </div>

                  {/* Last updated footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {s.updatedAt ? formatDateTime(s.updatedAt) : "Default"}</span>
                    </span>
                    <span className="font-mono text-slate-300">ID: {s.id}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
