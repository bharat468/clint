import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function FeaturesPage() {
  const deepFeatures = [
    {
      icon: Building2,
      tag: "Property Operations",
      title: "Complete Property & Unit Directory",
      desc: "Manage residential flats, commercial shops, and co-living PGs in one place. Categorize by occupancy status, address, city, and configured monthly rents.",
      points: [
        "Instant Occupied vs Vacant visibility",
        "Configurable rental pricing and bedroom counts",
        "Detailed property history and tenant association",
      ],
    },
    {
      icon: Users,
      tag: "Lease Management",
      title: "Digital Tenant Profiles & Leases",
      desc: "Keep complete digital records of all tenants. Store contact details, phone numbers, email addresses, and track lease commencement and expiration dates.",
      points: [
        "1-click link between tenant and rental unit",
        "Automated lease expiration notifications",
        "History of previous tenancies and records",
      ],
    },
    {
      icon: CreditCard,
      tag: "Rent & Collections",
      title: "Automated Rent Invoicing & Receipts",
      desc: "Log rent collections across UPI, Cash, Cheque, or Direct Bank Transfer. Generate printable digital receipts with unique transaction reference numbers.",
      points: [
        "Track monthly rent collections and pending dues",
        "Real-time flagging of overdue rent payments",
        "Clean, printable PDF-ready payment vouchers",
      ],
    },
    {
      icon: ShieldCheck,
      tag: "Zero-Trust Security",
      title: "Mobile OTP & Pre-Registered Barrier",
      desc: "No passwords to remember or lose. Users authenticate with secure 6-digit OTPs sent to pre-registered mobile numbers with strict gatekeeper validation.",
      points: [
        "Prevents credential theft and brute-force attacks",
        "Cryptographic JWT authentication tokens",
        "Enterprise-grade session expiration and renewal",
      ],
    },
    {
      icon: Sliders,
      tag: "Multi-Role Delegation",
      title: "Granular RBAC & Property Scoping",
      desc: "Empower property managers, accountants, and maintenance staff with exact permissions while maintaining executive control.",
      points: [
        "Custom workspace roles (Manager, Staff, Auditor)",
        "Scope staff access to specific properties only",
        "Zero access to sensitive organizational settings",
      ],
    },
    {
      icon: TrendingUp,
      tag: "Business Intelligence",
      title: "Real-Time Telemetry & Reports",
      desc: "Make informed real estate decisions. Review occupancy rates, monthly cash-flow health, revenue growth, and historical payment compliance.",
      points: [
        "Automated occupancy and vacant percentage metrics",
        "Financial cash-flow comparison charts",
        "Audit trail with IST timestamps on every action",
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Platform Architecture
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Enterprise Features Built For Smart Property Owners
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Explore the tools and capabilities designed to automate your day-to-day rental operations and give you full financial visibility.
        </p>
      </div>

      {/* Deep Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {deepFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <Card
              key={idx}
              className="p-7 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  {feat.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border border-blue-200 text-slate-900 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Experience the Features Live</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Test all feature modules instantly with our pre-configured demo account on the login page.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button className="h-11 px-7 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
              <span>Try Live Demo Now</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
