import { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Building2,
  Copy,
  Check,
  Search,
  Lock,
  Clock,
  Sparkles,
  HelpCircle,
  Layers,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import {
  adminService,
  type SystemSetting,
  type CreateSettingInput,
} from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Select, type SelectOptionItem } from "@/components/ui/input";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { State } from "@/components/ui/page";
import { Toast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

const CATEGORY_META: Record<
  string,
  { label: string; icon: any; color: string; badgeColor: string; bg: string }
> = {
  AUTH_SECURITY: {
    label: "Auth & Security",
    icon: Lock,
    color: "text-purple-600",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    bg: "bg-purple-500",
  },
  BILLING_COMMERCE: {
    label: "Billing & Commerce",
    icon: CreditCard,
    color: "text-emerald-600",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bg: "bg-emerald-500",
  },
  PLATFORM_GENERAL: {
    label: "Platform & General",
    icon: Building2,
    color: "text-blue-600",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    bg: "bg-blue-500",
  },
  SYSTEM_OPS: {
    label: "System Operations",
    icon: Sliders,
    color: "text-amber-600",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    bg: "bg-amber-500",
  },
};

const CATEGORY_FORM_OPTIONS: SelectOptionItem[] = [
  { value: "AUTH_SECURITY", label: "Auth & Security", icon: Lock },
  { value: "BILLING_COMMERCE", label: "Billing & Commerce", icon: CreditCard },
  { value: "PLATFORM_GENERAL", label: "Platform & General", icon: Building2 },
  { value: "SYSTEM_OPS", label: "System Operations", icon: Sliders },
];

const DATA_TYPE_OPTIONS: SelectOptionItem[] = [
  { value: "string", label: "Text / String" },
  { value: "number", label: "Numeric (Integer / Float)" },
  { value: "boolean", label: "Boolean (true / false)" },
];

const BOOLEAN_VALUE_OPTIONS: SelectOptionItem[] = [
  { value: "true", label: "true (Enabled)" },
  { value: "false", label: "false (Disabled)" },
];

const PROTECTED_CORE_KEYS = new Set([
  "jwt_access_expiry_minutes",
  "jwt_refresh_expiry_days",
  "otp_expiry_minutes",
  "currency_code",
  "currency_symbol",
]);

export default function SuperAdminSettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManageBilling = canAccessPlatform(user, "PLATFORM_MANAGE_BILLING");

  const { data: settings, loading, error, reload } = useApi(
    canManageBilling ? adminService.listSettings : async () => [],
    [] as SystemSetting[]
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Actions
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<SystemSetting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Create
  const [createForm, setCreateForm] = useState<CreateSettingInput>({
    key: "",
    value: "",
    category: "PLATFORM_GENERAL",
    description: "",
    unit: "",
    dataType: "string",
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState<{
    value: string;
    category: string;
    description: string;
    unit: string;
    dataType: string;
  }>({
    value: "",
    category: "PLATFORM_GENERAL",
    description: "",
    unit: "",
    dataType: "string",
  });

  // Feedback Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" | "info" }>({
    show: false,
    message: "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
  };

  // Reset pagination on search or filter change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast(`Copied "${key}" to clipboard`, "info");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateForm({
      key: "",
      value: "",
      category: "PLATFORM_GENERAL",
      description: "",
      unit: "",
      dataType: "string",
    });
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (s: SystemSetting) => {
    setEditingSetting(s);
    setEditForm({
      value: s.value,
      category: s.category || "PLATFORM_GENERAL",
      description: s.description || "",
      unit: s.unit || "",
      dataType: s.dataType || "string",
    });
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.key.trim()) {
      showToast("Variable Key name is required", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createSetting(createForm);
      showToast(`Setting "${createForm.key}" created successfully!`, "success");
      setIsCreateOpen(false);
      await reload();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create setting", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSetting) return;
    setIsSubmitting(true);
    try {
      await adminService.updateSetting(editingSetting.key, editForm);
      showToast(`Setting "${editingSetting.key}" updated successfully!`, "success");
      setEditingSetting(null);
      await reload();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update setting", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingSetting) return;
    if (PROTECTED_CORE_KEYS.has(deletingSetting.key)) {
      showToast(`Cannot delete core system variable "${deletingSetting.key}".`, "error");
      setDeletingSetting(null);
      return;
    }
    setIsDeleting(true);
    try {
      await adminService.deleteSetting(deletingSetting.key);
      showToast(`Setting "${deletingSetting.key}" removed successfully.`, "success");
      setDeletingSetting(null);
      await reload();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete setting", "error");
    } finally {
      setIsDeleting(false);
    }
  };

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

  // Paginated records
  const paginatedSettings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSettings.slice(start, start + pageSize);
  }, [filteredSettings, page, pageSize]);

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
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Toast Feedback */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "" })}
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
            Enterprise parameter registry for session tokens, taxes, commercial billing, and platform runtime flags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reload()}
            className="gap-1.5 text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Variable</span>
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
              Registry Count
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Sliders className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900">{settings.length} Variables</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active memory cached</p>
          </div>
        </Card>
      </div>

      {/* Filters & Search Control Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search variables by key, unit, remark, description, value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Filter Custom Select */}
          <div className="w-56 shrink-0">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: "ALL", label: `All Categories (${settings.length})`, icon: Layers },
                ...CATEGORY_FORM_OPTIONS,
              ]}
              className="h-9.5 text-xs font-semibold"
            />
          </div>
        </div>
      </Card>

      <State loading={loading} error={error} empty={filteredSettings.length === 0} />

      {/* Real-World Enterprise Listing Table */}
      {!loading && !error && (
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Variable Key
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Current Value
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Type & Unit
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Description & Remarks
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {paginatedSettings.map((s) => {
                  const meta = CATEGORY_META[s.category] || {
                    label: s.category || "General",
                    icon: HelpCircle,
                    color: "text-slate-600",
                    badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
                    bg: "bg-slate-500",
                  };

                  const isProtected = PROTECTED_CORE_KEYS.has(s.key);
                  const isBoolean = s.dataType === "boolean" || s.value === "true" || s.value === "false";

                  return (
                    <tr
                      key={s.id || s.key}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Column 1: Variable Key */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200 select-all">
                            {s.key}
                          </code>
                          <button
                            onClick={() => handleCopyKey(s.key)}
                            title="Copy variable key"
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/50 transition-colors"
                          >
                            {copiedKey === s.key ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Column 2: Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.badgeColor}`}
                        >
                          <meta.icon className="h-3 w-3" />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      {/* Column 3: Current Value */}
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-900">
                        {isBoolean ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              s.value === "true"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                s.value === "true" ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span>{s.value === "true" ? "Enabled (true)" : "Disabled (false)"}</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-xs text-slate-800 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80 font-mono">
                            {s.value}
                          </span>
                        )}
                      </td>

                      {/* Column 4: Type & Unit */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 uppercase">
                            {s.dataType || "string"}
                          </span>
                          {s.unit ? (
                            <span className="text-[10px] text-blue-600 font-semibold">
                              {s.unit}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Description */}
                      <td className="px-5 py-4 max-w-xs sm:max-w-md">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {s.description || "System runtime configuration variable."}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>Updated: {s.updatedAt ? formatDateTime(s.updatedAt) : "Default"}</span>
                        </span>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(s)}
                            className="h-8 px-2.5 text-xs font-semibold gap-1 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-2xs"
                          >
                            <Pencil className="h-3.5 w-3.5 text-blue-600" />
                            <span>Edit</span>
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProtected}
                            title={isProtected ? "Protected core parameter cannot be deleted" : "Delete parameter"}
                            onClick={() => setDeletingSetting(s)}
                            className={`h-8 px-2 text-xs font-semibold shadow-2xs ${
                              isProtected
                                ? "text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                                : "text-rose-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="border-t border-slate-100 p-4">
            <DataTablePagination
              currentPage={page}
              pageSize={pageSize}
              totalRecords={filteredSettings.length}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              apiEndpoint="GET /api/v1/admin/settings"
            />
          </div>
        </Card>
      )}

      {/* CREATE SETTING MODAL */}
      <Modal
        open={isCreateOpen}
        title="Add New System Parameter"
        subtitle="Define a new dynamic runtime variable in the platform registry"
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Variable Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. max_failed_logins, invoice_prefix"
              value={createForm.key}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                }))
              }
              className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Lowercase letters, numbers, and underscores only.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <Select
                value={createForm.category}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                options={CATEGORY_FORM_OPTIONS}
                className="h-9.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data Type
              </label>
              <Select
                value={createForm.dataType}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, dataType: e.target.value }))}
                options={DATA_TYPE_OPTIONS}
                className="h-9.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Configured Value <span className="text-rose-500">*</span>
            </label>
            {createForm.dataType === "boolean" ? (
              <Select
                value={createForm.value}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, value: e.target.value }))}
                options={BOOLEAN_VALUE_OPTIONS}
                className="h-9.5 text-xs font-semibold"
              />
            ) : createForm.dataType === "number" ? (
              <input
                type="number"
                required
                placeholder="e.g. 15, 100, 0"
                value={createForm.value}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, value: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            ) : (
              <input
                type="text"
                required
                placeholder="Setting value..."
                value={createForm.value}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, value: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unit / Remark
            </label>
            <input
              type="text"
              placeholder="e.g. Minutes (m), Days (d), Percentage (%), ISO 4217"
              value={createForm.unit}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Purpose
            </label>
            <textarea
              rows={2}
              placeholder="Describe what this parameter controls and how it behaves..."
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSubmitting ? "Creating..." : "Save Variable"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT SETTING MODAL */}
      <Modal
        open={Boolean(editingSetting)}
        title={`Edit Parameter: ${editingSetting?.key || ""}`}
        subtitle="Modify value, description, or unit remark for this variable"
        onClose={() => setEditingSetting(null)}
      >
        {editingSetting && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Variable Key (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={editingSetting.key}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed select-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Configured Value <span className="text-rose-500">*</span>
              </label>
              {editForm.dataType === "boolean" ? (
                <Select
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                  options={BOOLEAN_VALUE_OPTIONS}
                  className="h-9.5 text-xs font-semibold"
                />
              ) : editForm.dataType === "number" ? (
                <input
                  type="number"
                  required
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              ) : (
                <input
                  type="text"
                  required
                  value={editForm.value}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <Select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  options={CATEGORY_FORM_OPTIONS}
                  className="h-9.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data Type
                </label>
                <Select
                  value={editForm.dataType}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, dataType: e.target.value }))}
                  options={DATA_TYPE_OPTIONS}
                  className="h-9.5 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit / Remark
              </label>
              <input
                type="text"
                placeholder="e.g. Minutes (m), Days (d), Currency Symbol"
                value={editForm.unit}
                onChange={(e) => setEditForm((prev) => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Purpose
              </label>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingSetting(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting ? "Updating..." : "Update Parameter"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE SETTING CONFIRMATION MODAL */}
      <ConfirmModal
        open={Boolean(deletingSetting)}
        title="Remove System Parameter?"
        description={
          deletingSetting
            ? `Are you sure you want to delete parameter "${deletingSetting.key}"? This will remove the parameter from database and memory cache.`
            : "Are you sure you want to remove this variable?"
        }
        confirmText="Yes, Delete Variable"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingSetting(null)}
      />
    </div>
  );
}
