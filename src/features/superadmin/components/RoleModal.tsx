import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  Layers,
  Building2,
  Users,
  Activity,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";
import type { SuperAdminRole } from "@/types";

interface RoleModalProps {
  open: boolean;
  roleToEdit?: SuperAdminRole | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export interface PermissionModuleGroup {
  moduleId: string;
  moduleName: string;
  moduleBadge: string;
  moduleIcon: any;
  description: string;
  permissions: {
    key: string;
    label: string;
    desc: string;
  }[];
}

export const platformPermissionModules: PermissionModuleGroup[] = [
  {
    moduleId: "PLANS_BILLING",
    moduleName: "SaaS Plans & Subscription Module",
    moduleBadge: "SaaS & Pricing",
    moduleIcon: Layers,
    description: "Manage subscription plans, pricing tiers, and quota limit configuration",
    permissions: [
      {
        key: "PLATFORM_MANAGE_PLANS",
        label: "Manage SaaS Plans",
        desc: "Create, edit pricing tiers, and configure maximum properties and staff quotas",
      },
      {
        key: "PLATFORM_MANAGE_BILLING",
        label: "Billing & Payment Gateways",
        desc: "Oversee payment gateways, corporate billing accounts, and invoices",
      },
    ],
  },
  {
    moduleId: "ORGANIZATIONS",
    moduleName: "Landlords & Organizations Module",
    moduleBadge: "Client Portfolios",
    moduleIcon: Building2,
    description: "Manage multi-tenant organizations, landlord workspaces, and active plans",
    permissions: [
      {
        key: "PLATFORM_MANAGE_ORGANIZATIONS",
        label: "Manage Organizations",
        desc: "Assign subscription tiers, adjust portfolio expiry dates, and suspend or activate landlords",
      },
    ],
  },
  {
    moduleId: "USERS_ROLES",
    moduleName: "User Management & RBAC Module",
    moduleBadge: "Access Control",
    moduleIcon: Users,
    description: "Manage platform executive accounts, user roles, and administrative rights",
    permissions: [
      {
        key: "PLATFORM_MANAGE_USERS",
        label: "Global User Management",
        desc: "Audit registered phone numbers, suspend accounts, and view user assignments",
      },
      {
        key: "PLATFORM_MANAGE_ADMIN_ROLES",
        label: "Manage Roles & Permissions",
        desc: "Create platform access roles and grant administrative capabilities across modules",
      },
    ],
  },
  {
    moduleId: "TELEMETRY_VITALS",
    moduleName: "Platform Vitals & Telemetry Module",
    moduleBadge: "System Monitoring",
    moduleIcon: Activity,
    description: "Live system health monitoring, API performance tracking, and telemetry logs",
    permissions: [
      {
        key: "PLATFORM_VIEW_VITALS",
        label: "Platform Metrics & Vitals",
        desc: "View gross collected rent, platform telemetry, API latencies, and server health",
      },
    ],
  },
];

export default function RoleModal({ open, roleToEdit, onClose, onSuccess }: RoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.name);
      setRoleSlug(roleToEdit.slug);
      setRoleDesc(roleToEdit.description || "");
      setSelectedPermissions(roleToEdit.permissions || []);
    } else {
      setRoleName("");
      setRoleSlug("");
      setRoleDesc("");
      setSelectedPermissions([]);
    }
    setError(null);
  }, [roleToEdit, open]);

  if (!open) return null;

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const toggleModulePermissions = (module: PermissionModuleGroup) => {
    const moduleKeys = module.permissions.map((p) => p.key);
    const allSelected = moduleKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !moduleKeys.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...moduleKeys])));
    }
  };

  const totalPossiblePermissions = platformPermissionModules.reduce(
    (acc, m) => acc + m.permissions.length,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;
    setSubmitting(true);
    setError(null);
    try {
      const slug = roleSlug || roleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (roleToEdit) {
        await adminService.updateRoleDefinition(roleToEdit.id, {
          name: roleName,
          slug,
          description: roleDesc,
          permissions: selectedPermissions,
        });
        onSuccess(`Successfully updated role: ${roleName}`);
      } else {
        await adminService.createRole({
          name: roleName,
          slug,
          description: roleDesc,
          permissions: selectedPermissions,
        });
        onSuccess(`Successfully created platform role: ${roleName}`);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border border-slate-200 p-6 text-slate-900 rounded-2xl shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <UserPlus className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {roleToEdit ? "Edit Platform Admin Role" : "Create Platform Admin Role"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure granular executive capabilities grouped clearly by platform module.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
          {/* Basic Role Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-slate-700 font-semibold mb-1">Role Slug</label>
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
              placeholder="Describe what responsibilities this role handles..."
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Module-Wise Permissions Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-900 font-bold text-xs">
                  Granted Module Permissions
                </label>
                <p className="text-[11px] text-slate-500">
                  Select which platform modules this role can access and execute actions in.
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                {selectedPermissions.length} / {totalPossiblePermissions} Selected
              </span>
            </div>

            <div className="space-y-3">
              {platformPermissionModules.map((module) => {
                const ModuleIcon = module.moduleIcon;
                const moduleKeys = module.permissions.map((p) => p.key);
                const isAllSelected = moduleKeys.every((k) => selectedPermissions.includes(k));

                return (
                  <div
                    key={module.moduleId}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 space-y-2.5 transition-all hover:border-slate-300"
                  >
                    {/* Module Header Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs">
                          <ModuleIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {module.moduleName}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                              {module.moduleBadge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Select/Deselect All for Module */}
                      <button
                        type="button"
                        onClick={() => toggleModulePermissions(module)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        {isAllSelected ? (
                          <>
                            <CheckSquare className="h-3 w-3 text-blue-600" />
                            <span>Deselect All</span>
                          </>
                        ) : (
                          <>
                            <Square className="h-3 w-3 text-slate-400" />
                            <span>Select All</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Permissions list inside this module */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {module.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-white border-blue-500/50 shadow-2xs"
                                : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.key)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-900 text-xs">
                                  {perm.label}
                                </span>
                                <code className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {perm.key}
                                </code>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {perm.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
            >
              {submitting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Save Role</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
