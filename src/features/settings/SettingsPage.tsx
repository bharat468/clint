import { useState, useMemo } from "react";
import {
  Settings,
  Users,
  Building2,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { organizationService, type OrgMember, type AddMemberInput } from "@/services/organization.service";
import { roleService } from "@/services/role.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { errMsg, formatINR } from "@/lib/utils";
import type { Role, Permission, Property } from "@/types";

type SettingsTab = "team" | "roles" | "organization" | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("team");

  // Fetch Owner's organizations
  const { data: orgs } = useApi(organizationService.list, [] as any[]);
  const currentOrg = orgs[0] || { id: "default", name: "Bharat Estates", slug: "bharat-estates" };

  // Fetch Team Members
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
  const { data: roles, reload: reloadRoles } = useApi(roleService.listRoles, [] as Role[]);
  const { data: permissions } = useApi(roleService.listPermissions, [] as Permission[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // New Member Form State
  const [memberForm, setMemberForm] = useState<AddMemberInput>({
    mobile: "",
    name: "",
    email: "",
    roleId: "",
    propertyScope: [],
  });
  const [scopeMode, setScopeMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [memberFormError, setMemberFormError] = useState<string | null>(null);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // New Custom Role Form State
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
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Group permissions by module
  const permissionModules = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    });
    return Array.from(map.entries());
  }, [permissions]);

  // Handle Add Team Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberFormError(null);
    if (!/^\d{10}$/.test(memberForm.mobile)) {
      setMemberFormError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsSubmittingMember(true);
    try {
      const orgId = currentOrg?.id;
      await organizationService.addMember(orgId, {
        ...memberForm,
        propertyScope: scopeMode === "ALL" ? [] : memberForm.propertyScope,
      });
      setIsMemberModalOpen(false);
      setMemberForm({ mobile: "", name: "", email: "", roleId: "", propertyScope: [] });
      setScopeMode("ALL");
      reloadMembers();
    } catch (err) {
      setMemberFormError(errMsg(err));
    } finally {
      setIsSubmittingMember(false);
    }
  };

  // Handle Remove Team Member
  const handleRemoveMember = async (userId: string, name?: string | null) => {
    if (!confirm(`Are you sure you want to remove ${name || "this user"} from your organization?`)) return;
    try {
      await organizationService.removeMember(currentOrg.id, userId);
      reloadMembers();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  // Handle Create Dynamic Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormError(null);
    if (!roleForm.name.trim()) {
      setRoleFormError("Role name is required");
      return;
    }
    setIsSubmittingRole(true);
    try {
      await roleService.createRole({
        name: roleForm.name,
        description: roleForm.description,
        permissionKeys: roleForm.permissionKeys,
        organizationId: currentOrg.id,
      });
      setIsRoleModalOpen(false);
      setRoleForm({ name: "", description: "", permissionKeys: [] });
      reloadRoles();
    } catch (err) {
      setRoleFormError(errMsg(err));
    } finally {
      setIsSubmittingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Settings className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Settings & Organization
            </h1>
            <Badge tone="blue">{currentOrg?.name || "My Organization"}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage your team staff, create custom dynamic roles, and configure property scoping
          </p>
        </div>

        {/* Action Button based on tab */}
        <div className="flex items-center gap-2">
          {activeTab === "team" && (
            <Button onClick={() => setIsMemberModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Staff / Team Member</span>
            </Button>
          )}
          {activeTab === "roles" && (
            <Button onClick={() => setIsRoleModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Custom Role</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "team"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Team & Staff</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Roles & Permissions</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {roles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("organization")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "organization"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "billing"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Plan & Quotas</span>
        </button>
      </div>

      {/* TAB 1: TEAM & STAFF MEMBERS */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">Instant Mobile Onboarding</p>
              <p className="mt-0.5 text-slate-600">
                Staff members added here are automatically saved in the database. When they open RentMate and type their 10-digit mobile number, the system instantly greets them by name and logs them directly into their assigned role.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Team Member</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Property Scope</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No team members added yet. Click &quot;Add Staff / Team Member&quot; to onboard your team.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => {
                    const isOwner = m.roleSlug === "owner" || m.role === "Owner";
                    return (
                      <tr key={m.memberId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{m.name || "Staff Member"}</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{m.mobile}</span>
                          </div>
                          {m.email && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Mail className="h-3 w-3 text-slate-300" />
                              <span>{m.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={isOwner ? "blue" : "indigo"}>
                            {m.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {m.propertyScope.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              <CheckCircle2 className="h-3 w-3" />
                              All Properties
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              {m.propertyScope.length} Assigned Building(s)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={m.status === "ACTIVE" ? "green" : "red"}>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {!isOwner && (
                            <button
                              onClick={() => handleRemoveMember(m.userId, m.name)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Remove from Organization"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => {
              const permCount = r.permissions?.length || 0;
              return (
                <Card
                  key={r.id}
                  className="p-5 bg-white border-slate-200 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                      <Badge tone={r.isSystem ? "blue" : "purple"}>
                        {r.isSystem ? "System Role" : "Custom Dynamic"}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 min-h-[32px] leading-relaxed">
                      {r.description || "Custom operational role"}
                    </p>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Authorized Permissions:</span>
                        <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 font-bold">
                          {permCount} of {permissions.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>slug: {r.slug}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATION PROFILE */}
      {activeTab === "organization" && (
        <div className="max-w-2xl space-y-4">
          <Card className="p-6 bg-white border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Organization Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Company Name:</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{currentOrg?.name || "Bharat Estates"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Organization Slug:</span>
                <p className="font-mono text-slate-800 mt-0.5">{currentOrg?.slug || "bharat-estates"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Managed Properties:</span>
                <p className="font-bold text-slate-800 mt-0.5">{properties.length} Properties</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Active Staff:</span>
                <p className="font-bold text-slate-800 mt-0.5">{members.length} Members</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: BILLING & QUOTAS */}
      {activeTab === "billing" && (() => {
        const activeSub = currentOrg?.subscriptions?.[0] || null;
        const currentPlan = activeSub?.plan || {
          name: "Growth Plan",
          priceMonthly: 1499,
          maxProperties: 25,
          maxTenants: 60,
          maxStaff: 5,
        };
        const isExpired = activeSub?.expiresAt && new Date(activeSub.expiresAt).getTime() < Date.now();
        const daysRemaining = activeSub?.expiresAt
          ? Math.ceil((new Date(activeSub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="blue" className="bg-blue-800/80 text-blue-200 border-none">
                      Active SaaS Plan
                    </Badge>
                    {isExpired ? (
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                        EXPIRED
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {activeSub?.status || "ACTIVE"}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-2xl font-black">{currentPlan.name}</h3>
                  <p className="mt-1 text-xs text-blue-200">
                    {activeSub?.expiresAt
                      ? `Valid until ${new Date(activeSub.expiresAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })} (${daysRemaining} days left)`
                      : "Lifetime / Managed by Platform Admin"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold">{formatINR(currentPlan.priceMonthly)}</span>
                  <span className="text-xs text-blue-200"> / month</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-blue-800/80 pt-4 text-center">
                <div>
                  <p className="text-xl font-bold">
                    {properties.length} / {currentPlan.maxProperties}
                  </p>
                  <p className="text-[11px] text-blue-200">Properties Used</p>
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {members.length} / {currentPlan.maxStaff}
                  </p>
                  <p className="text-[11px] text-blue-200">Staff Accounts Used</p>
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {currentPlan.maxTenants}
                  </p>
                  <p className="text-[11px] text-blue-200">Max Tenants Allowed</p>
                </div>
              </div>
            </Card>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Plan Quota Enforcement:</p>
              <p>
                When property or staff quotas are reached, or if your subscription expires, creating new units or onboarding team members will require an upgrade from Platform SuperAdmin.
              </p>
            </div>
          </div>
        );
      })()}

      {/* MODAL: ADD TEAM MEMBER */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Staff / Team Member</h2>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              {memberFormError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
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
                  onClick={() => setIsMemberModalOpen(false)}
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

      {/* MODAL: CREATE CUSTOM ROLE */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Custom Role</h2>
                <p className="text-xs text-slate-500">
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

            <form onSubmit={handleCreateRole} className="mt-4 space-y-4">
              {roleFormError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                  {roleFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Role Name (e.g. Field Supervisor)">
                  <Input
                    placeholder="e.g. Maintenance Supervisor"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Description">
                  <Input
                    placeholder="e.g. Manages on-site building maintenance"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  />
                </Field>
              </div>

              {/* Categorized Permissions Matrix */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Granular Permission Matrix ({roleForm.permissionKeys.length} selected)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allKeys = permissions.map((p) => p.key);
                      setRoleForm({
                        ...roleForm,
                        permissionKeys:
                          roleForm.permissionKeys.length === allKeys.length ? [] : allKeys,
                      });
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {roleForm.permissionKeys.length === permissions.length
                      ? "Deselect All"
                      : "Select All Permissions"}
                  </button>
                </div>

                <div className="space-y-4">
                  {permissionModules.map(([modName, perms]) => {
                    const allModKeys = perms.map((p) => p.key);
                    const allChecked = allModKeys.every((k) =>
                      roleForm.permissionKeys.includes(k)
                    );

                    return (
                      <div
                        key={modName}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {modName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = allChecked
                                ? roleForm.permissionKeys.filter((k) => !allModKeys.includes(k))
                                : Array.from(new Set([...roleForm.permissionKeys, ...allModKeys]));
                              setRoleForm({ ...roleForm, permissionKeys: updated });
                            }}
                            className="text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            {allChecked ? "Uncheck Module" : "Check Module"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {perms.map((p) => {
                            const checked = roleForm.permissionKeys.includes(p.key);
                            return (
                              <label
                                key={p.id}
                                className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5 rounded text-blue-600"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...roleForm.permissionKeys, p.key]
                                      : roleForm.permissionKeys.filter((k) => k !== p.key);
                                    setRoleForm({ ...roleForm, permissionKeys: next });
                                  }}
                                />
                                <div>
                                  <p className="font-semibold text-slate-800">{p.key}</p>
                                  {p.description && (
                                    <p className="text-[10px] text-slate-500">{p.description}</p>
                                  )}
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingRole}>
                  {isSubmittingRole ? "Creating Role..." : "Create Custom Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
