import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import PropertiesPage from "@/features/properties/PropertiesPage";
import TenantsPage from "@/features/tenants/TenantsPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import SettingsLayout from "@/features/settings/layouts/SettingsLayout";
import TeamSettingsPage from "@/features/settings/pages/TeamSettingsPage";
import RolesSettingsPage from "@/features/settings/pages/RolesSettingsPage";
import OrganizationSettingsPage from "@/features/settings/pages/OrganizationSettingsPage";
import BillingSettingsPage from "@/features/settings/pages/BillingSettingsPage";

// Public Marketing Website
import PublicLayout from "@/features/public/layouts/PublicLayout";
import LandingPage from "@/features/public/pages/LandingPage";
import FeaturesPage from "@/features/public/pages/FeaturesPage";
import PricingPage from "@/features/public/pages/PricingPage";
import AboutPage from "@/features/public/pages/AboutPage";
import ContactPage from "@/features/public/pages/ContactPage";
import FaqPage from "@/features/public/pages/FaqPage";
import PrivacyPolicyPage from "@/features/public/pages/PrivacyPolicyPage";
import TermsPage from "@/features/public/pages/TermsPage";

// Modular SuperAdmin Platform Architecture
import SuperAdminLayout from "@/features/superadmin/layouts/SuperAdminLayout";
import SuperAdminOverviewPage from "@/features/superadmin/pages/SuperAdminOverviewPage";
import SuperAdminOrganizationsPage from "@/features/superadmin/pages/SuperAdminOrganizationsPage";
import SuperAdminPlansPage from "@/features/superadmin/pages/SuperAdminPlansPage";
import SuperAdminRolesPage from "@/features/superadmin/pages/SuperAdminRolesPage";
import SuperAdminUsersPage from "@/features/superadmin/pages/SuperAdminUsersPage";
import SuperAdminSettingsPage from "@/features/superadmin/pages/SuperAdminSettingsPage";

export const router = createBrowserRouter([
  // ============================================================
  // 1. PUBLIC MARKETING WEBSITE ROUTES (No Auth Required)
  // ============================================================
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/features", element: <FeaturesPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/faq", element: <FaqPage /> },
      { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
      { path: "/terms-and-conditions", element: <TermsPage /> },
    ],
  },

  // ============================================================
  // 2. AUTHENTICATION ONBOARDING
  // ============================================================
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // ============================================================
  // 3. PROTECTED PLATFORM HUBS
  // ============================================================
  {
    element: <ProtectedRoute />,
    children: [
      // A. Standard Landlord & Staff Workspace
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/properties", element: <PropertiesPage /> },
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
      // B. Dedicated Platform SuperAdmin Portal
      {
        path: "/superadmin",
        element: <SuperAdminLayout />,
        children: [
          { path: "", element: <SuperAdminOverviewPage /> },
          { path: "organizations", element: <SuperAdminOrganizationsPage /> },
          { path: "plans", element: <SuperAdminPlansPage /> },
          { path: "roles", element: <SuperAdminRolesPage /> },
          { path: "users", element: <SuperAdminUsersPage /> },
          { path: "settings", element: <SuperAdminSettingsPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);
