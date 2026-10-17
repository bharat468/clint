import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Zap,
  FileText,
  Receipt,
  Search,
  Bell,
  Clock,
  Sparkles,
} from "lucide-react";

export default function FeaturesPage() {
  const operationalPillars = [
    {
      icon: Zap,
      badge: "Utilities & Power",
      title: "Sub-Meter Electricity Auto-Billing",
      desc: "Stop calculating meter readings on scrap paper. Enter previous and current kWh meter units for any flat or PG room; RentMate automatically calculates the bill and appends it to the rent invoice.",
      benefits: [
        "Custom state tariff rates (e.g. ₹8, ₹9.50, or ₹11 / unit)",
        "Zero tenant disputes with verifiable start/end meter numbers",
        "Bundles cleanly inside the official WhatsApp rent receipt",
      ],
    },
    {
      icon: FileText,
      badge: "Legal Compliance",
      title: "11-Month Rental Agreement Generator",
      desc: "Generate compliant Indian rental agreements in 60 seconds with pre-filled landlord, tenant, security deposit, and lock-in period clauses without paying agency fees.",
      benefits: [
        "Includes standard clauses for residential flats, villas, and PGs",
        "Records security deposit refund terms & maintenance dues",
        "Instant printable PDF ready for physical or digital signing",
      ],
    },
    {
      icon: Receipt,
      badge: "Payment Tracking",
      title: "UPI & Cash Rent Logging with Receipts",
      desc: "Record collections across UPI, Cash, Cheque, or Direct IMPS. Instantly issue verifiable digital receipts with unique receipt numbers and bank UTRs to prevent disputes.",
      benefits: [
        "Send receipts directly to tenants over WhatsApp with 1 tap",
        "Supports partial rent payments with auto-tracked remaining balances",
        "Real-time defaulters radar highlighting unpaid flats on the 5th",
      ],
    },
    {
      icon: TrendingUp,
      badge: "Yield Protection",
      title: "Automated 30-Day Rent Escalation Radar",
      desc: "Never forget your annual 8%–10% rent hike. RentMate monitors active 11-month leases and alerts you 30 days and 7 days prior to expiry with pre-calculated incremented rents.",
      benefits: [
        "Pre-calculates 5%, 8%, or 10% rent increments automatically",
        "Prompts tenant renewal negotiations ahead of time",
        "Protects over ₹1.5L+ in uncollected rent hikes across your portfolio",
      ],
    },
    {
      icon: Sliders,
      badge: "Staff Delegation",
      title: "Scoped Property Manager Logins",
      desc: "Delegate ground-level tasks to property caretakers, building supervisors, or accountants without giving them visibility into your overall profits or subscription settings.",
      benefits: [
        "Limit staff access strictly to specific buildings or floors",
        "Allow caretakers to log rent payments and verify check-ins",
        "Executive owner dashboard remains completely private",
      ],
    },
    {
      icon: ShieldCheck,
      badge: "Account Security",
      title: "Passwordless Zero-Trust Mobile OTP",
      desc: "Eliminate vulnerable passwords that can be stolen, forgotten, or shared. Sign in instantly using a single-use 6-digit OTP delivered to your pre-verified mobile number.",
      benefits: [
        "Protected by strict IP rate limiting against brute-force attacks",
        "Cryptographic session tokens with automatic timeout",
        "No passwords to store, leak, or compromise",
      ],
    },
  ];

  const quickTools = [
    {
      icon: Search,
      title: "Cmd+K Instant Command Palette",
      desc: "Press Cmd+K from any screen to instantly locate any flat, tenant phone number, or payment voucher in 10ms.",
    },
    {
      icon: Bell,
      title: "Expiry & Overdue Notification Center",
      desc: "Daily background checks automatically flag overdue rents, pending renewals, and move-out requests in one drawer.",
    },
    {
      icon: Users,
      title: "Aadhaar & KYC Document Vault",
      desc: "Safely link tenant government IDs, permanent addresses, and emergency contacts to their rental unit profile.",
    },
    {
      icon: Building2,
      title: "Multi-Property & PG Bed Architecture",
      desc: "Manage residential 2BHK/3BHK flats, commercial retail spaces, and co-living hostel beds in one unified workspace.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Operational Capabilities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Built Specifically for the Daily Realities of{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Indian Rental Portfolios
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Every capability in RentMate was engineered to eliminate real administrative friction: sub-meters, WhatsApp receipts, 11-month agreements, and rent escalations.
        </p>
      </div>

      {/* 2. Six Core Operational Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {operationalPillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <Card
              key={idx}
              className="p-7 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {pillar.desc}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                  {pillar.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Deep Workflow Tools (4-grid) */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Productivity Tools Built Right In
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No messy third-party plugins needed. Everything runs natively inside your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{tool.title}</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Demo Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 border border-blue-200/90 text-slate-900 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="h-3.5 w-3.5" /> Test in 60 Seconds
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Try All These Features on Our Live Demo
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Log in with pre-loaded demo credentials (Mobile: <strong>9876543210</strong>, OTP: <strong>123456</strong>) to inspect live rental units, sub-meter readings, and PDF receipts.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-7 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors">
              <span>Launch 1-Click Interactive Demo</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link to="/pricing" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 text-xs font-semibold border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition-colors"
            >
              View Transparent Pricing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

