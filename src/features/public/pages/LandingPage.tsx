import { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Star,
  Check,
  Search,
  Bell,
  KeyRound,
  CheckCircle2,
  LayoutDashboard,
  Calculator,
  Zap,
  FileText,
  Smartphone,
  Clock,
  Copy,
  CheckCheck,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import type { Plan } from "@/types";
import { api } from "@/services/axios";
import { ENDPOINTS } from "@/services/endpoints";

const DEFAULT_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter Landlord",
    slug: "starter",
    description: "Built for individual homeowners & NRI landlords managing 1–5 rental flats or villas.",
    priceMonthly: 499,
    priceYearly: 4990,
    maxProperties: 5,
    maxTenants: 10,
    maxStaff: 2,
    features: [
      "Up to 5 Properties & Units",
      "Digital Tenant Dossier & Aadhaar records",
      "UPI & Cash Rent Logging with Receipts",
      "Automated WhatsApp rent reminder templates",
      "Electricity sub-meter billing calculator",
      "Instant 11-month rental agreement generator",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pro",
    name: "Portfolio Pro",
    slug: "pro",
    description: "The gold standard for multi-flat owners, commercial spaces, and PG hostel operators.",
    priceMonthly: 1499,
    priceYearly: 14990,
    maxProperties: 25,
    maxTenants: 60,
    maxStaff: 5,
    features: [
      "Up to 25 Properties & Units",
      "Unlimited Tenant Leases & Renewals",
      "30-day lease expiry & rent escalation warnings",
      "Property Manager & Accountant scoped roles",
      "Automated sequential rent receipts with UTR tracking",
      "Defaulter tracking & security deposit refund ledger",
      "Priority WhatsApp & phone assistance",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "enterprise",
    name: "Commercial & Estate Firm",
    slug: "enterprise",
    description: "Engineered for real estate asset managers, builders & high-volume rental agencies.",
    priceMonthly: 3999,
    priceYearly: 39990,
    maxProperties: 100,
    maxTenants: 300,
    maxStaff: 20,
    features: [
      "Unlimited Properties, Buildings & Blocks",
      "Multi-organization isolated tenant boundaries",
      "Custom role-based permissions (RBAC) engine",
      "Consolidated financial P&L and occupancy reports",
      "Custom branding on legal agreements & receipts",
      "Dedicated account manager & 99.9% uptime SLA",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const showcaseTabs = [
  {
    id: "portfolio",
    title: "Portfolio Command Center & Escalation Alerts",
    shortLabel: "Command Center",
    icon: LayoutDashboard,
    badge: "Landlord Operations",
    image: "/screenshots/dashboard-overview.png",
    url: "https://app.rentmate.in/dashboard",
    description:
      "A real-time snapshot of your rental cashflow, occupancy health, pending dues, and upcoming 30-day lease renewals with automated +5% to +10% escalation prompts.",
    highlights: [
      "Instant visibility into collected vs pending rent for the current month",
      "Automated 30-day advance alerts before 11-month agreements expire",
      "One-click WhatsApp rent reminders with pre-calculated electricity dues",
      "Zero guesswork: track occupancy rates across all flats and PG rooms",
    ],
  },
  {
    id: "search",
    title: "Global Command Search (Cmd+K / Ctrl+K)",
    shortLabel: "Cmd+K Quick Search",
    icon: Search,
    badge: "Built for Power Users",
    image: "/screenshots/smart-search-palette.png",
    url: "https://app.rentmate.in/search?cmd=palette",
    description:
      "Find any flat, tenant phone number, pending invoice, or building record in under 10 milliseconds without clicking through menus.",
    highlights: [
      "Instant fuzzy search across all units, tenant names, and phone numbers",
      "Keyboard-first navigation (Arrow keys + Enter) for rapid multitasking",
      "Direct jump to payment collection screen or tenant lease details",
      "Dismissible in one keystroke with Escape",
    ],
  },
  {
    id: "notifications",
    title: "Automated Expiry & Overdue Alert Drawer",
    shortLabel: "Alerts & Renewals",
    icon: Bell,
    badge: "Smart Automation",
    image: "/screenshots/notification-drawer.png",
    url: "https://app.rentmate.in/notifications",
    description:
      "Never miss a scheduled 10% rent hike or let an unpaid flat slip past the 5th of the month. RentMate audits dues in the background so you don't have to.",
    highlights: [
      "Real-time alerts for overdue payments, new rental applications & lease renewals",
      "Prioritized tags: Critical Overdue (Red), Renewal Pending (Amber), Paid (Green)",
      "Strict data isolation: staff only see notifications for their assigned buildings",
      "One-click 'Mark All Read' and instant navigation to the affected ledger",
    ],
  },
  {
    id: "security",
    title: "Passwordless Mobile OTP & Granular Staff Access",
    shortLabel: "Zero-Trust Security",
    icon: KeyRound,
    badge: "Bank-Grade Security",
    image: "/screenshots/otp-login.png",
    url: "https://app.rentmate.in/login",
    description:
      "Say goodbye to weak or leaked passwords. Log in with a single-use 6-digit OTP sent to your verified mobile number, protected by rate limiting and strict role access.",
    highlights: [
      "No passwords to store, forget, or get compromised",
      "Strict rate-limiting against automated brute-force attacks",
      "Property Manager scoping: managers log rent without seeing your personal bank balances",
      "SuperAdmin workspace isolation ensuring complete multi-tenant privacy",
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Rent Payment Reconciliation",
    traditional: "Scrolling through 4 months of WhatsApp screenshots and UPI transaction histories to verify who paid.",
    rentmate: "Single-click ledger showing paid, partial, or pending status with official bank UTR references.",
  },
  {
    feature: "Electricity Sub-Meter Calculations",
    traditional: "Writing start/end meter readings on scrap paper, manually multiplying by ₹9/unit, and messaging the tenant.",
    rentmate: "Input meter start/end units; RentMate computes the bill automatically and bundles it with the rent receipt.",
  },
  {
    feature: "11-Month Lease Renewals & Hikes",
    traditional: "Forgetting the renewal date until the tenant vacates or stays on the old rate for years.",
    rentmate: "Automatic 30-day advance alert with pre-set 8%–10% escalation, ready to regenerate an agreement in 1 click.",
  },
  {
    feature: "Security Deposit Settlement",
    traditional: "Awkward disputes at move-out over unpaid utility bills, paint damage, and deduction calculations.",
    rentmate: "Transparent digital settlement sheet recording initial deposit, maintenance deductions, and final refund amount.",
  },
  {
    feature: "Delegating to Property Managers",
    traditional: "Giving your manager physical diaries or bank access, exposing all your private financial affairs.",
    rentmate: "Role-scoped staff account: they can collect rent and register tenants, but cannot alter subscription or owner settings.",
  },
];

export default function LandingPage() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const activePortal = useAppSelector((s) => s.auth.activePortal);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedDemo, setCopiedDemo] = useState(false);

  // Interactive Calculator State
  const [calcUnits, setCalcUnits] = useState<number>(8);
  const [calcRent, setCalcRent] = useState<number>(18000);
  const [calcEscalation, setCalcEscalation] = useState<number>(10);

  const unitsSliderId = useId();
  const rentSliderId = useId();

  // Computed ROI values
  const monthlyVolume = calcUnits * calcRent;
  const annualVolume = monthlyVolume * 12;
  const hoursSavedPerMonth = Math.round(calcUnits * 1.75); // ~1.75 hrs saved per unit per month
  const annualEscalationProtected = Math.round(annualVolume * (calcEscalation / 100));

  const dashboardTarget =
    activePortal === "SUPERADMIN" || user?.isSuperAdmin
      ? "/superadmin"
      : user?.role?.toUpperCase() === "TENANT"
      ? "/tenant/my-rentals"
      : "/dashboard";

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

  const copyDemoCredentials = () => {
    navigator.clipboard.writeText("9876543210");
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2200);
  };

  const faqs = [
    {
      q: "How does RentMate replace our traditional handwritten rental diary?",
      a: "Instead of recording tenant names and cash payments in a notebook that can get lost or damaged, RentMate gives you a structured cloud ledger. You can record UPI, Cash, or Bank Transfers with one tap, attach electricity sub-meter units, and print or share digital rent receipts with sequential receipt numbers.",
    },
    {
      q: "Can I manage electricity sub-meters and maintenance charges separately?",
      a: "Yes! In each unit or payment entry, you can specify previous and current meter readings alongside your per-unit tariff (e.g. ₹8 or ₹10 per unit). RentMate calculates the power bill automatically and adds it to the monthly rent demand.",
    },
    {
      q: "How does the 11-month agreement and rent escalation alert work?",
      a: "Under Indian tenancy norms, 11-month agreements require timely renewal with standard 5% to 10% rent increments. RentMate monitors every active lease and notifies you 30 days and 7 days prior to expiry, suggesting the revised rent so you never leave money on the table.",
    },
    {
      q: "What if my tenants pay in cash instead of online UPI?",
      a: "RentMate supports all payment channels: UPI, Cash, Cheque, and Bank IMPS/NEFT. When you log a cash payment, RentMate creates a verifiable digital receipt with a timestamp, making it crystal clear that the tenant paid.",
    },
    {
      q: "Can I hire a property caretaker or manager without giving them access to my personal finances?",
      a: "Absolutely. With our role-based access control, you can create a 'Property Manager' or 'Accountant' login scoped only to specific buildings. They can register tenants and record collections, but cannot see your owner-level subscription settings or private ledger totals.",
    },
    {
      q: "How can I test the platform right now without creating an account?",
      a: "Click 'Launch Live Demo' anywhere on this page. You can log in using our pre-loaded Landlord demo phone (9876543210 with OTP 123456) to explore pre-filled flats, tenants, lease documents, and payment receipts right away.",
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-18">
        {/* Soft atmospheric gradient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold mb-6 shadow-2xs hover:bg-blue-100/70 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Built For Indian Landlords, PG Owners & Flat Portfolios</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-blue-900 font-bold hidden sm:inline">100% Free Live Demo</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.14] max-w-4xl mx-auto">
            Rent collected on the 1st.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Leases tracked without the WhatsApp drama.
            </span>
          </h1>

          {/* Human-written Subheading addressing real pain points */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ditch handwritten diaries and messy Excel sheets. RentMate auto-calculates electricity sub-meters, generates compliant 11-month rental agreements, sends automated UPI reminders, and tracks defaulters in one clean dashboard.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {token ? (
              <Link to={dashboardTarget} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-7 text-sm font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-7 text-sm font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Live Demo Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <a href="#calculator" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 text-sm font-semibold text-slate-700 hover:text-slate-900 border-slate-300 bg-white/90 hover:bg-white rounded-xl shadow-2xs"
              >
                <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                Calculate Time & Rent Savings
              </Button>
            </a>
          </div>

          {/* 1-Click Instant Demo Credentials Pill Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 p-2 px-4 rounded-2xl bg-white border border-slate-200/90 text-xs shadow-2xs text-slate-700">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Instant Demo Access:
            </span>
            <span className="text-slate-500">Mobile:</span>
            <code className="bg-slate-100 font-mono font-bold text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              9876543210
            </code>
            <span className="text-slate-500">OTP:</span>
            <code className="bg-slate-100 font-mono font-bold text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              123456
            </code>
            <button
              type="button"
              onClick={copyDemoCredentials}
              className="ml-1 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              title="Copy demo mobile number"
            >
              {copiedDemo ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 ml-1"
            >
              Log in now &rarr;
            </Link>
          </div>

          {/* Real Dashboard Screenshot Hero with Handcrafted Floating Badges */}
          <div className="mt-12 sm:mt-14 relative max-w-5xl mx-auto">
            {/* Floating Contextual Badges (Giving handcrafted UI feel) */}
            <div className="hidden lg:flex items-center gap-2.5 absolute -top-5 -left-6 z-20 bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-slate-200 shadow-lg text-left animate-in fade-in slide-in-from-left duration-500">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Flat 204 • ₹22,500 Paid</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold">UPI</span>
                </div>
                <div className="text-[10px] text-slate-500">Logged 8m ago • Receipt #RM-8492 sent</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2.5 absolute -bottom-6 -right-6 z-20 bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-slate-200 shadow-lg text-left animate-in fade-in slide-in-from-right duration-500">
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Flat 301 • 30-Day Lease Alert</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold">+10% Hike</span>
                </div>
                <div className="text-[10px] text-slate-500">Auto-escalation prompt prepared</div>
              </div>
            </div>

            <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-1.5 sm:p-3 shadow-xl sm:shadow-2xl overflow-hidden">
              {/* macOS-style Window Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/70 rounded-t-xl mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                  app.rentmate.in/dashboard &mdash; Portfolio Control Center
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Live View
                </div>
              </div>

              {/* Actual Screenshot */}
              <img
                src="/screenshots/dashboard-overview.png"
                alt="RentMate Landlord Dashboard — Portfolio Overview with Lease Alerts, Rent Collection, and Occupancy Tracking"
                className="w-full h-auto rounded-xl shadow-inner"
                loading="eager"
              />
            </div>

            {/* Ambient glow effect behind card */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-gradient-to-t from-blue-100/50 to-transparent blur-2xl pointer-events-none -z-10" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STATS & OPERATIONAL TRUST INDICATORS                      */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 text-slate-900 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-2 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">1,500+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5">
                Flats & PG Units Managed
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across Bengaluru, Pune, Jaipur & NCR</div>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">4,200+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5">
                Active 11-Month Leases
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">With automated escalation alerts</div>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">₹2.5Cr+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5">
                Monthly Rent Logged
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Reconciled with zero missing receipts</div>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">99.8%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5">
                On-Time Collection Rate
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Powered by scheduled WhatsApp alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2.5 INTERACTIVE LANDLORD ROI & TIME CALCULATOR               */}
      {/* (Bespoke Handcrafted Feature That Wow's Visitors)            */}
      {/* ============================================================ */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 p-6 sm:p-10 lg:p-12 shadow-md">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Interactive ROI Calculator
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How much time and lost rent is your current setup costing you?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Adjust the sliders below to see your potential monthly time savings and protected annual rent escalations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Sliders Input Column */}
            <div className="lg:col-span-6 space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
              {/* Slider 1: Units Managed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={unitsSliderId} className="text-xs sm:text-sm font-bold text-slate-800">
                    Units / Flats / PG Beds Managed
                  </label>
                  <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-lg border border-blue-200">
                    {calcUnits} Units
                  </span>
                </div>
                <input
                  id={unitsSliderId}
                  type="range"
                  min="1"
                  max="60"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 unit (Single flat)</span>
                  <span>30 units</span>
                  <span>60 units (Portfolio)</span>
                </div>
              </div>

              {/* Slider 2: Average Monthly Rent */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={rentSliderId} className="text-xs sm:text-sm font-bold text-slate-800">
                    Average Rent per Unit
                  </label>
                  <span className="text-base font-extrabold text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-lg border border-emerald-200">
                    ₹{calcRent.toLocaleString("en-IN")}/mo
                  </span>
                </div>
                <input
                  id={rentSliderId}
                  type="range"
                  min="5000"
                  max="60000"
                  step="1000"
                  value={calcRent}
                  onChange={(e) => setCalcRent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹5,000 (PG bed)</span>
                  <span>₹25,000 (2BHK)</span>
                  <span>₹60,000 (Luxury flat)</span>
                </div>
              </div>

              {/* Escalation Rate Toggle Buttons */}
              <div>
                <span className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  Annual Lease Escalation Rate
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 8, 10].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCalcEscalation(rate)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        calcEscalation === rate
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      +{rate}% / year
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5">
                  Standard Indian rental agreements specify 8%–10% escalation every 11 months.
                </div>
              </div>
            </div>

            {/* Calculations Output Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Metric 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Time Saved Monthly</span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    ~{hoursSavedPerMonth} Hours
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Replaces manual diary writing, WhatsApp follow-ups, and bank screenshot checks.
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>Protected Escalation</span>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600">
                    +₹{annualEscalationProtected.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Extra annual revenue secured by never missing your scheduled {calcEscalation}% renewal hike.
                  </div>
                </div>
              </div>

              {/* Total Monthly Portfolio Bar */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                    Monthly Rent Volume Managed
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    ₹{monthlyVolume.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-full" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span>Zero-effort bank reconciliation</span>
                  <Link to="/login" className="text-blue-300 hover:text-white font-bold flex items-center gap-1">
                    <span>Manage on RentMate</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. TRADITIONAL WAY VS RENTMATE COMPARISON                    */}
      {/* (Authentic Human Developer Feature — No Fluff)              */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Real-World Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            The Traditional Way vs. The RentMate Way
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            See why over 1,500 property managers across India threw away their paper diaries and switched to RentMate.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-4 px-4 sm:px-6 font-bold text-slate-900 w-1/4">Operations Challenge</th>
                <th className="py-4 px-4 sm:px-6 font-bold text-rose-700 bg-rose-50/50 w-3/8">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>The Old Way (Diary & WhatsApp)</span>
                  </div>
                </th>
                <th className="py-4 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/50 w-3/8">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>The RentMate Way (Cloud Dashboard)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-bold text-slate-800">{row.feature}</td>
                  <td className="py-4 px-4 sm:px-6 text-slate-600 leading-relaxed bg-rose-50/20">
                    <span className="text-rose-600 font-bold mr-1.5">&times;</span>
                    {row.traditional}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-800 font-medium leading-relaxed bg-emerald-50/20">
                    <span className="text-emerald-600 font-bold mr-1.5">&#10003;</span>
                    {row.rentmate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. INTERACTIVE PLATFORM SHOWCASE (REAL SCREENSHOTS)          */}
      {/* ============================================================ */}
      <section id="showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Interactive Product Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Real Software, Not Conceptual Mockups
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Explore live production captures of the RentMate web application. See exactly how landlord operations, command search, real-time alerts, and zero-trust auth function.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {showcaseTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-blue-600"}`} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Showcase Feature Card */}
        {(() => {
          const current = showcaseTabs[activeTab];
          return (
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/50 p-6 sm:p-10 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Feature details (Left column) */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                      {current.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                      {current.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      {current.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-3">
                    {current.highlights.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA button to test in live demo */}
                  <div className="pt-2">
                    <Link to="/login">
                      <Button className="h-11 px-6 text-xs sm:text-sm font-bold gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm">
                        <span>Launch 1-Click Interactive Demo</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Browser Frame with Live Screenshot (Right column) */}
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl">
                    {/* Simulated browser topbar */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200 text-xs font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-rose-400" />
                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                        <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex-1 max-w-sm mx-4 bg-white px-3 py-1 rounded-md text-[11px] text-slate-500 truncate border border-slate-200/80 text-center font-sans">
                        {current.url}
                      </div>
                      <div className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full font-sans">
                        100% Real
                      </div>
                    </div>

                    {/* Screenshot image container */}
                    <div className="relative bg-slate-900 overflow-hidden">
                      <img
                        key={current.image}
                        src={current.image}
                        alt={current.title}
                        className="w-full h-auto object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ============================================================ */}
      {/* 5. CORE INDIAN RENTAL FEATURES (PRACTICAL & GROUNDED)        */}
      {/* ============================================================ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Tailored For Real Landlord Needs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Every Feature Solves a Real Headaches You Face Daily
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            No bloated theoretical tools. Just the exact utilities you need to track rent, handle tenants, and maintain positive cash flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors mb-5">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Sub-Meter Electricity Billing
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Enter beginning and ending meter units for each flat or PG room. RentMate multiplies by your state tariff (e.g. ₹9/unit) and auto-attaches it to the rent invoice.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-5">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              11-Month Rental Agreement PDF
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Generate legal Indian 11-month rental agreements instantly with pre-populated landlord, tenant, security deposit, and lock-in period clauses.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-purple-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors mb-5">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Instant WhatsApp Rent Receipts
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Log payments via UPI, Cash, or Bank Transfer. Instantly print or share professional digital receipts with sequential serial numbers and bank UTRs.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors mb-5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Automatic Rent Escalation Alerts
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Get notified 30 days before a tenant completes 11 months with pre-calculated 5% to 10% rent increments, preventing unearned revenue losses.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-5">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Scoped Property Manager Accounts
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Delegate day-to-day rent logging and tenant check-ins to caretakers or managers without giving them access to your overall profits or subscription settings.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white hover:border-rose-400 hover:shadow-md transition-all duration-200 group">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors mb-5">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              Multi-Building & PG Room Directory
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Manage residential apartments, commercial shops, and co-living hostels side-by-side with instant occupied vs vacant indicators.
            </p>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. HOW IT WORKS (PRACTICAL 4 STEPS)                          */}
      {/* ============================================================ */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simple 4-Step Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How To Get Started in 5 Minutes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No technical training or complicated onboarding required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Add Properties & Flats</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Add your apartment buildings, floors, individual flat numbers, or PG bed slots with baseline monthly rents.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Assign Active Tenants</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Link tenant names, phone numbers, security deposit paid, and agreement start dates in seconds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Log Rent & Utilities</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                When rent comes in via UPI or Cash, log it with one click. RentMate calculates electric sub-meters and issues a receipt.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900">Automate Renewals</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Get alerted before 11 months are up. Apply your 8%–10% rent hike and generate new agreements automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. DYNAMIC PRICING SECTION                                   */}
      {/* ============================================================ */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Fair & Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Choose The Plan That Matches Your Scale
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            No hidden setup fees or surprise charges. Upgrade or adjust your property quotas anytime as you acquire new assets.
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
          {plans.map((plan, idx) => {
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
                    Most Popular For Landlords
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
                    <div className="text-xs font-bold text-slate-700">Included Capacity:</div>
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
                        Up to <strong>{plan.maxStaff} Staff & Caretaker Logins</strong>
                      </span>
                    </div>

                    <div className="pt-2 text-xs font-bold text-slate-700">Core Features:</div>
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
      {/* 8. AUTHENTIC LANDLORD REVIEWS (GROUNDED INDIAN CONTEXT)       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Real Landlord Stories
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Trusted by Property Owners Across India
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
              "Managing 18 flats in Baner and Wakad used to mean an endless flood of WhatsApp screenshots. Now rent receipts take 10 seconds to generate and I immediately know who is overdue on the 5th."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Vikram Singhania</div>
              <div className="text-[11px] text-slate-500">Owner, Singhania Heights (Pune) &bull; 18 Flats</div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The sub-meter calculation feature alone saves me hours each month. Our PG has 32 rooms with individual meters. RentMate calculates the power bill automatically and our tenants never argue."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Sunita Mehra</div>
              <div className="text-[11px] text-slate-500">Managing Director, Maple PG Hostels (Jaipur) &bull; 32 Rooms</div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "We used to forget the annual 10% rent escalation all the time. RentMate's 30-day lease alert allowed us to recover an extra ₹1.4 lakh this year simply by renegotiating agreements on schedule."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Karthik Ramanathan</div>
              <div className="text-[11px] text-slate-500">Independent Landlord, Whitefield (Bengaluru) &bull; 6 Villas</div>
            </div>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ)                          */}
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
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. HIGH-CONVERTING BOTTOM CTA BANNER                        */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 border border-blue-200/90 text-slate-900 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              <Sparkles className="h-3.5 w-3.5" /> Start in Under 2 Minutes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Ready to Stop Chasing Rent Payments?
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
                  Contact Support Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
