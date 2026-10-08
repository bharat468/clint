import { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  ShieldCheck,
  Phone,
  Mail,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import {
  organizationService,
  type OrgMember,
  type AddMemberInput,
} from "@/services/organization.service";
import { roleService } from "@/services/role.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { errMsg } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import type { Role, Property } from "@/types";

export default function TeamSettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canAssignRoles = canAccess(user, "role.assign");
  const canReadRoles = canAccess(user, "role.read");

  const { data: orgs } = useApi(organizationService.list, [] as any[]);
  const currentOrg = orgs[0] || { id: "default", name: "Bharat Estates", slug: "bharat-estates" };

  const fetchMembers = async () => {
    if (!currentOrg?.id || currentOrg.id === "default") {
      const list = await organizationService.list();
      if (list && list.length > 0) {
        return organizationService.listMembers(list[0].id);
      }
      return [];
    }
    return organizationService.listMembers(currentOrg.id);
  };

  const { data: members, reload: reloadMembers } = useApi(fetchMembers, [] as OrgMember[]);
  const { data: roles } = useApi(roleService.listRoles, [] as Role[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [memberForm, setMemberForm] = useState<AddMemberInput>({
    mobile: "",
    name: "",
    email: "",
    roleId: "",
    propertyScope: [],
  });
  const [editMemberForm, setEditMemberForm] = useState<{
    name: string;
    email: string;
    roleId: string;
    propertyScope: string[];
  }>({
    name: "",
    email: "",
    roleId: "",
    propertyScope: [],
  });
  const [scopeMode, setScopeMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [editScopeMode, setEditScopeMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [memberFormError, setMemberFormError] = useState<string | null>(null);
  const [editMemberFormError, setEditMemberFormError] = useState<string | null>(null);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [deletingMember, setDeletingMember] = useState<OrgMember | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const handleOpenAddMember = () => {
    setMemberForm({ mobile: "", name: "", email: "", roleId: "", propertyScope: [] });
    setScopeMode("ALL");
    setMemberFormError(null);
    setIsMemberModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsMemberModalOpen(false);
    setMemberForm({ mobile: "", name: "", email: "", roleId: "", propertyScope: [] });
    setScopeMode("ALL");
    setMemberFormError(null);
  };

  const handleOpenEditMember = (m: OrgMember) => {
    setEditingMember(m);
    setEditMemberForm({
      name: m.name || "",
      email: m.email || "",
      roleId: m.roleId || "",
      propertyScope: m.propertyScope || [],
    });
    setEditScopeMode(m.propertyScope && m.propertyScope.length > 0 ? "CUSTOM" : "ALL");
    setEditMemberFormError(null);
  };

  const handleCloseEditModal = () => {
    setEditingMember(null);
    setEditMemberForm({ name: "", email: "", roleId: "", propertyScope: [] });
    setEditScopeMode("ALL");
    setEditMemberFormError(null);
  };

  const getEffectiveOrgId = async () => {
    if (currentOrg?.id && currentOrg.id !== "default") {
      return currentOrg.id;
    }
    const list = await organizationService.list();
    if (list && list.length > 0) {
      return list[0].id;
    }
    return null;
  };

  const handleToggleMemberStatus = async (m: OrgMember) => {
    if (!canAssignRoles) {
      showFeedback("Forbidden: You lack permission 'role.assign' to update staff status", "error");
      return;
    }
    const nextStatus = m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const orgId = await getEffectiveOrgId();
      if (!orgId) throw new Error("No organization found");
      await organizationService.updateMember(orgId, m.userId, { status: nextStatus });
      showFeedback(`Staff status updated to ${nextStatus}`);
      reloadMembers();
    } catch (err) {
      showFeedback(errMsg(err), "error");
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditMemberFormError(null);
    setIsSubmittingMember(true);
    try {
      const orgId = await getEffectiveOrgId();
      if (!orgId) throw new Error("No organization found. Please reload.");
      await organizationService.updateMember(orgId, editingMember.userId, {
        name: editMemberForm.name,
        email: editMemberForm.email,
        roleId: editMemberForm.roleId || undefined,
        propertyScope: editScopeMode === "ALL" ? [] : editMemberForm.propertyScope,
      });
      handleCloseEditModal();
      showFeedback("Staff member updated successfully");
      reloadMembers();
    } catch (err) {
      const msg = errMsg(err);
      setEditMemberFormError(msg);
      showFeedback(msg, "error");
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberFormError(null);
    if (!/^\d{10}$/.test(memberForm.mobile)) {
      setMemberFormError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsSubmittingMember(true);
    try {
      const orgId = await getEffectiveOrgId();
      if (!orgId) {
        throw new Error("No organization found. Please create or select an organization.");
      }
      await organizationService.addMember(orgId, {
        ...memberForm,
        propertyScope: scopeMode === "ALL" ? [] : memberForm.propertyScope,
      });
      handleCloseAddModal();
      showFeedback("New team member added successfully");
      reloadMembers();
    } catch (err) {
      const msg = errMsg(err);
      setMemberFormError(msg);
      showFeedback(msg, "error");
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleRequestRemoveMember = (m: OrgMember) => {
    if (!canAssignRoles) {
      showFeedback("Forbidden: You lack permission 'role.assign' to remove members", "error");
      return;
    }
    setDeletingMember(m);
  };

  const handleConfirmRemoveMember = async () => {
    if (!deletingMember) return;
    setIsDeletingMember(true);
    try {
      const orgId = await getEffectiveOrgId();
      if (!orgId) throw new Error("No organization found");
      await organizationService.removeMember(orgId, deletingMember.userId);
      showFeedback(`Removed "${deletingMember.name || deletingMember.mobile}" from organization`);
      setDeletingMember(null);
      reloadMembers();
    } catch (err) {
      showFeedback(errMsg(err), "error");
    } finally {
      setIsDeletingMember(false);
    }
  };

  if (!canAssignRoles && !canReadRoles) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the required operational permission ('role.assign') to view or manage staff members in this organization.
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
      {/* Module Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Team & Staff Management
            </h2>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60">
              {members.length} Members
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Invite property managers, leasing staff, and assign custom operational roles with property scopes.
          </p>
        </div>

        {canAssignRoles && (
          <Button onClick={handleOpenAddMember} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Staff / Team Member</span>
          </Button>
        )}
      </div>

      {/* Instant Mobile Onboarding Notice Banner */}
      <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-100 text-xs text-slate-700 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-900">Instant Mobile Onboarding</p>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            Staff members added here are automatically saved in the database. When they open RentMate and enter their 10-digit mobile number, the platform immediately verifies them and signs them directly into their assigned workspace.
          </p>
        </div>
      </div>

      {/* Team Members Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-5 py-3.5">Team Member</th>
              <th className="px-5 py-3.5">Assigned Role</th>
              <th className="px-5 py-3.5">Property Scope</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No staff members onboarded yet. Click &quot;Add Staff / Team Member&quot; to invite your first employee.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const isOwner = m.roleSlug === "owner" || m.role === "Owner";
                return (
                  <tr key={m.memberId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{m.name || "Staff Member"}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{m.mobile}</span>
                      </div>
                      {m.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-300" />
                          <span>{m.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={isOwner ? "blue" : "indigo"}>
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {m.propertyScope.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3" />
                          All Properties
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                          {m.propertyScope.length} Assigned Building(s)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isOwner ? (
                        <Badge tone="green">ACTIVE</Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleMemberStatus(m)}
                          title="Click to toggle Active / Inactive status"
                          className="transition-transform active:scale-95"
                        >
                          <Badge tone={m.status === "ACTIVE" ? "green" : "red"} className="cursor-pointer">
                            {m.status}
                          </Badge>
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isOwner && canAssignRoles && (
                          <>
                            <button
                              onClick={() => handleToggleMemberStatus(m)}
                              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                m.status === "ACTIVE"
                                  ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                              title={m.status === "ACTIVE" ? "Deactivate Staff Member" : "Activate Staff Member"}
                            >
                              {m.status === "ACTIVE" ? (
                                <UserX className="h-4 w-4 text-amber-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-emerald-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEditMember(m)}
                              className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit Member Role & Scope"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRequestRemoveMember(m)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove from Organization"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Team Member */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Staff / Team Member</h2>
              <button
                onClick={handleCloseAddModal}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              {memberFormError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 font-semibold border border-red-200">
                  {memberFormError}
                </div>
              )}

              <Field label="10-Digit Mobile Number (Required for Login)">
                <Input
                  type="tel"
                  placeholder="e.g. 9876543211"
                  value={memberForm.mobile}
                  onChange={(e) => setMemberForm({ ...memberForm, mobile: e.target.value })}
                  required
                />
              </Field>

              <Field label="Full Name">
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={memberForm.name || ""}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  required
                />
              </Field>

              <Field label="Email Address">
                <Input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={memberForm.email || ""}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                />
              </Field>

              <Field label="Assign Operational Role">
                <Select
                  value={memberForm.roleId || ""}
                  onChange={(e) => setMemberForm({ ...memberForm, roleId: e.target.value })}
                  required
                >
                  <option value="">Select Role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.isSystem ? "System" : "Custom"})
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Property Scope Assignment */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-slate-800">Assigned Properties Scope:</p>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeMode === "ALL"}
                      onChange={() => {
                        setScopeMode("ALL");
                        setMemberForm({ ...memberForm, propertyScope: [] });
                      }}
                    />
                    <span>All Properties</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeMode === "CUSTOM"}
                      onChange={() => setScopeMode("CUSTOM")}
                    />
                    <span>Specific Building(s)</span>
                  </label>
                </div>

                {scopeMode === "CUSTOM" && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {properties.map((p) => {
                      const checked = memberForm.propertyScope?.includes(p.id) || false;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-white p-1.5 rounded-lg border border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const curr = memberForm.propertyScope || [];
                              const updated = e.target.checked
                                ? [...curr, p.id]
                                : curr.filter((id) => id !== p.id);
                              setMemberForm({ ...memberForm, propertyScope: updated });
                            }}
                          />
                          <span className="truncate">{p.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseAddModal}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingMember}>
                  {isSubmittingMember ? "Saving..." : "Onboard Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Team Member */}
      {Boolean(editingMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Staff Member</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Mobile: {editingMember?.mobile}</p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="mt-4 space-y-4">
              {editMemberFormError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 font-semibold border border-red-200">
                  {editMemberFormError}
                </div>
              )}

              <Field label="Full Name">
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={editMemberForm.name}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                  required
                />
              </Field>

              <Field label="Email Address">
                <Input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={editMemberForm.email}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                />
              </Field>

              <Field label="Assign Operational Role">
                <Select
                  value={editMemberForm.roleId}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, roleId: e.target.value })}
                >
                  <option value="">Keep current role ({editingMember?.role})</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.isSystem ? "System" : "Custom"})
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Property Scope Assignment */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-slate-800">Assigned Properties Scope:</p>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editScope"
                      checked={editScopeMode === "ALL"}
                      onChange={() => {
                        setEditScopeMode("ALL");
                        setEditMemberForm({ ...editMemberForm, propertyScope: [] });
                      }}
                    />
                    <span>All Properties</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="editScope"
                      checked={editScopeMode === "CUSTOM"}
                      onChange={() => setEditScopeMode("CUSTOM")}
                    />
                    <span>Specific Building(s)</span>
                  </label>
                </div>

                {editScopeMode === "CUSTOM" && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {properties.map((p) => {
                      const checked = editMemberForm.propertyScope?.includes(p.id) || false;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-white p-1.5 rounded-lg border border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const curr = editMemberForm.propertyScope || [];
                              const updated = e.target.checked
                                ? [...curr, p.id]
                                : curr.filter((id) => id !== p.id);
                              setEditMemberForm({ ...editMemberForm, propertyScope: updated });
                            }}
                          />
                          <span className="truncate">{p.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingMember}>
                  {isSubmittingMember ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirm Modal */}
      <ConfirmModal
        open={Boolean(deletingMember)}
        title="Remove Staff Member?"
        description={
          deletingMember
            ? `Are you sure you want to remove ${deletingMember.name || deletingMember.mobile} from ${currentOrg.name}? They will lose dashboard access and permissions to assigned properties.`
            : "Are you sure you want to remove this staff member?"
        }
        confirmText="Yes, Remove Staff Member"
        tone="danger"
        isLoading={isDeletingMember}
        onConfirm={handleConfirmRemoveMember}
        onClose={() => setDeletingMember(null)}
      />
    </div>
  );
}
