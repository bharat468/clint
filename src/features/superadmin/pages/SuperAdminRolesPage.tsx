import { useState } from "react";
import { Plus, ShieldCheck, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { State } from "@/components/ui/page";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import RoleModal from "../components/RoleModal";
import type { SuperAdminRole } from "@/types";

export default function SuperAdminRolesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManageRoles = canAccessPlatform(user, "PLATFORM_MANAGE_ADMIN_ROLES");

  const { data: adminRoles, loading, error, reload: reloadRoles } = useApi(
    canManageRoles ? adminService.listRoles : async () => [],
    [] as SuperAdminRole[]
  );

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SuperAdminRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<SuperAdminRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleModalOpen(true);
  };

  const handleOpenEdit = (role: SuperAdminRole) => {
    setEditingRole(role);
    setRoleModalOpen(true);
  };

  const handleRequestDelete = (role: SuperAdminRole) => {
    setDeletingRole(role);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);
    try {
      await adminService.deleteRole(deletingRole.id);
      showFeedback(`Platform role "${deletingRole.name}" deleted successfully`);
      setDeletingRole(null);
      reloadRoles();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to delete role", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canManageRoles) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the platform permission ('PLATFORM_MANAGE_ADMIN_ROLES') required to create or configure platform roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define administrative roles and configure access permissions across platform modules.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Role</span>
        </Button>
      </div>

      <State loading={loading} error={error} empty={false} />

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminRoles.map((role) => (
            <Card
              key={role.id}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all"
            >
              <div className="space-y-3">
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
              </div>

              {/* Card Footer with Edit & Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">ID: #{role.id.slice(-6)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(role)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Role Privileges"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRequestDelete(role)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Role Modal */}
      <RoleModal
        open={roleModalOpen}
        roleToEdit={editingRole}
        onClose={() => setRoleModalOpen(false)}
        onSuccess={(msg) => {
          showFeedback(msg);
          reloadRoles();
        }}
      />

      {/* Delete Role Confirm Modal */}
      <ConfirmModal
        open={Boolean(deletingRole)}
        title="Delete Platform Role?"
        description={
          deletingRole
            ? `Are you sure you want to permanently delete platform role "${deletingRole.name}"? Users assigned to this role will lose their platform administrative privileges.`
            : "Are you sure you want to delete this role?"
        }
        confirmText="Yes, Delete Role"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRole(null)}
      />
    </div>
  );
}
