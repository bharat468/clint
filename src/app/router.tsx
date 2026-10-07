import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import PropertiesPage from "@/features/properties/PropertiesPage";
import TenantsPage from "@/features/tenants/TenantsPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import SettingsPage from "@/features/settings/SettingsPage";

// Modular SuperAdmin Platform Architecture
import SuperAdminLayout from "@/features/superadmin/layouts/SuperAdminLayout";
import SuperAdminOverviewPage from "@/features/superadmin/pages/SuperAdminOverviewPage";
import SuperAdminOrganizationsPage from "@/features/superadmin/pages/SuperAdminOrganizationsPage";
import SuperAdminPlansPage from "@/features/superadmin/pages/SuperAdminPlansPage";
import SuperAdminRolesPage from "@/features/superadmin/pages/SuperAdminRolesPage";
import SuperAdminUsersPage from "@/features/superadmin/pages/SuperAdminUsersPage";
import SuperAdminSecurityPage from "@/features/superadmin/pages/SuperAdminSecurityPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      // 1. Standard Landlord & Staff Workspace
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/properties", element: <PropertiesPage /> },
          { path: "/tenants", element: <TenantsPage /> },
          { path: "/payments", element: <PaymentsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
      // 2. Dedicated Platform SuperAdmin Portal (Completely Modular Layout & Routes)
      {
        path: "/superadmin",
        element: <SuperAdminLayout />,
        children: [
          { path: "", element: <SuperAdminOverviewPage /> },
          { path: "organizations", element: <SuperAdminOrganizationsPage /> },
          { path: "plans", element: <SuperAdminPlansPage /> },
          { path: "roles", element: <SuperAdminRolesPage /> },
          { path: "users", element: <SuperAdminUsersPage /> },
          { path: "security", element: <SuperAdminSecurityPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
