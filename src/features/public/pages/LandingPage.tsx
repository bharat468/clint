import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Star,
  Check,
  Sliders,
} from "lucide-react";
import type { Plan } from "@/types";
import { api } from "@/services/axios";
import { ENDPOINTS } from "@/services/endpoints";

const DEFAULT_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter Landlord",
    slug: "starter",
    description: "Ideal for individual owners managing 1-5 rental units.",
    priceMonthly: 499,
    priceYearly: 4990,
    maxProperties: 5,
    maxTenants: 10,
    maxStaff: 2,
    features: [
      "Up to 5 Properties & Units",
      "Digital Tenant Records & Leases",
      "Rent Collection & Invoicing",
      "Zero-Trust Mobile OTP Login",
      "Email Support",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pro",
    name: "Pro Property Manager",
    slug: "pro",
    description: "For growing portfolios, multi-building owners, and PG operations.",
    priceMonthly: 1499,
    priceYearly: 14990,
    maxProperties: 25,
    maxTenants: 60,
    maxStaff: 5,
    features: [
      "Up to 25 Properties & Units",
      "Unlimited Tenant Leases",
      "Automated Payment Receipts",
      "Staff Roles & Property Scoping",
      "Financial Analytics & CSV Exports",
      "Priority WhatsApp & Phone Support",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Tenant",
    slug: "enterprise",
    description: "For real estate firms, commercial developers & large agencies.",
    priceMonthly: 3999,
    priceYearly: 39990,
    maxProperties: 100,
    maxTenants: 300,
    maxStaff: 20,
    features: [
      "Unlimited Properties & Units",
      "Multi-Organization Boundaries",
      "Granular Dynamic RBAC Engine",
      "Custom Automated Rent Receipts",
      "Dedicated Account Manager",
      "99.9% Uptime SLA & Audit Logs",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fetch live plans from server with graceful fallback
  useEffect(() => {
    api
      .get(ENDPOINTS.PLANS.LIST)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_PLANS when server is offline
      });
  }, []);

  const displayPlans = plans;

  const faqs = [
    {
      q: "What is RentMate and how does it help property owners?",
      a: "RentMate is an enterprise-grade property management SaaS. It centralizes all your rental units, tenant profiles, lease dates, and payment collections into one clean dashboard, replacing messy spreadsheets and manual notebooks.",
    },
    {
      q: "How does the Zero-Trust Mobile OTP authentication work?",
      a: "RentMate does not rely on vulnerable passwords that can be forgotten or brute-forced. Instead, login happens via a 6-digit OTP sent to your pre-registered mobile number, providing military-grade zero-trust access control.",
    },
    {
      q: "Can I manage multiple properties and assign staff members?",
      a: "Yes! RentMate supports complete multi-tenant organizations and granular role-based permissions (RBAC). You can create roles like 'Property Manager' or 'Accountant' and scope their access to specific properties only.",
    },
    {
      q: "How are rent receipts and overdue payments tracked?",
      a: "Every rent collection can be logged with payment mode (UPI, Cash, Bank Transfer), and you can instantly generate or print official digital receipts. RentMate highlights overdue and pending payments in real time.",
    },
    {
      q: "Can I test the platform before committing?",
      a: "Absolutely! You can log in directly using our 1-click Demo credentials on the login page to test all Landlord and SuperAdmin workflows without any upfront setup.",
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-2xs animate-in fade-in duration-300">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Next-Gen Property Management SaaS</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-900 font-bold">Trusted by 1,500+ Landlords</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto">
            Smarter Rentals.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Happier Living.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Streamline properties, automate rent collection, track tenant lease agreements, and manage vacant units—all from one unified, zero-trust cloud workspace.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-7 text-sm font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-7 text-sm font-semibold text-slate-700 hover:text-slate-900 border-slate-300 bg-white/80 hover:bg-white rounded-xl shadow-2xs"
              >
                Explore Features
              </Button>
            </a>
          </div>

          {/* Live Product Hero Showcase Card */}
          <div className="mt-14 sm:mt-16 relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-2 sm:p-4 shadow-xl sm:shadow-2xl">
              {/* Card Window Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/70 rounded-t-xl mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 font-medium">
                  app.rentmate.local — Landlord Dashboard
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Live Preview
                </div>
              </div>

              {/* Simulated Live Dashboard Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-2 sm:p-4 text-left">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100">
                  <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Total Rent Collected</span>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">₹18,40,000</div>
                  <div className="text-[11px] font-medium text-emerald-600 mt-1">
                    ↑ 12.4% vs last month
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100">
                  <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Occupancy Rate</span>
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">94.6%</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-1">
                    138 Occupied / 146 Total
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border border-purple-100">
                  <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Active Tenants</span>
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">138 Profiles</div>
                  <div className="text-[11px] font-medium text-emerald-600 mt-1">
                    100% Leases Verified
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-100">
                  <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Pending Dues</span>
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">₹32,500</div>
                  <div className="text-[11px] font-medium text-amber-700 mt-1">
                    2 Invoices Awaiting Pay
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STATS & TRUST INDICATORS                                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 text-slate-900 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-2 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">1,500+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                Properties & Units Managed
              </div>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">4,200+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                Active Tenant Leases
              </div>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600">₹2.5Cr+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                Monthly Rent Processed
              </div>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">99.8%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                On-Time Payment Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CORE FEATURES SECTION                                     */}
      {/* ============================================================ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Engineered For Landlords
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Everything You Need To Run Rental Portfolios
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Eliminate paperwork, manual follow-ups, and accounting errors with modern automation built specifically for rental real estate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors mb-5">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Property & Unit Directory
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Track multi-building apartments, flats, and PG rooms. Monitor occupied vs vacant status and rental pricing in real time.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-5">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Tenant & Lease Management
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Maintain complete tenant records, contact numbers, start dates, and lease end renewals with automatic expiration alerts.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-purple-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors mb-5">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Rent Tracking & Invoicing
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Log payments via UPI, Cash, or Bank Transfer. Generate printable digital rent receipts with official reference IDs.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors mb-5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Zero-Trust Mobile OTP
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Never worry about password leaks. Verified 6-digit OTP verification ensures only pre-authorized staff and owners can access data.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-5">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Dynamic Staff Permissions
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Delegate responsibilities without losing control. Assign custom roles with property scoping to managers and collection staff.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-rose-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors mb-5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              Real-Time Portfolio Health
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Gain complete financial visibility with automated occupancy charts, cash-flow trends, and overdue collections overview.
            </p>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. HOW IT WORKS (4 STEPS)                                     */}
      {/* ============================================================ */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simple 4-Step Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How RentMate Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Get up and running in under 5 minutes without technical expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Create Workspace</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Set up your landlord organization with your business name and assign staff members.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Add Units & Rates</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                List your residential or commercial units, addresses, bedroom configurations, and monthly rent.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Link Tenant Leases</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Register tenants with phone and email, link them to units, and record lease start/end dates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900">Track & Collect</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Log rent payments, track overdue units, and generate instant printable receipts with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. DYNAMIC PRICING SECTION                                   */}
      {/* ============================================================ */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Transparent SaaS Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Choose The Plan That Fits Your Scale
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            No hidden setup fees. Upgrade or adjust your property quotas anytime as your portfolio grows.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                billingCycle === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "YEARLY"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {displayPlans.map((plan, idx) => {
            const isPopular = plan.slug === "pro" || idx === 1;
            const price =
              billingCycle === "YEARLY"
                ? Math.round((plan.priceYearly || plan.priceMonthly * 10) / 12)
                : plan.priceMonthly;

            return (
              <Card
                key={plan.id}
                className={`p-7 sm:p-8 rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                  isPopular
                    ? "border-2 border-blue-600 shadow-xl bg-white relative scale-[1.02]"
                    : "border border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  {billingCycle === "YEARLY" && (
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Billed annually (₹{(plan.priceYearly || plan.priceMonthly * 10).toLocaleString("en-IN")}/yr)
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold text-slate-700">Included Quotas:</div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Up to <strong>{plan.maxProperties} Properties / Units</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Up to <strong>{plan.maxTenants} Tenant Leases</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Up to <strong>{plan.maxStaff} Staff Accounts</strong>
                      </span>
                    </div>

                    <div className="pt-2 text-xs font-bold text-slate-700">Features:</div>
                    {Array.isArray(plan.features) &&
                      plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link to="/login">
                    <Button
                      className={`w-full h-11 text-xs font-bold rounded-xl shadow-xs transition-colors ${
                        isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs"
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. TESTIMONIALS SECTION                                      */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Real Landlord Reviews
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Loved By Property Managers Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Managing 24 flats across Indiranagar used to consume my entire weekend. With RentMate, rent receipts are generated in 10 seconds and I know exactly who hasn't paid."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Rajesh Sharma</div>
              <div className="text-[11px] text-slate-500">Owner, Sharma Residency (Bengaluru)</div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Zero-Trust OTP authentication gives our family peace of mind. Our manager logs rent collections while I retain executive visibility over our commercial assets."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Pooja Kulkarni</div>
              <div className="text-[11px] text-slate-500">Managing Partner, Kulkarni Estates (Pune)</div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Simple, clean, and blazingly fast. No bloated software manuals required. We onboarded all our PG tenants in an hour."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Amit Verma</div>
              <div className="text-[11px] text-slate-500">Founder, Zen Co-Living (Gurugram)</div>
            </div>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                          */}
      {/* ============================================================ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4.5 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-90 text-blue-600" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. HIGH-CONVERTING BOTTOM CTA BANNER                         */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 border border-blue-200/90 text-slate-900 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              <Sparkles className="h-3.5 w-3.5" /> Start in 2 Minutes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Ready to Simplify Your Property Operations?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Join hundreds of smart landlords and real estate managers who rely on RentMate every day to collect rent on time and automate lease tracking.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-7 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors">
                  <span>Start Free With Demo Account</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-6 text-sm font-semibold border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition-colors"
                >
                  Contact Sales Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
