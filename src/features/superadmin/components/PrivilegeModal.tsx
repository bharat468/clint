import { useState, useEffect } from "react";
import { X, UserCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminUser, SuperAdminRole } from "@/types";
import { adminService } from "@/services/admin.service";

interface PrivilegeModalProps {
  user: AdminUser | null;
  adminRoles: SuperAdminRole[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function PrivilegeModal({
  user,
  adminRoles,
  onClose,
  onSuccess,
}: PrivilegeModalProps) {
  const [targetIsSuperAdmin, setTargetIsSuperAdmin] = useState(false);
  const [targetAdminRole, setTargetAdminRole] = useState("SUPER_ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setTargetIsSuperAdmin(
        Boolean((user as any).isSuperAdmin) || (user as any).adminRole === "SUPER_ADMIN"
      );
      setTargetAdminRole((user as any).adminRole || "SUPER_ADMIN");
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await adminService.assignAdminRole(user.id, {
        isSuperAdmin: targetIsSuperAdmin,
        adminRole: targetIsSuperAdmin ? targetAdminRole : undefined,
      });
      onSuccess(`Updated platform privileges for ${user.name || user.mobile}`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update privileges");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white border border-slate-200 p-6 text-slate-900 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span>Configure Platform Privileges</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.name || "User"} ({user.mobile})
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
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 cursor-pointer hover:bg-slate-100/60 transition-colors">
            <input
              type="checkbox"
              checked={targetIsSuperAdmin}
              onChange={(e) => setTargetIsSuperAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-bold text-slate-900">SuperAdmin Platform Flag</div>
              <div className="text-[11px] text-slate-500">
                Grants access to the SuperAdmin platform governance portal
              </div>
            </div>
          </label>

          {targetIsSuperAdmin && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Assigned Platform Role</label>
              <select
                value={targetAdminRole}
                onChange={(e) => setTargetAdminRole(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Master)</option>
                {adminRoles.map((r) => (
                  <option key={r.id} value={r.slug.toUpperCase()}>
                    {r.name} ({r.slug})
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <span>Update Privileges</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
