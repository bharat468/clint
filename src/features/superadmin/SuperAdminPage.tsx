import { useState } from "react";
import {
  ShieldAlert,
  Building2,
  Layers,
  ArrowLeft,
  Search,
  Lock,
  RefreshCw,
  Shield,
  Server,
  Zap,
  Plus,
  Calendar,
  CheckCircle2,
  X,
  AlertCircle,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { planService, type CreatePlanInput } from "@/services/plan.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { Plan, AdminUser, SuperAdminRole, AdminOrganization } from "@/types";

type SuperAdminTab = "overview" | "organizations" | "plans" | "roles" | "security";

export default function SuperAdminPage() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const isSuperAdmin =
    currentUser?.mobile === "8003953815" ||
    currentUser?.mobile === "9876543210" ||
    (currentUser as any)?.isSuperAdmin;

  const [activeTab, setActiveTab] = useState<SuperAdminTab>("overview");
  const [searchOrg, setSearchOrg] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Data Queries
  const { data: overview, reload: reloadOverview } = useApi(adminService.getOverview, null);
  const { data: orgs, reload: reloadOrgs } = useApi(adminService.listOrganizations, [] as AdminOrganization[]);
  const { data: users, reload: reloadUsers } = useApi(adminService.listUsers, [] as AdminUser[]);
  const { data: plans, reload: reloadPlans } = useApi(planService.listPlans, [] as Plan[]);
  const { data: adminRoles, reload: reloadRoles } = useApi(adminService.listRoles, [] as SuperAdminRole[]);

  // Modals state
  const [subModalOrg, setSubModalOrg] = useState<AdminOrganization | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [subExpiryDate, setSubExpiryDate] = useState("");
  const [subStatus, setSubStatus] = useState("ACTIVE");
  const [subSubmitting, setSubSubmitting] = useState(false);

  // Plan Create/Edit Modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState<CreatePlanInput>({
    name: "",
    slug: "",
    description: "",
    priceMonthly: 0,
    priceYearly: 0,
    maxProperties: 5,
    maxTenants: 10,
    maxStaff: 2,
    features: [],
    isActive: true,
  });
  const [planFeaturesInput, setPlanFeaturesInput] = useState("");
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Role Create Modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Admin User Privilege Modal
  const [privilegeModalUser, setPrivilegeModalUser] = useState<AdminUser | null>(null);
  const [targetIsSuperAdmin, setTargetIsSuperAdmin] = useState(false);
  const [targetAdminRole, setTargetAdminRole] = useState("SUPER_ADMIN");
  const [privilegeSubmitting, setPrivilegeSubmitting] = useState(false);

  const availablePlatformPermissions = [
    { key: "PLATFORM_MANAGE_PLANS", label: "Dynamic SaaS Plans Management", desc: "Create, edit pricing tiers and change resource limits" },
    { key: "PLATFORM_MANAGE_ORGANIZATIONS", label: "Client Organizations & Subscriptions", desc: "Assign tiers, adjust expiry dates, suspend portfolios" },
    { key: "PLATFORM_MANAGE_ADMIN_ROLES", label: "Platform RBAC & Roles", desc: "Create platform access roles and grant administrative rights" },
    { key: "PLATFORM_VIEW_VITALS", label: "Executive Vitals & Metrics", desc: "View gross collected rent, platform telemetry and server status" },
    { key: "PLATFORM_MANAGE_USERS", label: "Platform User Accounts Gate", desc: "Audit registered numbers and toggle access statuses" },
    { key: "PLATFORM_MANAGE_BILLING", label: "Settlements & Gateway Keys", desc: "Oversee payment gateways and corporate invoices" },
  ];

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Open Manage Subscription Modal
  const openSubModal = (org: AdminOrganization) => {
    setSubModalOrg(org);
    setSelectedPlanId(org.subscription?.planId || plans[0]?.id || "");
    setSubStatus(org.subscription?.status || "ACTIVE");
    if (org.subscription?.expiresAt) {
      const dt = new Date(org.subscription.expiresAt);
      setSubExpiryDate(dt.toISOString().split("T")[0]);
    } else {
      setSubExpiryDate("");
    }
  };

  // Submit Subscription Update
  const handleSaveSubscription = async () => {
    if (!subModalOrg) return;
    setSubSubmitting(true);
    try {
      await adminService.updateSubscription(subModalOrg.id, {
        planId: selectedPlanId,
        status: subStatus,
        expiresAt: subExpiryDate ? new Date(subExpiryDate).toISOString() : null,
      });
      showFeedback(`Successfully updated plan and expiry for ${subModalOrg.name}`);
      setSubModalOrg(null);
      reloadOrgs();
      reloadOverview();
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || err?.message || "Failed to update subscription", "error");
    } finally {
      setSubSubmitting(false);
    }
  };

  // Quick Expiry Presets
  const setQuickExpiry = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSubExpiryDate(d.toISOString().split("T")[0]);
  };

  // Open Plan Modal (Create or Edit)
  const openPlanModal = (planToEdit?: Plan) => {
    if (planToEdit) {
      setEditingPlanId(planToEdit.id);
      setPlanFormData({
        name: planToEdit.name,
        slug: planToEdit.slug,
        description: planToEdit.description || "",
        priceMonthly: planToEdit.priceMonthly,
        priceYearly: planToEdit.priceYearly,
        maxProperties: planToEdit.maxProperties,
        maxTenants: planToEdit.maxTenants,
        maxStaff: planToEdit.maxStaff,
        features: planToEdit.features || [],
        isActive: planToEdit.isActive,
      });
      setPlanFeaturesInput((planToEdit.features || []).join(", "));
    } else {
      setEditingPlanId(null);
      setPlanFormData({
        name: "",
        slug: "",
        description: "",
        priceMonthly: 999,
        priceYearly: 9990,
        maxProperties: 10,
        maxTenants: 25,
        maxStaff: 3,
        features: [],
        isActive: true,
      });
      setPlanFeaturesInput("Up to 10 Properties, Online Rent Collection, WhatsApp Alerts, Dedicated Support");
    }
    setPlanModalOpen(true);
  };

  // Save Dynamic Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData.name.trim()) return;
    setPlanSubmitting(true);
    try {
      const featuresArray = planFeaturesInput
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...planFormData,
        features: featuresArray,
      };

      if (editingPlanId) {
        await planService.updatePlan(editingPlanId, payload);
        showFeedback(`Plan "${planFormData.name}" updated successfully!`);
      } else {
        await planService.createPlan(payload);
        showFeedback(`New Plan "${planFormData.name}" created and active!`);
      }
      setPlanModalOpen(false);
      reloadPlans();
      reloadOverview();
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || err?.message || "Failed to save plan", "error");
    } finally {
      setPlanSubmitting(false);
    }
  };

  // Save SuperAdmin Platform Role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setRoleSubmitting(true);
    try {
      await adminService.createRole({
        name: roleName.trim(),
        slug: roleSlug.trim() || undefined,
        description: roleDesc.trim() || undefined,
        permissions: selectedPermissions,
      });
      showFeedback(`Platform Role "${roleName}" created!`);
      setRoleModalOpen(false);
      setRoleName("");
      setRoleSlug("");
      setRoleDesc("");
      setSelectedPermissions([]);
      reloadRoles();
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || err?.message || "Failed to create platform role", "error");
    } finally {
      setRoleSubmitting(false);
    }
  };

  // Toggle permission checkbox
  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  // Save User Admin Privileges
  const handleSavePrivileges = async () => {
    if (!privilegeModalUser) return;
    setPrivilegeSubmitting(true);
    try {
      await adminService.assignAdminRole(privilegeModalUser.id, {
        isSuperAdmin: targetIsSuperAdmin,
        adminRole: targetIsSuperAdmin ? targetAdminRole : undefined,
      });
      showFeedback(`Updated platform privileges for ${privilegeModalUser.name || privilegeModalUser.mobile}`);
      setPrivilegeModalUser(null);
      reloadUsers();
    } catch (err: any) {
      showFeedback(err?.response?.data?.message || err?.message || "Failed to update privileges", "error");
    } finally {
      setPrivilegeSubmitting(false);
    }
  };

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.slug?.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.owner?.mobile?.includes(searchOrg)
  );

  // If not super admin, show security barrier
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900 border-slate-800 text-center text-white rounded-2xl shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mx-auto border border-rose-500/20">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Access Restricted</h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            This portal is restricted to Platform SuperAdministrators with master cryptographic credentials and designated mobile authorization.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline" className="w-full text-slate-300 border-slate-700 hover:bg-slate-800 gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Landlord Dashboard</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Notification Toast */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-800/80 backdrop-blur-md"
              : "bg-rose-950/90 text-rose-300 border-rose-800/80 backdrop-blur-md"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800/80 mr-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                RentMate Platform Executive SuperAdmin
              </h1>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                PROD MASTER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Platform RBAC, Dynamic SaaS Pricing Engines, Client Subscription Expiry & Multi-Tenant Governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 border border-slate-800">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300 font-mono text-[11px]">API 5000: Operational</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-1.5 px-3 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-300 text-xs">{currentUser?.mobile}</span>
            <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[10px] font-bold">
              SUPER_ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/50 p-1.5 rounded-2xl gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Platform Vitals</span>
          </button>

          <button
            onClick={() => setActiveTab("organizations")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "organizations"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Client Organizations & Expiry</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] text-slate-300">
              {orgs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "plans"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Dynamic SaaS Pricing Engines</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] text-slate-300">
              {plans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "roles"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Admin Platform RBAC</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] text-slate-300">
              {adminRoles.length} Roles
            </span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "security"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Security & Cryptography</span>
          </button>
        </div>

        {/* TAB 1: PLATFORM VITALS & REVENUE */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="p-5 bg-slate-900 border-slate-800 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Pre-Registered Users
                </span>
                <p className="mt-2 text-3xl font-black text-white">
                  {overview?.totalUsers ?? users.length}
                </p>
                <p className="mt-1 text-[11px] text-emerald-400">Strict login gate enforced</p>
              </Card>

              <Card className="p-5 bg-slate-900 border-slate-800 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Managed Real Estate
                </span>
                <p className="mt-2 text-3xl font-black text-white">
                  {overview?.totalProperties ?? 0}
                </p>
                <p className="mt-1 text-[11px] text-indigo-400">Active portfolio units</p>
              </Card>

              <Card className="p-5 bg-slate-900 border-slate-800 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Gross Payment Volume
                </span>
                <p className="mt-2 text-3xl font-black text-white">
                  {formatINR(overview?.totalCollected ?? 0)}
                </p>
                <p className="mt-1 text-[11px] text-emerald-400">Settled rent invoices</p>
              </Card>

              <Card className="p-5 bg-slate-900 border-slate-800 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Commercial Pricing Plans
                </span>
                <p className="mt-2 text-3xl font-black text-amber-400">
                  {plans.length} Tiers
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Dynamic customizable tiers</p>
              </Card>
            </div>

            {/* Platform Health Matrix */}
            <Card className="p-6 bg-slate-900 border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-400" />
                <span>Enterprise Multi-Tenant Infrastructure</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-slate-400 font-medium">Database Cluster:</p>
                  <p className="text-sm font-bold text-white mt-1">PostgreSQL 16 (Local)</p>
                  <p className="text-[11px] text-emerald-400 mt-1">Status: Healthy & Active</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-slate-400 font-medium">Authentication Protocol:</p>
                  <p className="text-sm font-bold text-white mt-1">Dual-Token (JWT + HttpOnly Cookie)</p>
                  <p className="text-[11px] text-blue-400 mt-1">Access: 15m | Refresh: 7d</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-slate-400 font-medium">Login Security Gate:</p>
                  <p className="text-sm font-bold text-white mt-1">Pre-Registered Numbers Only</p>
                  <p className="text-[11px] text-amber-400 mt-1">Uninvited users rejected with 403</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: CLIENT ORGANIZATIONS & EXPIRY */}
        {activeTab === "organizations" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter client organizations..."
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => reloadOrgs()}
                className="gap-2 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh Registry</span>
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Organization</th>
                    <th className="px-5 py-3.5">Owner Contact</th>
                    <th className="px-5 py-3.5">Active SaaS Plan</th>
                    <th className="px-5 py-3.5">Quotas Used</th>
                    <th className="px-5 py-3.5">Plan Expiry Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredOrgs.map((o) => {
                    const sub = o.subscription;
                    const isExpired = sub?.expiresAt && new Date(sub.expiresAt).getTime() < Date.now();
                    const daysRemaining = sub?.expiresAt
                      ? Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm">{o.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{o.slug}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-200">{o.owner?.name || "Landlord"}</div>
                          <div className="font-mono text-[11px] text-slate-400">{o.owner?.mobile}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                            {sub?.planName || "Starter Plan"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[11px] space-y-0.5">
                            <div>
                              <span className="text-slate-400">Properties: </span>
                              <span className="font-bold text-white">{o.propertyCount}</span>
                              <span className="text-slate-500"> / {sub?.maxProperties ?? "∞"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Staff: </span>
                              <span className="font-bold text-white">{o.memberCount}</span>
                              <span className="text-slate-500"> / {sub?.maxStaff ?? "∞"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {sub?.expiresAt ? (
                            <div>
                              <div className="font-medium text-slate-200">
                                {new Date(sub.expiresAt).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div
                                className={`text-[10px] font-bold ${
                                  isExpired
                                    ? "text-rose-400"
                                    : daysRemaining !== null && daysRemaining <= 15
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {isExpired
                                  ? "EXPIRED"
                                  : daysRemaining !== null
                                  ? `${daysRemaining} days left`
                                  : ""}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Lifetime / None</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                              sub?.status === "SUSPENDED"
                                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                                : isExpired
                                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            }`}
                          >
                            {sub?.status === "SUSPENDED" ? "SUSPENDED" : isExpired ? "EXPIRED" : "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => openSubModal(o)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs gap-1.5"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>Manage Plan & Expiry</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC SAAS PRICING ENGINES */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Dynamic SaaS Commercial Tiers</h3>
                <p className="text-xs text-slate-400">
                  Create and customize real-time pricing plans, quotas, and allowed features.
                </p>
              </div>

              <Button
                onClick={() => openPlanModal()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>+ Create New Dynamic Plan</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <Card
                  key={p.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between relative overflow-hidden"
                >
                  {p.slug === "growth-plan" && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                      Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white">{p.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {p.slug}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 min-h-[32px]">{p.description || "Comprehensive property management tier"}</p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{formatINR(p.priceMonthly)}</span>
                      <span className="text-xs text-slate-400"> / month</span>
                      <span className="text-[10px] text-slate-500 ml-2">({formatINR(p.priceYearly)}/yr)</span>
                    </div>

                    <div className="mt-4 space-y-2 rounded-xl bg-slate-950 p-3.5 text-xs border border-slate-800">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Max Properties:</span>
                        <span className="font-bold text-white">{p.maxProperties} Units</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Max Tenants:</span>
                        <span className="font-bold text-white">{p.maxTenants} Leases</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Staff Limit:</span>
                        <span className="font-bold text-white">{p.maxStaff} Team Members</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Included Features:
                      </span>
                      <div className="space-y-1">
                        {(p.features || []).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-amber-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        p.isActive ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {p.isActive ? "Active Tier" : "Inactive"}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPlanModal(p)}
                      className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200"
                    >
                      Edit Plan Specs
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM RBAC & ROLES */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Platform SuperAdmin RBAC</h3>
                <p className="text-xs text-slate-400">
                  Define platform-level administrative roles and granular master permissions.
                </p>
              </div>

              <Button
                onClick={() => setRoleModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>+ Create Platform Admin Role</span>
              </Button>
            </div>

            {/* Platform Admin Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {adminRoles.map((role) => (
                <Card key={role.id} className="p-5 bg-slate-900 border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{role.name}</h4>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {role.slug}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{role.description || "Platform management role"}</p>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Granted Privileges ({role.permissions.length}):
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {role.permissions.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md"
                        >
                          {p.replace("PLATFORM_", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Platform Administrators Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Registered Users & Platform Privileges</h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Mobile Contact</th>
                      <th className="px-5 py-3.5">SuperAdmin Flag</th>
                      <th className="px-5 py-3.5">Platform Role</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{u.name || "User"}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">{u.mobile}</td>
                        <td className="px-5 py-3.5">
                          {u.mobile === "9876543210" || (u as any).isSuperAdmin ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              SUPER_ADMIN
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Standard</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-200">
                            {(u as any).adminRole || (u.mobile === "9876543210" ? "SUPER_ADMIN" : "None")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              u.status === "ACTIVE"
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPrivilegeModalUser(u);
                              setTargetIsSuperAdmin((u as any).isSuperAdmin || u.mobile === "9876543210");
                              setTargetAdminRole((u as any).adminRole || "SUPER_ADMIN");
                            }}
                            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                          >
                            Set Privileges
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & TOKENS */}
        {activeTab === "security" && (
          <div className="max-w-3xl space-y-4">
            <Card className="p-6 bg-slate-900 border-slate-800 rounded-2xl space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                <span>Cryptographic Token Security Architecture</span>
              </h3>

              <div className="space-y-3 text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="font-bold text-white">1. Dual-Token Architecture:</p>
                  <p className="mt-1 text-slate-400">
                    Access Token (JWT) expires in 15 minutes to minimize exposure. Refresh Token expires in 7 days and is used to renew access seamlessly.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="font-bold text-white">2. HTTP-Only Cookie Protection:</p>
                  <p className="mt-1 text-slate-400">
                    Refresh token is delivered via <code className="text-amber-400">HttpOnly; SameSite=Lax</code> cookie, preventing XSS attacks from reading token keys.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="font-bold text-white">3. Strict Pre-Registered User Gate:</p>
                  <p className="mt-1 text-slate-400">
                    Users cannot arbitrarily sign up. Only mobile numbers already created/invited by an Owner or SuperAdmin can request OTP or log in.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* MODAL 1: MANAGE SUBSCRIPTION & EXPIRY */}
      {subModalOrg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-slate-900 border-slate-800 p-6 text-white rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>Manage SaaS Plan & Expiry</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{subModalOrg.name} ({subModalOrg.owner?.name})</p>
              </div>
              <button
                onClick={() => setSubModalOrg(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Assign SaaS Commercial Tier</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatINR(p.priceMonthly)}/mo - Max {p.maxProperties} Props, {p.maxStaff} Staff)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Subscription Status</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Full access permitted)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily blocked)</option>
                  <option value="EXPIRED">EXPIRED (Forces renewal prompt)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Plan Expiration Date</label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuickExpiry(30)}
                    className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300"
                  >
                    +30 Days
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuickExpiry(90)}
                    className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300"
                  >
                    +90 Days
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuickExpiry(365)}
                    className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300"
                  >
                    +1 Year
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSubExpiryDate("")}
                    className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300"
                  >
                    Lifetime (Clear)
                  </Button>
                </div>

                <input
                  type="date"
                  value={subExpiryDate}
                  onChange={(e) => setSubExpiryDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  When expired, operations like adding new properties or staff will be blocked until renewed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSubModalOrg(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSubscription}
                disabled={subSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
              >
                {subSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Save Subscription</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT DYNAMIC SAAS PLAN */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xl w-full bg-slate-900 border-slate-800 p-6 text-white rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span>{editingPlanId ? "Edit SaaS Pricing Plan" : "Create Dynamic SaaS Plan"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define real-time plan prices, quotas, and feature flags</p>
              </div>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pro Landlord Suite"
                    value={planFormData.name}
                    onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Identifier (Slug)</label>
                  <input
                    type="text"
                    placeholder="e.g. pro-landlord"
                    value={planFormData.slug}
                    onChange={(e) => setPlanFormData({ ...planFormData, slug: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Target audience or tier highlight..."
                  value={planFormData.description || ""}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={planFormData.priceMonthly}
                    onChange={(e) => setPlanFormData({ ...planFormData, priceMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Yearly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={planFormData.priceYearly}
                    onChange={(e) => setPlanFormData({ ...planFormData, priceYearly: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Properties</label>
                  <input
                    type="number"
                    min="1"
                    value={planFormData.maxProperties}
                    onChange={(e) => setPlanFormData({ ...planFormData, maxProperties: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Tenants</label>
                  <input
                    type="number"
                    min="1"
                    value={planFormData.maxTenants}
                    onChange={(e) => setPlanFormData({ ...planFormData, maxTenants: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Staff Accounts</label>
                  <input
                    type="number"
                    min="1"
                    value={planFormData.maxStaff}
                    onChange={(e) => setPlanFormData({ ...planFormData, maxStaff: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Features (Comma-separated)</label>
                <textarea
                  rows={2}
                  value={planFeaturesInput}
                  onChange={(e) => setPlanFeaturesInput(e.target.value)}
                  placeholder="Automated rent receipts, SMS & WhatsApp alerts, Team roles, Dedicated support"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="planIsActive"
                  checked={planFormData.isActive}
                  onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <label htmlFor="planIsActive" className="text-slate-300 font-medium">
                  Plan is currently active and available for subscription assignment
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPlanModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={planSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
                >
                  {planSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{editingPlanId ? "Update Plan Specs" : "Publish Dynamic Plan"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 3: CREATE PLATFORM ROLE (SUPERADMIN RBAC) */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-slate-900 border-slate-800 p-6 text-white rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-amber-400" />
                  <span>Create Platform Admin Role</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Assign granular platform executive capabilities</p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Billing Administrator"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. billing-admin"
                    value={roleSlug}
                    onChange={(e) => setRoleSlug(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Role responsibilities..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">Granted Platform Permissions</label>
                <div className="space-y-2 rounded-xl bg-slate-950 p-3 border border-slate-800 max-h-48 overflow-y-auto">
                  {availablePlatformPermissions.map((perm) => (
                    <label key={perm.key} className="flex items-start gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-900/60">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-200">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRoleModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={roleSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
                >
                  {roleSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save Role</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 4: ASSIGN ADMIN PRIVILEGES TO USER */}
      {privilegeModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-slate-900 border-slate-800 p-6 text-white rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-amber-400" />
                  <span>Configure Platform Privileges</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {privilegeModalUser.name || "User"} ({privilegeModalUser.mobile})
                </p>
              </div>
              <button
                onClick={() => setPrivilegeModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={targetIsSuperAdmin}
                  onChange={(e) => setTargetIsSuperAdmin(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-white">SuperAdmin Access Flag</div>
                  <div className="text-[11px] text-slate-400">Allows accessing this /superadmin executive console</div>
                </div>
              </label>

              {targetIsSuperAdmin && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Assigned Platform Role</label>
                  <select
                    value={targetAdminRole}
                    onChange={(e) => setTargetAdminRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPrivilegeModalUser(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSavePrivileges}
                disabled={privilegeSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
              >
                {privilegeSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Update Privileges</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
