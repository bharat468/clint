import { useState, useMemo } from "react";
import {
  Sliders,
  Plus,
  ShieldCheck,
  X,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { organizationService } from "@/services/organization.service";
import { roleService } from "@/services/role.service";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { errMsg } from "@/lib/utils";
import type { Role, Permission } from "@/types";

export default function RolesSettingsPage() {
  const { data: orgs } = useApi(organizationService.list, [] as any[]);
  const currentOrg = orgs[0] || { id: "default", name: "Bharat Estates", slug: "bharat-estates" };

  const { data: roles, reload: reloadRoles } = useApi(roleService.listRoles, [] as Role[]);
  const { data: permissions } = useApi(roleService.listPermissions, [] as Permission[]);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [roleForm, setRoleForm] = useState<{
    name: string;
    description: string;
    permissionKeys: string[];
  }>({
    name: "",
    description: "",
    permissionKeys: [],
  });
  const [roleFormError, setRoleFormError] = useState<string | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const permissionModules = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    });
    return Array.from(map.entries());
  }, [permissions]);

  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: "", description: "", permissionKeys: [] });
    setRoleFormError(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (r: Role) => {
    setEditingRole(r);
    const existingKeys = (r.permissions || []).map((p: any) =>
      typeof p === "string" ? p : p.key || p.permission?.key || ""
    ).filter(Boolean);
    setRoleForm({
      name: r.name,
      description: r.description || "",
      permissionKeys: existingKeys,
    });
    setRoleFormError(null);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormError(null);
    if (!roleForm.name.trim()) {
      setRoleFormError("Role name is required");
      return;
    }
    setIsSubmittingRole(true);
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          permissionKeys: roleForm.permissionKeys,
        });
      } else {
        await roleService.createRole({
          name: roleForm.name,
          description: roleForm.description,
          permissionKeys: roleForm.permissionKeys,
          organizationId: currentOrg.id,
        });
      }
      setIsRoleModalOpen(false);
      setEditingRole(null);
      setRoleForm({ name: "", description: "", permissionKeys: [] });
      reloadRoles();
    } catch (err) {
      setRoleFormError(errMsg(err));
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleRequestDeleteRole = (r: Role) => {
    setDeletingRole(r);
  };

  const handleConfirmDeleteRole = async () => {
    if (!deletingRole) return;
    setIsDeletingRole(true);
    try {
      await roleService.deleteRole(deletingRole.id);
      showFeedback(`Custom role "${deletingRole.name}" deleted successfully`);
      setDeletingRole(null);
      reloadRoles();
    } catch (err) {
      showFeedback(errMsg(err), "error");
    } finally {
      setIsDeletingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bottom Center Toast */}
      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />
      {/* Module Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sliders className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Roles & Granular Permissions
            </h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/60">
              {roles.length} Roles
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Define role boundaries, inspect system defaults, and assemble custom roles with checkbox permissions.
          </p>
        </div>

        <Button onClick={handleOpenCreateRole} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          <span>Create Custom Role</span>
        </Button>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => {
          const permCount = r.permissions?.length || 0;
          return (
            <Card
              key={r.id}
              className="p-5 bg-white border-slate-200 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-all rounded-2xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                  <Badge tone={r.isSystem ? "blue" : "purple"}>
                    {r.isSystem ? "System Role" : "Custom Dynamic"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500 min-h-[32px] leading-relaxed">
                  {r.description || "Operational role for organization staff members"}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Authorized Capabilities:</span>
                    <span className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold">
                      {permCount} of {permissions.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>identifier: {r.slug}</span>
                {r.isSystem ? (
                  <span className="text-slate-400 font-sans font-medium text-[10px]">Locked System</span>
                ) : (
                  <div className="flex items-center gap-1 font-sans">
                    <button
                      onClick={() => handleOpenEditRole(r)}
                      className="text-slate-500 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                      title="Edit Custom Role"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRequestDeleteRole(r)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Create / Edit Custom Role */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Dynamic Role"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select granular permission checkboxes for your organization staff
                </p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="mt-4 space-y-4">
              {roleFormError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                  {roleFormError}
                </div>
              )}

              <Field label="Role Name (Display Name)" required>
                <Input
                  placeholder="e.g. Maintenance Supervisor"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                />
              </Field>

              <Field label="Role Description">
                <Textarea
                  placeholder="Describe this role's operational authority..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={2}
                />
              </Field>

              {/* Permission Checkboxes by Module */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-800">
                  Select Granular Permissions ({roleForm.permissionKeys.length} selected):
                </p>

                <div className="space-y-4 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  {permissionModules.map(([moduleName, perms]) => (
                    <div key={moduleName} className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Module: {moduleName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = roleForm.permissionKeys.includes(p.key);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...roleForm.permissionKeys, p.key]
                                    : roleForm.permissionKeys.filter((k) => k !== p.key);
                                  setRoleForm({ ...roleForm, permissionKeys: updated });
                                }}
                                className="mt-0.5 rounded text-indigo-600"
                              />
                              <div>
                                <span className="font-semibold block">{p.key}</span>
                                <span className="text-[10px] text-slate-500">{p.description}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingRole}>
                  {isSubmittingRole ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Custom Role Confirm Modal */}
      <ConfirmModal
        open={Boolean(deletingRole)}
        title="Delete Custom Role?"
        description={
          deletingRole
            ? `Are you sure you want to permanently delete custom role "${deletingRole.name}"? Members assigned to this role will need to be reassigned to another role.`
            : "Are you sure you want to delete this custom role?"
        }
        confirmText="Yes, Delete Role"
        tone="danger"
        isLoading={isDeletingRole}
        onConfirm={handleConfirmDeleteRole}
        onClose={() => setDeletingRole(null)}
      />
    </div>
  );
}
