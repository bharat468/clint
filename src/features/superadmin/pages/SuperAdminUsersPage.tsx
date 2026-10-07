import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import PrivilegeModal from "../components/PrivilegeModal";
import type { AdminUser, SuperAdminRole } from "@/types";

export default function SuperAdminUsersPage() {
  const { data: users, loading, error, reload: reloadUsers } = useApi(
    adminService.listUsers,
    [] as AdminUser[]
  );
  const { data: adminRoles } = useApi(adminService.listRoles, [] as SuperAdminRole[]);

  const [privilegeUser, setPrivilegeUser] = useState<AdminUser | null>(null);
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
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> User Accounts Gate
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Registered Users & Privileges
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit registered platform accounts, examine roles, and promote designated numbers to SuperAdmin.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => reloadUsers()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
          <span>Refresh Users</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <Card className="overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Mobile Contact</th>
                  <th className="px-5 py-3.5">SuperAdmin Flag</th>
                  <th className="px-5 py-3.5">Platform Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {users.map((u) => {
                  const isUserSuper =
                    u.mobile === "8003953815" ||
                    u.mobile === "9876543210" ||
                    Boolean((u as any).isSuperAdmin);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{u.name || "User"}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">{u.mobile}</td>
                      <td className="px-5 py-3.5">
                        {isUserSuper ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            <Shield className="h-3 w-3" />
                            SUPER_ADMIN
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800">
                          {(u as any).adminRole ||
                            (["8003953815", "9876543210"].includes(u.mobile) ? "SUPER_ADMIN" : "None")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            u.status === "ACTIVE"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-rose-700 bg-rose-50 border-rose-200"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrivilegeUser(u)}
                          className="text-xs"
                        >
                          Set Privileges
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Privilege Modal */}
      <PrivilegeModal
        user={privilegeUser}
        adminRoles={adminRoles}
        onClose={() => setPrivilegeUser(null)}
        onSuccess={(msg) => {
          showFeedback(msg);
          reloadUsers();
        }}
      />
    </div>
  );
}
