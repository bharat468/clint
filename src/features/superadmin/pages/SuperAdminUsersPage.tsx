import { useState, useMemo } from "react";
import {
  RefreshCw,
  Shield,
  Plus,
  Search,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  ShieldAlert,
  Building2,
  Users as UsersIcon,
  Crown,
  Home,
  User,
  Filter,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { canAccessPlatform } from "@/lib/permissions";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { Field } from "@/components/ui/field";
import { State } from "@/components/ui/page";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import PrivilegeModal from "../components/PrivilegeModal";
import type { AdminUser, SuperAdminRole, AdminOrganization } from "@/types";

export type UserHierarchyCategory = "ALL" | "SUPERADMIN" | "LANDLORD" | "STAFF" | "TENANT";

export interface UserHierarchyInfo {
  levelKey: "SUPERADMIN" | "PLATFORM_ADMIN" | "LANDLORD" | "STAFF" | "TENANT" | "STANDARD";
  levelName: string;
  badgeColor: string;
  badgeIcon: any;
  organizationName: string;
  organizationRole: string;
  isPlatformGovernor: boolean;
}

export function computeUserHierarchy(u: AdminUser): UserHierarchyInfo {
  const isSuper = Boolean(u.isSuperAdmin) || u.adminRole === "SUPER_ADMIN";
  if (isSuper) {
    return {
      levelKey: "SUPERADMIN",
      levelName: "Platform SuperAdmin",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      badgeIcon: Crown,
      organizationName: "Platform Core",
      organizationRole: "Root Governor",
      isPlatformGovernor: true,
    };
  }

  if (Boolean(u.adminRole)) {
    return {
      levelKey: "PLATFORM_ADMIN",
      levelName: `Platform Executive (${u.adminRole})`,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      badgeIcon: Shield,
      organizationName: "Platform Core",
      organizationRole: u.adminRole || "Executive",
      isPlatformGovernor: true,
    };
  }

  const owned = (u as any).ownedOrganizations || [];
  if (owned.length > 0) {
    return {
      levelKey: "LANDLORD",
      levelName: "Landlord / Owner",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeIcon: Building2,
      organizationName: owned[0].name,
      organizationRole: "Organization Owner",
      isPlatformGovernor: false,
    };
  }

  const members = (u as any).organizationMembers || [];
  const ownerMember = members.find((m: any) => m.role === "OWNER" || m.role === "LANDLORD");
  if (ownerMember) {
    return {
      levelKey: "LANDLORD",
      levelName: "Landlord / Owner",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeIcon: Building2,
      organizationName: ownerMember.organization?.name || "Landlord Workspace",
      organizationRole: "Organization Owner",
      isPlatformGovernor: false,
    };
  }

  const staffMember = members.find((m: any) => m.role !== "OWNER" && m.role !== "LANDLORD" && m.role !== "TENANT");
  if (staffMember) {
    return {
      levelKey: "STAFF",
      levelName: `Staff (${staffMember.role || "Member"})`,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      badgeIcon: UsersIcon,
      organizationName: staffMember.organization?.name || "Client Org",
      organizationRole: staffMember.role || "Staff Member",
      isPlatformGovernor: false,
    };
  }

  const userRoles = (u as any).userRoles || [];
  if (userRoles.length > 0) {
    const ur = userRoles[0];
    return {
      levelKey: "STAFF",
      levelName: `Staff (${ur.role?.name || "Assigned"})`,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      badgeIcon: UsersIcon,
      organizationName: ur.organization?.name || "Client Org",
      organizationRole: ur.role?.name || "Staff Member",
      isPlatformGovernor: false,
    };
  }

  const tenantMember = members.find((m: any) => m.role === "TENANT");
  if (tenantMember) {
    return {
      levelKey: "TENANT",
      levelName: "Tenant / Resident",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      badgeIcon: Home,
      organizationName: tenantMember.organization?.name || "Rented Unit",
      organizationRole: "Tenant",
      isPlatformGovernor: false,
    };
  }

  return {
    levelKey: "STANDARD",
    levelName: "Standard User",
    badgeColor: "bg-slate-50 text-slate-600 border-slate-200",
    badgeIcon: User,
    organizationName: "Direct Account",
    organizationRole: "User",
    isPlatformGovernor: false,
  };
}

export default function SuperAdminUsersPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManageUsers = canAccessPlatform(user, "PLATFORM_MANAGE_USERS");

  const { data: users, loading, error, reload: reloadUsers } = useApi(
    canManageUsers ? adminService.listUsers : async () => [],
    [] as AdminUser[]
  );
  const { data: adminRoles } = useApi(adminService.listRoles, [] as SuperAdminRole[]);
  const { data: organizations } = useApi(adminService.listOrganizations, [] as AdminOrganization[]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [privilegeUser, setPrivilegeUser] = useState<AdminUser | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [hierarchyFilter, setHierarchyFilter] = useState<UserHierarchyCategory>("ALL");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>("ALL");

  // Create form state
  const [newUser, setNewUser] = useState({
    mobile: "",
    name: "",
    email: "",
    accountType: "CLIENT_USER" as "PLATFORM_ADMIN" | "CLIENT_USER",
    organizationId: "",
  });
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const handleOpenEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({ name: u.name || "", email: u.email || "", mobile: u.mobile });
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "", mobile: "" });
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
        organizationId: newUser.organizationId || undefined,
      });
      showFeedback("New user registered successfully");
      setCreateModalOpen(false);
      setNewUser({
        mobile: "",
        name: "",
        email: "",
        accountType: "CLIENT_USER",
        organizationId: "",
      });
      reloadUsers();
    } catch (err: any) {
      setFormError(err?.message || "Failed to register user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewUser({
      mobile: "",
      name: "",
      email: "",
      accountType: "CLIENT_USER",
      organizationId: "",
    });
    setFormError(null);
  };

  // Metrics summary
  const metrics = useMemo(() => {
    let platformGovernors = 0;
    let landlords = 0;
    let staffMembers = 0;
    let tenants = 0;

    users.forEach((u) => {
      const h = computeUserHierarchy(u);
      if (h.isPlatformGovernor) platformGovernors++;
      else if (h.levelKey === "LANDLORD") landlords++;
      else if (h.levelKey === "STAFF") staffMembers++;
      else if (h.levelKey === "TENANT") tenants++;
    });

    return {
      total: users.length,
      platformGovernors,
      landlords,
      staffMembers,
      tenants,
    };
  }, [users]);

  // Hierarchical Filtered List
  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();

    return users.filter((u) => {
      const h = computeUserHierarchy(u);

      // Search match
      const matchesSearch =
        u.name?.toLowerCase().includes(q) ||
        u.mobile?.includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        h.organizationName.toLowerCase().includes(q) ||
        h.levelName.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Hierarchy level filter
      if (hierarchyFilter === "SUPERADMIN" && !h.isPlatformGovernor) return false;
      if (hierarchyFilter === "LANDLORD" && h.levelKey !== "LANDLORD") return false;
      if (hierarchyFilter === "STAFF" && h.levelKey !== "STAFF") return false;
      if (hierarchyFilter === "TENANT" && h.levelKey !== "TENANT") return false;

      // Organization filter
      if (selectedOrgFilter !== "ALL") {
        const owned = (u as any).ownedOrganizations || [];
        const isOwner = owned.some((o: any) => o.id === selectedOrgFilter);
        const members = (u as any).organizationMembers || [];
        const isMember = members.some((m: any) => m.organization?.id === selectedOrgFilter);
        const userRoles = (u as any).userRoles || [];
        const hasRole = userRoles.some((ur: any) => ur.organization?.id === selectedOrgFilter);

        if (!isOwner && !isMember && !hasRole) return false;
      }

      return true;
    });
  }, [users, searchTerm, hierarchyFilter, selectedOrgFilter]);

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          You lack the platform permission ('PLATFORM_MANAGE_USERS') required to audit and manage registered users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              User Directory & Hierarchy
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              Multi-Tenant Governance
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Audit registered accounts with clear hierarchy separation between Platform Admins, Landlords, Staff, and Tenants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setFormError(null);
              setCreateModalOpen(true);
            }}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reloadUsers()}
            className="gap-1.5 text-slate-700 font-semibold border-slate-300 shadow-2xs bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Hierarchy KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setHierarchyFilter("SUPERADMIN")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            hierarchyFilter === "SUPERADMIN"
              ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-purple-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Platform Governors
            </span>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Crown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics.platformGovernors}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">SuperAdmins & System Execs</p>
        </div>

        <div
          onClick={() => setHierarchyFilter("LANDLORD")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            hierarchyFilter === "LANDLORD"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-emerald-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Landlords & Owners
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.landlords}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Client Organization Owners</p>
        </div>

        <div
          onClick={() => setHierarchyFilter("STAFF")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            hierarchyFilter === "STAFF"
              ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-amber-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Landlord Staff & Team
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <UsersIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.staffMembers}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Property Managers & Staff</p>
        </div>

        <div
          onClick={() => setHierarchyFilter("ALL")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            hierarchyFilter === "ALL"
              ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-blue-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Total Accounts
            </span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">All Registered Profiles</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Hierarchy Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setHierarchyFilter("ALL");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              hierarchyFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({metrics.total})
          </button>

          <button
            type="button"
            onClick={() => {
              setHierarchyFilter("SUPERADMIN");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              hierarchyFilter === "SUPERADMIN"
                ? "bg-white text-purple-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-purple-700"
            }`}
          >
            <Crown className="h-3 w-3 text-purple-600" />
            <span>Platform Admins ({metrics.platformGovernors})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHierarchyFilter("LANDLORD");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              hierarchyFilter === "LANDLORD"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <Building2 className="h-3 w-3 text-emerald-600" />
            <span>Landlords & Owners ({metrics.landlords})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHierarchyFilter("STAFF");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              hierarchyFilter === "STAFF"
                ? "bg-white text-amber-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-amber-700"
            }`}
          >
            <UsersIcon className="h-3 w-3 text-amber-600" />
            <span>Landlord Staff ({metrics.staffMembers})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHierarchyFilter("TENANT");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              hierarchyFilter === "TENANT"
                ? "bg-white text-teal-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-teal-700"
            }`}
          >
            <Home className="h-3 w-3 text-teal-600" />
            <span>Tenants ({metrics.tenants})</span>
          </button>
        </div>

        {/* Search & Organization Workspace Filter */}
        <div className="flex items-center gap-2">
          {/* Organization filter dropdown */}
          <div className="relative min-w-[200px]">
            <Select
              value={selectedOrgFilter}
              onChange={(e) => {
                setSelectedOrgFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 text-xs font-medium"
            >
              <option value="ALL">All Workspaces & Orgs</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search user, mobile, org..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 text-xs h-9 bg-white shadow-2xs"
            />
          </div>
        </div>
      </div>

      <State loading={loading} error={error} empty={false} />

      {/* Main Hierarchy Table */}
      {!loading && !error && (
        <Card className="overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Hierarchy & Scope</th>
                  <th className="px-5 py-3.5">Landlord Workspace / Org</th>
                  <th className="px-5 py-3.5">Mobile Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Filter className="h-6 w-6 text-slate-300" />
                        <p className="font-semibold text-slate-600">No users found</p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your hierarchy filter or search term.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((u) => {
                      const h = computeUserHierarchy(u);
                      const BadgeIcon = h.badgeIcon;
                      const isActive = u.status === "ACTIVE";

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* User Avatar & Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                                {(u.name || u.mobile || "U").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-snug">
                                  {u.name || "Unnamed User"}
                                </p>
                                {u.email ? (
                                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                    {u.email}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">No email</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Hierarchy Badge */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${h.badgeColor}`}
                            >
                              <BadgeIcon className="h-3 w-3" />
                              <span>{h.levelName}</span>
                            </span>
                          </td>

                          {/* Landlord Workspace / Organization Column */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {h.isPlatformGovernor ? (
                                <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50/70 border border-purple-200/60 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                                  <Shield className="h-3.5 w-3.5 text-purple-600" />
                                  <span>Platform Governance</span>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                                    <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                    <span>{h.organizationName}</span>
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {h.organizationRole}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Mobile Phone */}
                          <td className="px-5 py-3.5 font-mono text-slate-800 font-medium">
                            {u.mobile}
                          </td>

                          {/* Account Status */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isActive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              <span>{u.status}</span>
                            </span>
                          </td>

                          {/* Registered Date */}
                          <td className="px-5 py-3.5 text-[11px] text-slate-500">
                            {u.createdAt ? formatDateTime(u.createdAt) : "—"}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Toggle Status */}
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
                                className="text-xs h-7 px-2 border-slate-200"
                                title="Edit user details"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPrivilegeUser(u)}
                                className="text-xs h-7 border-slate-200 font-semibold"
                              >
                                Privileges
                              </Button>

                              <button
                                onClick={() => handleRequestDelete(u)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalRecords={filteredUsers.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            apiEndpoint="GET /api/v1/admin/users"
          />
        </Card>
      )}

      {/* Create User Modal with Hierarchy Support */}
      <Modal
        open={createModalOpen}
        title="Create Platform or Landlord User"
        subtitle="Register user credentials with explicit hierarchy placement"
        onClose={handleCloseCreateModal}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          {/* Account Hierarchy Placement */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Account Placement Scope *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  newUser.accountType === "CLIENT_USER"
                    ? "bg-blue-50/70 border-blue-500 text-blue-900"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="CLIENT_USER"
                  checked={newUser.accountType === "CLIENT_USER"}
                  onChange={() =>
                    setNewUser({ ...newUser, accountType: "CLIENT_USER" })
                  }
                  className="h-3.5 w-3.5 text-blue-600"
                />
                <div>
                  <div className="font-bold text-xs">Landlord / Client User</div>
                  <div className="text-[10px] text-slate-500">Under an Organization</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  newUser.accountType === "PLATFORM_ADMIN"
                    ? "bg-purple-50/70 border-purple-500 text-purple-900"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="PLATFORM_ADMIN"
                  checked={newUser.accountType === "PLATFORM_ADMIN"}
                  onChange={() =>
                    setNewUser({ ...newUser, accountType: "PLATFORM_ADMIN", organizationId: "" })
                  }
                  className="h-3.5 w-3.5 text-purple-600"
                />
                <div>
                  <div className="font-bold text-xs">Platform Governance</div>
                  <div className="text-[10px] text-slate-500">SuperAdmin / Exec</div>
                </div>
              </label>
            </div>
          </div>

          {/* Organization Picker if Client User */}
          {newUser.accountType === "CLIENT_USER" && (
            <Field label="Assign to Landlord Organization (Optional)">
              <Select
                value={newUser.organizationId}
                onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}
                placeholder="None (Independent Direct User)"
              >
                <option value="">None (Independent Direct User)</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="10-Digit Mobile Number" required>
            <Input
              maxLength={10}
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
            <Button type="button" variant="outline" onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={Boolean(editingUser)}
        title="Edit User Details"
        subtitle={`Updating information for ${editingUser?.name || editingUser?.mobile}`}
        onClose={handleCloseEditModal}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Field label="Full Name">
            <Input
              placeholder="e.g. John Doe"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              placeholder="e.g. john@example.com"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </Field>

          <Field label="Mobile Number">
            <Input
              maxLength={10}
              placeholder="10-digit mobile"
              value={editForm.mobile}
              onChange={(e) =>
                setEditForm({ ...editForm, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Privilege Modal */}
      {privilegeUser && (
        <PrivilegeModal
          user={privilegeUser}
          adminRoles={adminRoles}
          onClose={() => setPrivilegeUser(null)}
          onSuccess={(msg) => {
            showFeedback(msg);
            setPrivilegeUser(null);
            reloadUsers();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingUser)}
        title="Delete User Account"
        description={`Are you sure you want to delete user account "${deletingUser?.name || deletingUser?.mobile}"? This action cannot be undone.`}
        confirmText="Delete User"
        loading={isDeleting}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
}
