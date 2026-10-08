import { useState } from "react";
import { Sliders, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import { adminService, type SystemSetting } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { Toast } from "@/components/ui/toast";

export default function SuperAdminSettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManageBilling = canAccessPlatform(user, "PLATFORM_MANAGE_BILLING");

  const { data: settings, loading, error, reload } = useApi(
    canManageBilling ? adminService.listSettings : async () => [],
    [] as SystemSetting[]
  );

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleValueChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const getCurrentValue = (s: SystemSetting) => {
    return editValues[s.key] !== undefined ? editValues[s.key] : s.value;
  };

  const handleSave = async (key: string) => {
    const val = editValues[key];
    if (val === undefined) return;
    setSavingKey(key);
    try {
      await adminService.updateSetting(key, val);
      showFeedback(`Updated setting: ${key}`);
      reload();
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || err?.message || "Failed to update setting", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const categories = Array.from(new Set(settings.map((s) => s.category || "GENERAL")));

  if (!canManageBilling) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the platform permission ('PLATFORM_MANAGE_BILLING') required to view or modify platform settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
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
            System Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure global platform parameters and environment variables.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => reload()} className="gap-1.5 text-slate-700 font-semibold border-slate-300">
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span>Refresh</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catSettings = settings.filter((s) => (s.category || "GENERAL") === cat);
            return (
              <Card
                key={cat}
                className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {cat} Configuration
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {catSettings.length} Parameters
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {catSettings.map((s) => {
                    const isChanged =
                      editValues[s.key] !== undefined && editValues[s.key] !== s.value;

                    return (
                      <div key={s.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 font-mono text-xs">{s.key}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{s.description || "System parameter"}</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {s.value === "true" || s.value === "false" ? (
                            <select
                              value={getCurrentValue(s)}
                              onChange={(e) => handleValueChange(s.key, e.target.value)}
                              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            >
                              <option value="true">Enabled (true)</option>
                              <option value="false">Disabled (false)</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={getCurrentValue(s)}
                              onChange={(e) => handleValueChange(s.key, e.target.value)}
                              className="w-full sm:w-64 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                          )}

                          <Button
                            size="sm"
                            disabled={!isChanged || savingKey === s.key}
                            onClick={() => handleSave(s.key)}
                            className={`text-xs gap-1 h-8 ${
                              isChanged
                                ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none"
                            }`}
                          >
                            {savingKey === s.key ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            <span>Save</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
