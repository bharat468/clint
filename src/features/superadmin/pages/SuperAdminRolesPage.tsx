import { useState } from "react";
import { Plus, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import RoleModal from "../components/RoleModal";
import type { SuperAdminRole } from "@/types";

export default function SuperAdminRolesPage() {
  const { data: adminRoles, loading, error, reload: reloadRoles } = useApi(
    adminService.listRoles,
    [] as SuperAdminRole[]
  );

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
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
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Access Control
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Platform RBAC & Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define administrative roles and delegate granular platform permissions across governance modules.
          </p>
        </div>

        <Button
          onClick={() => setRoleModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Platform Role</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminRoles.map((role) => (
            <Card
              key={role.id}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{role.name}</h4>
                </div>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                  {role.slug}
                </span>
              </div>
              <p className="text-xs text-slate-500 min-h-[30px]">
                {role.description || "Platform executive management role"}
              </p>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Granted Privileges ({role.permissions.length}):
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.permissions.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                    >
                      {p.replace("PLATFORM_", "")}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Role Modal */}
      <RoleModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onSuccess={(msg) => {
          showFeedback(msg);
          reloadRoles();
        }}
      />
    </div>
  );
}
