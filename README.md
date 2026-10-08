<div align="center">
  <img src="./public/RentMate%20Smart%20Rentals%20Logo.png" alt="RentMate Smart Rentals Logo" width="260" />

  <h1>RentMate — Smart Rentals & Property Management</h1>

  <p><strong>Next-Generation Multi-Tenant Property Management SaaS & Marketing Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Redux%20Toolkit-2.2-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  </p>
</div>

---

> [!NOTE]
> **Design Philosophy**: RentMate utilizes an elegant, cohesive **Light Color Theme** built around high-contrast typography, crisp borders, and subtle pastel gradients (`#2563EB` Royal Blue, Slate, and Indigo). Dark backgrounds have been completely phased out in favor of modern, high-readability interfaces.

---

## 📌 Project Overview (Yeh Project Kya Hai?)

**RentMate** ek full-stack, enterprise-grade **Multi-Tenant Rental & Property Management SaaS Platform** hai. 

Yeh frontend application **teen alag-alag layers** ko seamless experience ke saath serve karti hai:
1. **🌐 Public Marketing Website**: Zero-login visitors ke liye high-converting, dynamic landing pages aur SaaS pricing.
2. **🏢 Landlord & Property Manager Workspace**: Properties, tenants, leases, rent collections aur team permissions manage karne ke liye dashboard.
3. **⚡ SuperAdmin Master Control Hub**: Platform-wide organizations, subscription plans, platform users, telemetry aur system audit logs manage karne ke liye enterprise console.

---

## 🏛️ Application Architecture & Routing Structure

```
RentMate Frontend Routing Tree
│
├── 🌐 Public Marketing Website (No Auth Required)
│   ├── /                         Landing Page (Hero, Stats, Showcase, Plans, CTA)
│   ├── /features                 Deep-Dive Feature Breakdown & Architecture
│   ├── /pricing                  Dynamic SaaS Subscription Plans & Pricing Matrix
│   ├── /about                    Company Vision, Security, Multi-Tenant Architecture
│   ├── /contact                  Direct Contact Form & Support Details
│   ├── /faq                      Frequently Asked Questions & Product Guidance
│   ├── /privacy-policy           Zero-Trust & Data Isolation Privacy Policy
│   └── /terms-and-conditions     SaaS User Agreement & Service Terms
│
├── 🔐 Authentication Onboarding
│   ├── /login                    Passwordless 6-Digit Mobile OTP Login (with Dev Autofill)
│   └── /register                 New Organization & Landlord Onboarding
│
├── 🏢 Landlord & Staff Workspace (Protected by JWT + Dynamic RBAC)
│   ├── /dashboard                Executive Real-Time Financial & Portfolio KPIs
│   ├── /properties               Property Portfolio CRUD, Unit Badges & Audit Dates
│   ├── /tenants                  Tenant Directory, Leases, Contact Links & Details
│   ├── /payments                 Rent Ledger, 1-Click Settlement & Month Filters
│   └── /settings                 Account, Team Members, Custom Roles & Billing
│       ├── /settings/team        Organization Staff & RBAC Role Assignment
│       ├── /settings/roles       Custom Permission Matrices (Granular Scopes)
│       └── /settings/billing     Active Plan Quotas, Usage Meters & Upgrades
│
└── ⚡ SuperAdmin Enterprise Portal (Protected by isSuperAdmin Guard)
    ├── /superadmin               Platform Command Center (Revenue, Tenants, MRR, Health)
    ├── /superadmin/organizations Full Organization CRUD, Plan Assignment & Deletion
    ├── /superadmin/plans         SaaS Plan Creation, Pricing (INR), Quota Limits
    ├── /superadmin/users         Cross-Organization User Management & Role Toggles
    ├── /superadmin/subscriptions Active SaaS Subscriptions, Expiry Tracking & Statuses
    ├── /superadmin/telemetry     Real-Time API Latency, Cache Hit Ratios & DB Health
    ├── /superadmin/audit         System-Wide Immutable Audit Trail Logs
    └── /superadmin/settings      Platform Maintenance Mode, Security Toggles & Cache Purge
```

---

## ✨ Core Modules & Feature Highlights

### 1. 🌐 Public Marketing Website (Light Theme)
- **High-Converting Landing Page (`/`)**: Hero section, real-time platform statistics card, product workflow steps, dynamic subscription cards, aur interactive CTA.
- **Dynamic Plan Sync with Offline Resilience**: Agar backend server offline bhi ho, to landing aur pricing pages seamless static fallback plans display karte hain bina fail huye.
- **Support & Company Contact**:
  - **Email**: `bharatpareek256@gmail.com`
  - **Phone**: `+91 8003953815`
  - **Location**: `Jaipur, Rajasthan, India`
- **100% Light Theme**: Har card, footer aur CTA section soft borders (`border-slate-200`) aur crisp background (`bg-white` / `bg-slate-50`) ke saath calibrated hai.

### 2. 🏢 Landlord & Property Workspace (`/dashboard`)
- **Executive KPIs**: Total properties, units occupied vs. vacant, total active leases, total collected rent (`₹`), aur pending dues.
- **Audit Date-Time Tracking**: Har Property, Tenant aur Payment record par exact **Created At** aur **Updated At** timestamp badge display hota hai.
- **Granular RBAC Permission System**: Sidebar links aur action buttons dynamically check karte hain ki logged-in user ke paas required permission (`property.create`, `payment.read`, etc.) hai ya nahi.

### 3. ⚡ SuperAdmin Master Console (`/superadmin`)
- **Independent Layout**: Landlord navigation se bilkul separate master administration sidebar.
- **Organization Management**: Multi-tenant organizations ka live table, new organization modal with custom slug & quota limits.
- **SaaS Subscription Engine**: SuperAdmin naye plans bana sakta hai (e.g. Starter, Growth, Enterprise) aur organizations ko assign kar sakta hai.

### 4. 🔐 Zero-Trust Passwordless Login (`/login`)
- **6-Digit Mobile OTP**: Password store kiye bina cryptographic OTP authorization.
- **Instant Dev Auto-Fill**: Development mode me API se aane wale OTP ka floating Toast display hota hai with a single click **"Auto-fill OTP"** button.
- **Smart Portal Redirection**: Login ke baad SuperAdmin users automatically `/superadmin` par aur Landlords `/dashboard` par navigate hote hain.

---

## 🛠️ Tech Stack & Tooling

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **React 18.3** + **TypeScript 5.6** | Type-safe, component-driven UI architecture |
| **Build Tool** | **Vite 5.4** | Ultra-fast HMR and production bundle optimization |
| **Routing** | **React Router DOM v6** | Data router with route-level layout trees and RBAC guards |
| **Styling** | **Tailwind CSS v4** | Modern utility-first styling with custom CSS design tokens |
| **Typography** | **Plus Jakarta Sans** | Modern geometric typography for clean readability |
| **State Management** | **Redux Toolkit 2.2** | Central store for user authentication, session, and UI states |
| **Data Fetching** | **Axios** | Interceptor-driven API client with automatic JWT token attachment |
| **Icons** | **Lucide React** | Consistent, modern vector iconography |

---

## 📁 Source Code Structure

```
clint/
├── public/
│   ├── RentMate Smart Rentals Logo.png        # Official brand logo
│   └── Glossy Blue and Teal House-R Icon.png  # Application favicon
├── src/
│   ├── app/
│   │   ├── router.tsx          # 🌟 Central Route Tree (Public, Auth, Landlord, SuperAdmin)
│   │   └── store.ts           # Redux Toolkit global store configuration
│   ├── components/
│   │   ├── layout/             # AppLayout, Navbar, Sidebar
│   │   └── ui/                 # Reusable UI primitives (Button, Card, Badge, Modal, Input)
│   ├── features/
│   │   ├── auth/               # LoginPage, RegisterPage, ProtectedRoute, authSlice
│   │   ├── dashboard/          # Landlord executive dashboard & analytics cards
│   │   ├── properties/         # Property listings, create/edit modal forms
│   │   ├── tenants/            # Tenant directory, lease assignment modals
│   │   ├── payments/           # Rent payment ledger & instant settlement
│   │   ├── public/             # 🌟 Public Website (Navbar, Footer, 8 Public Pages)
│   │   │   ├── components/     # PublicNavbar, PublicFooter
│   │   │   ├── layouts/        # PublicLayout
│   │   │   └── pages/          # LandingPage, Features, Pricing, About, Contact, Faq, etc.
│   │   └── superadmin/         # 🌟 SuperAdmin Master Management Console
│   │       ├── layouts/        # SuperAdminLayout
│   │       ├── components/     # PlanModal, OrganizationModal, RoleModal, SubscriptionModal
│   │       └── pages/          # Overview, Organizations, Plans, Users, Telemetry, AuditLogs
│   ├── hooks/                  # Custom React hooks (useApi, useDebounce, etc.)
│   ├── lib/                    # Utility functions (cn, formatINR, date formatting)
│   ├── services/               # API clients (axios.ts, endpoints.ts, public.service.ts)
│   ├── types/                  # Global TypeScript interfaces & data contracts
│   ├── index.css               # Design system tokens & utility classes
│   └── main.tsx                # React DOM render root
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm or pnpm

### 2. Install Dependencies
```bash
cd clint
npm install
```

### 3. Environment Variables
Create a `.env` file in the `clint` root directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Start Development Server
```bash
npm run dev
```
The app will run locally at **[http://localhost:5173](http://localhost:5173)**.

### 5. Production Build & Type Check
```bash
npm run build
```

---

## 👨‍💻 Author & Maintenance

<div align="center">

| Author | Contact | Location | GitHub |
| :---: | :---: | :---: | :---: |
| **Bharat Pareek** | **bharatpareek256@gmail.com** <br/> `+91 8003953815` | Jaipur, Rajasthan, India | [**@bharat468**](https://github.com/bharat468) |

<br />

<sub>RentMate Platform © 2026. All rights reserved.</sub>

</div>