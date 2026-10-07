import { useState, useMemo } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Plus,
  Search,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { Field } from "@/components/ui/field";
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newUser, setNewUser] = useState({ mobile: "", name: "", email: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const handleOpenEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({ name: u.name || "", email: u.email || "", mobile: u.mobile });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await adminService.updateUser(editingUser.id, {
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        mobile: editForm.mobile || undefined,
      });
      showFeedback(`User ${editForm.name || editForm.mobile} updated successfully`);
      setEditingUser(null);
      reloadUsers();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to update user", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestDelete = (u: AdminUser) => {
    setDeletingUser(u);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(deletingUser.id);
      showFeedback(`User "${deletingUser.name || deletingUser.mobile}" deleted successfully`);
      setDeletingUser(null);
      reloadUsers();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (u: AdminUser) => {
    const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateStatus(u.id, nextStatus as any);
      showFeedback(`User ${u.name || u.mobile} status updated to ${nextStatus}`);
      reloadUsers();
    } catch (err: any) {
      showFeedback(err?.message || "Failed to update status", "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!/^\d{10}$/.test(newUser.mobile)) {
      setFormError("Valid 10-digit mobile number is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createUser({
        mobile: newUser.mobile,
        name: newUser.name || undefined,
        email: newUser.email || undefined,
      });
      showFeedback("New user registered successfully");
      setCreateModalOpen(false);
      setNewUser({ mobile: "", name: "", email: "" });
      reloadUsers();
    } catch (err: any) {
      setFormError(err?.message || "Failed to register user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.mobile?.includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Bottom Center Toast Feedback */}
      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />

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
            Audit registered platform accounts, activate or suspend accounts, and manage SuperAdmin privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setFormError(null);
              setCreateModalOpen(true);
            }}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => reloadUsers()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name, mobile, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-xs"
        />
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
                {filteredUsers.map((u) => {
                  const isUserSuper =
                    Boolean((u as any).isSuperAdmin) ||
                    (u as any).adminRole === "SUPER_ADMIN";
                  const isActive = u.status === "ACTIVE";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                            {(u.name || u.mobile || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{u.name || "User"}</p>
                            {u.email && <p className="text-[11px] text-slate-400">{u.email}</p>}
                          </div>
                        </div>
                      </td>
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
                            ((u as any).isSuperAdmin ? "SUPER_ADMIN" : "None")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {/* Interactive Status Badge (Click to toggle Active / Suspended) */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          title="Click to toggle Active / Suspended status"
                          className="transition-transform active:scale-95"
                        >
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                              isActive
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                : "text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                ACTIVE
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                SUSPENDED
                              </>
                            )}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Toggle Status Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(u)}
                            className={`text-xs h-7 px-2 ${
                              isActive
                                ? "text-rose-600 hover:bg-rose-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                <span>Activate</span>
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditUser(u)}
                            className="text-xs h-7 px-2"
                            title="Edit user details"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPrivilegeUser(u)}
                            className="text-xs h-7"
                          >
                            Privileges
                          </Button>

                          <button
                            onClick={() => handleRequestDelete(u)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create User Modal */}
      <Modal
        open={createModalOpen}
        title="Create Pre-Registered User"
        subtitle="Register user credentials into the platform database"
        onClose={() => setCreateModalOpen(false)}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          <Field label="10-Digit Mobile Number" required>
            <Input
              placeholder="e.g. 9876543210"
              value={newUser.mobile}
              onChange={(e) =>
                setNewUser({ ...newUser, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              required
            />
          </Field>

          <Field label="Full Name">
            <Input
              placeholder="e.g. Amit Patel"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              placeholder="e.g. amit@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={Boolean(editingUser)}
        title="Edit User Profile"
        subtitle={`Update details for ${editingUser?.name || editingUser?.mobile || "user"}`}
        onClose={() => setEditingUser(null)}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Field label="10-Digit Mobile Number" required>
            <Input
              placeholder="e.g. 9876543210"
              value={editForm.mobile}
              onChange={(e) =>
                setEditForm({ ...editForm, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              required
            />
          </Field>

          <Field label="Full Name">
            <Input
              placeholder="e.g. Amit Patel"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              placeholder="e.g. amit@example.com"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

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

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        open={Boolean(deletingUser)}
        title="Delete User Account?"
        description={
          deletingUser
            ? `Are you sure you want to permanently delete user "${deletingUser.name || deletingUser.mobile}"? All credentials, role memberships, and login access will be removed.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Yes, Delete User"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
}
