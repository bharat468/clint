import { useState, useMemo } from "react";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Building2,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  X,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService, type CreateUserInput } from "@/services/admin.service";
import { roleService } from "@/services/role.service";
import { planService } from "@/services/plan.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { formatINR, errMsg } from "@/lib/utils";
import type { AdminUser, Role, Permission, Plan, Property } from "@/types";

type AdminTab = "overview" | "users" | "roles" | "plans";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesPageSize, setRolesPageSize] = useState(6);
  const [plansPage, setPlansPage] = useState(1);
  const [plansPageSize, setPlansPageSize] = useState(6);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
  });

  // Data queries
  const {
    data: overview,
    reload: reloadOverview,
  } = useApi(adminService.getOverview, null);

  const {
    data: users,
    reload: reloadUsers,
  } = useApi(adminService.listUsers, [] as AdminUser[]);

  const {
    data: roles,
    reload: reloadRoles,
  } = useApi(roleService.listRoles, [] as Role[]);

  const { data: permissions } = useApi(roleService.listPermissions, [] as Permission[]);
  const { data: plans, reload: reloadPlans } = useApi(planService.listPlans, [] as Plan[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);

  // Search and Filters
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // New User Form State
  const [userForm, setUserForm] = useState<CreateUserInput>({
    mobile: "",
    name: "",
    email: "",
    roleId: "",
    propertyScope: [],
  });
  const [userScopeMode, setUserScopeMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // New Role Form State
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

  // New Plan Form State
  const [planForm, setPlanForm] = useState<{
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    maxProperties: number;
    maxTenants: number;
    maxStaff: number;
    featuresText: string;
  }>({
    name: "",
    description: "",
    priceMonthly: 999,
    priceYearly: 9990,
    maxProperties: 10,
    maxTenants: 25,
    maxStaff: 3,
    featuresText: "Property Tracking\nRent Receipts\nFinancial Reports",
  });
  const [planFormError, setPlanFormError] = useState<string | null>(null);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

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

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchSearch =
        u.mobile.includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, userSearch, userStatusFilter]);

  // Handle User Creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    if (!/^\d{10}$/.test(userForm.mobile)) {
      setUserFormError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsSubmittingUser(true);
    try {
      await adminService.createUser({
        ...userForm,
        propertyScope: userScopeMode === "ALL" ? [] : userForm.propertyScope,
      });
      setIsUserModalOpen(false);
      setUserForm({ mobile: "", name: "", email: "", roleId: "", propertyScope: [] });
      setUserScopeMode("ALL");
      reloadUsers();
      reloadOverview();
    } catch (err) {
      setUserFormError(errMsg(err));
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Handle User Status Change
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateStatus(user.id, nextStatus);
      setToast({
        show: true,
        type: "success",
        message: `User status changed to ${nextStatus}.`,
      });
      reloadUsers();
    } catch (err) {
      setToast({ show: true, type: "error", message: errMsg(err) });
    }
  };

  // Handle Dynamic Role Creation
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

  // Handle Role Deletion
  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) return;
    try {
      await roleService.deleteRole(role.id);
      reloadRoles();
    } catch (err) {
      console.error(errMsg(err));
    }
  };

  // Handle Plan Creation
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanFormError(null);
    if (!planForm.name.trim()) {
      setPlanFormError("Plan name is required");
      return;
    }
    setIsSubmittingPlan(true);
    try {
      const features = planForm.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      await planService.createPlan({
        name: planForm.name,
        description: planForm.description,
        priceMonthly: Number(planForm.priceMonthly),
        priceYearly: Number(planForm.priceYearly),
        maxProperties: Number(planForm.maxProperties),
        maxTenants: Number(planForm.maxTenants),
        maxStaff: Number(planForm.maxStaff),
        features,
      });
      setIsPlanModalOpen(false);
      setPlanForm({
        name: "",
        description: "",
        priceMonthly: 999,
        priceYearly: 9990,
        maxProperties: 10,
        maxTenants: 25,
        maxStaff: 3,
        featuresText: "",
      });
      reloadPlans();
      reloadOverview();
    } catch (err) {
      setPlanFormError(errMsg(err));
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              SuperAdmin Control Center
            </h1>
            <Badge tone="blue">Master Portal</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Enterprise RBAC role builder, staff account management, and SaaS subscription tiers
          </p>
        </div>

        {/* Global Action Buttons based on Active Tab */}
        <div className="flex items-center gap-2">
          {activeTab === "users" && (
            <Button onClick={() => setIsUserModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Platform User</span>
            </Button>
          )}
          {activeTab === "roles" && (
            <Button onClick={() => setIsRoleModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Custom Role</span>
            </Button>
          )}
          {activeTab === "plans" && (
            <Button onClick={() => setIsPlanModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Subscription Plan</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users & Staff</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {users.length}
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
          <span>Dynamic Roles & RBAC</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {roles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "plans"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>SaaS Plans & Pricing</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {plans.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Platform KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card className="p-4 bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Total Users</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {overview?.totalUsers ?? users.length}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">Registered accounts</p>
            </Card>

            <Card className="p-4 bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>Properties</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {overview?.totalProperties ?? 0}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Managed units</p>
            </Card>

            <Card className="p-4 bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Active Tenants</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {overview?.totalTenants ?? 0}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Onboarded leases</p>
            </Card>

            <Card className="p-4 bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span>Collections</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatINR(overview?.totalCollected ?? 0)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Recorded receipts</p>
            </Card>

            <Card className="p-4 bg-white border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Layers className="h-4 w-4 text-amber-600" />
                <span>SaaS Plans</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {plans.length}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Active subscription tiers</p>
            </Card>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-5 bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Platform Users Directory</span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Directly onboard new property managers, accountants, and staff members by their 10-digit mobile number.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("users")}
                className="mt-4 gap-1.5 w-fit"
              >
                <span>Manage Users</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <span>Dynamic Role Builder</span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Design unlimited custom roles with specific granular checkboxes across properties, finances, and maintenance.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("roles")}
                className="mt-4 gap-1.5 w-fit"
              >
                <span>Configure Roles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>Subscription Tiers</span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Manage commercial pricing plans and quotas (max properties, max tenants, staff limits).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("plans")}
                className="mt-4 gap-1.5 w-fit"
              >
                <span>View Plans</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, mobile, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
              <Select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-36 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="SUSPENDED">Suspended Only</option>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">User & Contact</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Property Scope</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize)
                    .map((u) => {
                    const primaryRole = u.userRoles?.[0]?.role?.name || "Member";
                    const isSuperAdmin = (u as any).isSuperAdmin || primaryRole === "Owner";
                    const scope = u.userRoles?.[0]?.propertyScope || [];

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{u.name || "Unnamed User"}</div>
                          <div className="font-mono text-[11px] text-slate-500">{u.mobile}</div>
                          {u.email && <div className="text-[11px] text-slate-400">{u.email}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={isSuperAdmin ? "blue" : "indigo"}>
                            {primaryRole}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {scope.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              <CheckCircle2 className="h-3 w-3" />
                              All Properties
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              {scope.length} Assigned Building(s)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={u.status === "ACTIVE" ? "green" : "red"}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {!isSuperAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(u)}
                              className="text-[11px] h-7 px-2"
                            >
                              {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            currentPage={usersPage}
            pageSize={usersPageSize}
            totalRecords={filteredUsers.length}
            onPageChange={setUsersPage}
            onPageSizeChange={(newSize) => {
              setUsersPageSize(newSize);
              setUsersPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            apiEndpoint="GET /api/v1/admin/users"
          />
        </div>
      )}

      {/* TAB 3: DYNAMIC ROLES & PERMISSIONS */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles
              .slice((rolesPage - 1) * rolesPageSize, rolesPage * rolesPageSize)
              .map((r) => {
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
                      {r.description || "Custom role with selected granular permission scope"}
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

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">slug: {r.slug}</span>
                    {!r.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(r)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <DataTablePagination
            currentPage={rolesPage}
            pageSize={rolesPageSize}
            totalRecords={roles.length}
            onPageChange={setRolesPage}
            onPageSizeChange={(newSize) => {
              setRolesPageSize(newSize);
              setRolesPage(1);
            }}
            pageSizeOptions={[3, 6, 12, 24]}
            apiEndpoint="GET /api/v1/roles"
          />
        </div>
      )}

      {/* TAB 4: SAAS PLANS & PRICING */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans
              .slice((plansPage - 1) * plansPageSize, plansPage * plansPageSize)
              .map((p) => (
              <Card
                key={p.id}
                className={`p-6 bg-white border-2 flex flex-col justify-between shadow-xs transition-all ${
                  p.slug === "growth-plan"
                    ? "border-blue-600 ring-2 ring-blue-600/10"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    {p.slug === "growth-plan" && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{p.description}</p>

                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatINR(p.priceMonthly)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / month</span>
                  </div>

                  {/* Quotas */}
                  <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>Max Properties:</span>
                      <span className="font-bold text-slate-900">{p.maxProperties} Units</span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>Max Tenants:</span>
                      <span className="font-bold text-slate-900">{p.maxTenants} Tenants</span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>Staff Accounts:</span>
                      <span className="font-bold text-slate-900">{p.maxStaff} Team Members</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Capabilities:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {p.features?.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Badge tone={p.isActive ? "green" : "gray"}>
                    {p.isActive ? "Active Plan" : "Archived"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <DataTablePagination
            currentPage={plansPage}
            pageSize={plansPageSize}
            totalRecords={plans.length}
            onPageChange={setPlansPage}
            onPageSizeChange={(newSize) => {
              setPlansPageSize(newSize);
              setPlansPage(1);
            }}
            pageSizeOptions={[3, 6, 9, 15]}
            apiEndpoint="GET /api/v1/plans"
          />
        </div>
      )}

      {/* MODAL 1: ADD USER / STAFF MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Platform User / Staff</h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              {userFormError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                  {userFormError}
                </div>
              )}

              <Field label="10-Digit Mobile Number (Required)">
                <Input
                  type="tel"
                  placeholder="e.g. 9876500001"
                  value={userForm.mobile}
                  onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                  required
                />
              </Field>

              <Field label="Full Name">
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={userForm.name || ""}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </Field>

              <Field label="Email Address">
                <Input
                  type="email"
                  placeholder="e.g. rajesh@example.com"
                  value={userForm.email || ""}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </Field>

              <Field label="Assign Role">
                <Select
                  value={userForm.roleId || ""}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  required
                >
                  <option value="">Select a Role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.isSystem ? "System" : "Custom"})
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Property Scope Assignment */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-slate-800">Property Authorization Scope:</p>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={userScopeMode === "ALL"}
                      onChange={() => {
                        setUserScopeMode("ALL");
                        setUserForm({ ...userForm, propertyScope: [] });
                      }}
                    />
                    <span>All Properties</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={userScopeMode === "CUSTOM"}
                      onChange={() => setUserScopeMode("CUSTOM")}
                    />
                    <span>Specific Building(s)</span>
                  </label>
                </div>

                {userScopeMode === "CUSTOM" && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {properties.map((p) => {
                      const checked = userForm.propertyScope?.includes(p.id) || false;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-white p-1.5 rounded-lg border border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const curr = userForm.propertyScope || [];
                              const updated = e.target.checked
                                ? [...curr, p.id]
                                : curr.filter((id) => id !== p.id);
                              setUserForm({ ...userForm, propertyScope: updated });
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
                  onClick={() => setIsUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingUser}>
                  {isSubmittingUser ? "Creating..." : "Save User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DYNAMIC ROLE BUILDER WITH 25 PERMISSIONS MATRIX */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Dynamic Custom Role Builder</h2>
                <p className="text-xs text-slate-500">
                  Select granular permission checkboxes to define exact operational authority
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
                    placeholder="e.g. Field Supervisor"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Description">
                  <Input
                    placeholder="e.g. Handles on-site maintenance and rent inspections"
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
                                ? roleForm.permissionKeys.filter(
                                    (k) => !allModKeys.includes(k)
                                  )
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

      {/* MODAL 3: CREATE SAAS PLAN MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Subscription Plan</h2>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-4 space-y-4">
              {planFormError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                  {planFormError}
                </div>
              )}

              <Field label="Plan Name">
                <Input
                  placeholder="e.g. Starter Tier"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                />
              </Field>

              <Field label="Description">
                <Input
                  placeholder="e.g. Best for landlords with under 10 properties"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly Price (₹)">
                  <Input
                    type="number"
                    value={planForm.priceMonthly}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
                <Field label="Yearly Price (₹)">
                  <Input
                    type="number"
                    value={planForm.priceYearly}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, priceYearly: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Field label="Max Props">
                  <Input
                    type="number"
                    value={planForm.maxProperties}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, maxProperties: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
                <Field label="Max Tenants">
                  <Input
                    type="number"
                    value={planForm.maxTenants}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, maxTenants: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
                <Field label="Staff Limit">
                  <Input
                    type="number"
                    value={planForm.maxStaff}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, maxStaff: Number(e.target.value) })
                    }
                    required
                  />
                </Field>
              </div>

              <Field label="Features (One per line)">
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  rows={3}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPlanModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingPlan}>
                  {isSubmittingPlan ? "Saving..." : "Create Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
    </div>
  );
}
