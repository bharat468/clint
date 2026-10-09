import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import PropertiesPage from "@/features/properties/PropertiesPage";
import TenantsPage from "@/features/tenants/TenantsPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import ApplicationsPage from "@/features/applications/ApplicationsPage";
import MaintenancePage from "@/features/maintenance/MaintenancePage";
import MyRentalsPage from "@/features/tenant/MyRentalsPage";
import SettingsLayout from "@/features/settings/layouts/SettingsLayout";
import TeamSettingsPage from "@/features/settings/pages/TeamSettingsPage";
import RolesSettingsPage from "@/features/settings/pages/RolesSettingsPage";
import OrganizationSettingsPage from "@/features/settings/pages/OrganizationSettingsPage";
import BillingSettingsPage from "@/features/settings/pages/BillingSettingsPage";

// Modular SuperAdmin Platform Architecture
import SuperAdminLayout from "@/features/superadmin/layouts/SuperAdminLayout";
import SuperAdminOverviewPage from "@/features/superadmin/pages/SuperAdminOverviewPage";
import SuperAdminOrganizationsPage from "@/features/superadmin/pages/SuperAdminOrganizationsPage";
import SuperAdminPropertiesPage from "@/features/superadmin/pages/SuperAdminPropertiesPage";
import SuperAdminLeasesPage from "@/features/superadmin/pages/SuperAdminLeasesPage";
import SuperAdminMaintenancePage from "@/features/superadmin/pages/SuperAdminMaintenancePage";
import SuperAdminPlansPage from "@/features/superadmin/pages/SuperAdminPlansPage";
import SuperAdminRolesPage from "@/features/superadmin/pages/SuperAdminRolesPage";
import SuperAdminUsersPage from "@/features/superadmin/pages/SuperAdminUsersPage";
import SuperAdminSettingsPage from "@/features/superadmin/pages/SuperAdminSettingsPage";
import { useAppSelector } from "@/app/hooks";

/**
 * Direct entry dispatcher:
 * - If unauthenticated -> Redirect to /login
 * - If SuperAdmin -> Redirect to /superadmin (Admin Dashboard)
 * - If Landlord/Staff -> Redirect to /dashboard (Landlord Dashboard)
 */
function IndexRedirect() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (Boolean(user.isSuperAdmin) || Boolean(user.adminRole)) {
    return <Navigate to="/superadmin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  // ============================================================
  // 1. ROOT DISPATCHER (Direct SaaS entry - No public marketing)
  // ============================================================
  { path: "/", element: <IndexRedirect /> },
  { path: "/admin", element: <Navigate to="/superadmin" replace /> },

  // ============================================================
  // 2. AUTHENTICATION ONBOARDING
  // ============================================================
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // ============================================================
  // 3. PROTECTED PLATFORM WORKSPACES
  // ============================================================
  {
    element: <ProtectedRoute />,
    children: [
      // A. Landlord & Property Operations Workspace (Dashboard 1)
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/properties", element: <PropertiesPage /> },
          { path: "/applications", element: <ApplicationsPage /> },
          { path: "/maintenance", element: <MaintenancePage /> },
          { path: "/tenant/my-rentals", element: <MyRentalsPage /> },
          { path: "/tenants", element: <TenantsPage /> },
          { path: "/payments", element: <PaymentsPage /> },
          {
            path: "/settings",
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="/settings/team" replace /> },
              { path: "team", element: <TeamSettingsPage /> },
              { path: "roles", element: <RolesSettingsPage /> },
              { path: "organization", element: <OrganizationSettingsPage /> },
              { path: "billing", element: <BillingSettingsPage /> },
            ],
          },
        ],
      },
      // B. SuperAdmin Platform Control Center (Dashboard 2)
      {
        path: "/superadmin",
        element: <SuperAdminLayout />,
        children: [
          { path: "", element: <SuperAdminOverviewPage /> },
          { path: "organizations", element: <SuperAdminOrganizationsPage /> },
          { path: "properties", element: <SuperAdminPropertiesPage /> },
          { path: "leases", element: <SuperAdminLeasesPage /> },
          { path: "maintenance", element: <SuperAdminMaintenancePage /> },
          { path: "plans", element: <SuperAdminPlansPage /> },
          { path: "roles", element: <SuperAdminRolesPage /> },
          { path: "users", element: <SuperAdminUsersPage /> },
          { path: "settings", element: <SuperAdminSettingsPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: <IndexRedirect /> },
]);
