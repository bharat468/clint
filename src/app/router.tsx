import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import { useAppSelector } from "@/app/hooks";
import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";
import { RouteLoadingFallback } from "@/components/ui/RouteLoadingFallback";

/**
 * Helper to wrap dynamically imported lazy components in Suspense with
 * our unified brand loading indicator.
 */
function withSuspense(
  Component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>
) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Component />
    </Suspense>
  );
}

// ============================================================
// 1. LAZY LOADED PUBLIC MARKETING SITE
// ============================================================
const PublicLayout = lazy(() => import("@/features/public/layouts/PublicLayout"));
const LandingPage = lazy(() => import("@/features/public/pages/LandingPage"));
const FeaturesPage = lazy(() => import("@/features/public/pages/FeaturesPage"));
const PricingPage = lazy(() => import("@/features/public/pages/PricingPage"));
const AboutPage = lazy(() => import("@/features/public/pages/AboutPage"));
const ContactPage = lazy(() => import("@/features/public/pages/ContactPage"));
const FaqPage = lazy(() => import("@/features/public/pages/FaqPage"));
const RentalsMarketplacePage = lazy(() => import("@/features/public/pages/RentalsMarketplacePage"));
const TermsPage = lazy(() => import("@/features/public/pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("@/features/public/pages/PrivacyPolicyPage"));

// ============================================================
// 2. LAZY LOADED AUTHENTICATION & ONBOARDING
// ============================================================
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));

// ============================================================
// 2. LAZY LOADED CORE LANDLORD & TENANT WORKSPACES
// ============================================================
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const PropertiesPage = lazy(() => import("@/features/properties/PropertiesPage"));
const TenantsPage = lazy(() => import("@/features/tenants/TenantsPage"));
const PaymentsPage = lazy(() => import("@/features/payments/PaymentsPage"));
const ApplicationsPage = lazy(() => import("@/features/applications/ApplicationsPage"));
const MaintenancePage = lazy(() => import("@/features/maintenance/MaintenancePage"));
const MyRentalsPage = lazy(() => import("@/features/tenant/MyRentalsPage"));

// ============================================================
// 3. LAZY LOADED SETTINGS & RBAC WORKSPACES
// ============================================================
const SettingsLayout = lazy(() => import("@/features/settings/layouts/SettingsLayout"));
const TeamSettingsPage = lazy(() => import("@/features/settings/pages/TeamSettingsPage"));
const RolesSettingsPage = lazy(() => import("@/features/settings/pages/RolesSettingsPage"));
const OrganizationSettingsPage = lazy(() => import("@/features/settings/pages/OrganizationSettingsPage"));

// ============================================================
// 4. LAZY LOADED SUPERADMIN CONTROL CENTER
// ============================================================
const SuperAdminLayout = lazy(() => import("@/features/superadmin/layouts/SuperAdminLayout"));
const SuperAdminOverviewPage = lazy(() => import("@/features/superadmin/pages/SuperAdminOverviewPage"));
const SuperAdminOrganizationsPage = lazy(() => import("@/features/superadmin/pages/SuperAdminOrganizationsPage"));
const SuperAdminPropertiesPage = lazy(() => import("@/features/superadmin/pages/SuperAdminPropertiesPage"));
const SuperAdminLeasesPage = lazy(() => import("@/features/superadmin/pages/SuperAdminLeasesPage"));
const SuperAdminMaintenancePage = lazy(() => import("@/features/superadmin/pages/SuperAdminMaintenancePage"));
const SuperAdminPlansPage = lazy(() => import("@/features/superadmin/pages/SuperAdminPlansPage"));
const SuperAdminRolesPage = lazy(() => import("@/features/superadmin/pages/SuperAdminRolesPage"));
const SuperAdminUsersPage = lazy(() => import("@/features/superadmin/pages/SuperAdminUsersPage"));
const SuperAdminSettingsPage = lazy(() => import("@/features/superadmin/pages/SuperAdminSettingsPage"));

// ============================================================
// 5. LAZY LOADED ERROR / 404
// ============================================================
const NotFoundPage = lazy(() => import("@/features/errors/NotFoundPage"));


/**
 * PublicOnlyRoute:
 * Prevents logged-in users from seeing login/register forms,
 * redirecting them smoothly to their active workspace.
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);

  if (user) {
    if (Boolean(user.isSuperAdmin) || Boolean(user.adminRole)) {
      return <Navigate to="/superadmin" replace />;
    }
    if (user.role?.toUpperCase() === "TENANT") {
      return <Navigate to="/tenant/my-rentals" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  // ============================================================
  // 1. PUBLIC MARKETING WEBSITE (Root Domain Entry)
  // ============================================================
  {
    element: withSuspense(PublicLayout),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: withSuspense(LandingPage) },
      { path: "/features", element: withSuspense(FeaturesPage) },
      { path: "/pricing", element: withSuspense(PricingPage) },
      { path: "/about", element: withSuspense(AboutPage) },
      { path: "/contact", element: withSuspense(ContactPage) },
      { path: "/faq", element: withSuspense(FaqPage) },
      { path: "/rentals", element: withSuspense(RentalsMarketplacePage) },
      { path: "/terms", element: withSuspense(TermsPage) },
      { path: "/privacy", element: withSuspense(PrivacyPolicyPage) },
    ],
  },
  { path: "/admin", element: <Navigate to="/superadmin" replace />, errorElement: <RouteErrorBoundary /> },

  // ============================================================
  // 2. AUTHENTICATION ONBOARDING (Protected from already logged-in users)
  // ============================================================
  {
    path: "/login",
    element: <PublicOnlyRoute>{withSuspense(LoginPage)}</PublicOnlyRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <PublicOnlyRoute>{withSuspense(RegisterPage)}</PublicOnlyRoute>,
    errorElement: <RouteErrorBoundary />,
  },

  // ============================================================
  // 3. PROTECTED PLATFORM WORKSPACES
  // ============================================================
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
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
              { path: "billing", element: <Navigate to="/settings/organization" replace /> },
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

  // ============================================================
  // 4. NOT FOUND / 404 MODULE
  // ============================================================
  { path: "/404", element: withSuspense(NotFoundPage), errorElement: <RouteErrorBoundary /> },

  // Catch-all route for any unmapped URL
  { path: "*", element: withSuspense(NotFoundPage), errorElement: <RouteErrorBoundary /> },
]);

export default router;
