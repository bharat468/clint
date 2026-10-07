import { useState } from "react";
import { X, UserPlus, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const availablePlatformPermissions = [
  { key: "PLATFORM_MANAGE_PLANS", label: "Dynamic SaaS Plans Management", desc: "Create, edit pricing tiers and change resource limits" },
  { key: "PLATFORM_MANAGE_ORGANIZATIONS", label: "Client Organizations & Subscriptions", desc: "Assign tiers, adjust expiry dates, suspend portfolios" },
  { key: "PLATFORM_MANAGE_ADMIN_ROLES", label: "Platform RBAC & Roles", desc: "Create platform access roles and grant administrative rights" },
  { key: "PLATFORM_VIEW_VITALS", label: "Executive Vitals & Metrics", desc: "View gross collected rent, platform telemetry and server status" },
  { key: "PLATFORM_MANAGE_USERS", label: "Platform User Accounts Gate", desc: "Audit registered numbers and toggle access statuses" },
  { key: "PLATFORM_MANAGE_BILLING", label: "Settlements & Gateway Keys", desc: "Oversee payment gateways and corporate invoices" },
];

export default function RoleModal({ open, onClose, onSuccess }: RoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;
    setSubmitting(true);
    setError(null);
    try {
      const slug = roleSlug || roleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await adminService.createRole({
        name: roleName,
        slug,
        description: roleDesc,
        permissions: selectedPermissions,
      });
      onSuccess(`Successfully created SuperAdmin role: ${roleName}`);
      setRoleName("");
      setRoleSlug("");
      setRoleDesc("");
      setSelectedPermissions([]);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white border border-slate-200 p-6 text-slate-900 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span>Create Platform Admin Role</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Assign granular platform executive capabilities</p>
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
              <label className="block text-slate-700 font-semibold mb-1">Role Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Billing Administrator"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Slug</label>
              <input
                type="text"
                placeholder="e.g. billing-admin"
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <input
              type="text"
              placeholder="Role responsibilities..."
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">Granted Platform Permissions</label>
            <div className="space-y-2 rounded-xl bg-slate-50/80 p-3 border border-slate-100 max-h-48 overflow-y-auto">
              {availablePlatformPermissions.map((perm) => (
                <label key={perm.key} className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.key)}
                    onChange={() => togglePermission(perm.key)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{perm.label}</div>
                    <div className="text-[10px] text-slate-500">{perm.desc}</div>
                  </div>
                </label>
              ))}
            </div>
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
              <span>Save Role</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
