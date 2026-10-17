import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
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

const MATRIX_FEATURES = [
  { name: "Max Properties / Flats Managed", starter: "Up to 5", pro: "Up to 25", enterprise: "Unlimited (100+)" },
  { name: "Tenant Lease Records", starter: "Up to 10", pro: "Up to 60", enterprise: "Unlimited (300+)" },
  { name: "Sub-Meter Electricity Calculator", starter: true, pro: true, enterprise: true },
  { name: "11-Month Rental Agreement PDF", starter: true, pro: true, enterprise: true },
  { name: "WhatsApp & Cash Payment Receipts", starter: true, pro: true, enterprise: true },
  { name: "30-Day Rent Escalation Radar (+10%)", starter: false, pro: true, enterprise: true },
  { name: "Scoped Property Manager Logins", starter: "2 Staff", pro: "5 Staff", enterprise: "20+ Custom Roles" },
  { name: "Defaulter & Unpaid Rent Tracker", starter: true, pro: true, enterprise: true },
  { name: "Multi-Organization Database Gating", starter: false, pro: false, enterprise: true },
  { name: "Commission on Rent Collected", starter: "0% Commission", pro: "0% Commission", enterprise: "0% Commission" },
  { name: "Priority WhatsApp Helpline Support", starter: "Standard", pro: "Priority (2h SLA)", enterprise: "Dedicated Manager" },
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

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

  const pricingFaqs = [
    {
      q: "Does RentMate charge any percentage cut on rent collected?",
      a: "No! Absolutely 0% commission. RentMate is a transparent flat-fee SaaS software. All rent collected goes directly from your tenant into your bank account.",
    },
    {
      q: "Can I upgrade my plan as I acquire more rental properties?",
      a: "Yes, you can upgrade instantly from your Billing Settings anytime. Upgrades are pro-rated so you never pay twice for the same period.",
    },
    {
      q: "Do my tenants have to pay anything to view receipts?",
      a: "No. Tenant access, digital rent receipts, and lease document downloads are 100% free for all your tenants.",
    },
    {
      q: "What payment methods are supported for subscriptions?",
      a: "We support UPI (PhonePe, Google Pay, Paytm), RuPay debit cards, credit cards, and direct Net Banking through standard Indian payment gateways.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs sm:text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span>Straightforward Indian SaaS Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Zero Commissions. Transparent Plans for{" "}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Every Scale of Landlord
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          No hidden setup fees, surprise per-transaction deductions, or lock-in contracts. Switch or scale your unit capacity anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-3 inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 rounded-lg transition-all ${
              billingCycle === "MONTHLY"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("YEARLY")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === "YEARLY"
                ? "bg-blue-600 text-white shadow-2xs font-bold"
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

      {/* 2. Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
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
                <p className="text-xs text-slate-500 mt-1 min-h-[32px] leading-relaxed">
                  {plan.description}
                </p>

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

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs">
                  <div className="font-bold text-slate-800">Included Capacity:</div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Up to <strong>{plan.maxProperties} Units / Flats</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Up to <strong>{plan.maxTenants} Tenant Leases</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Up to <strong>{plan.maxStaff} Staff & Caretaker Logins</strong>
                    </span>
                  </div>

                  <div className="pt-2 font-bold text-slate-800">Operational Tools:</div>
                  {Array.isArray(plan.features) &&
                    plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-slate-600 leading-relaxed">
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
                    <span>Get Started with {plan.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Deep Feature Matrix Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900">Comprehensive Plan Matrix</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Compare every single feature and quota across our subscription tiers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3.5 px-4 font-bold text-slate-800">Capability</th>
                <th className="py-3.5 px-4 font-bold text-slate-800 text-center">Starter</th>
                <th className="py-3.5 px-4 font-bold text-blue-700 text-center bg-blue-50/40">Portfolio Pro</th>
                <th className="py-3.5 px-4 font-bold text-slate-800 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MATRIX_FEATURES.map((item, mIdx) => (
                <tr key={mIdx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">
                    {typeof item.starter === "boolean" ? (
                      item.starter ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )
                    ) : (
                      item.starter
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-900 bg-blue-50/20">
                    {typeof item.pro === "boolean" ? (
                      item.pro ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )
                    ) : (
                      item.pro
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                    {typeof item.enterprise === "boolean" ? (
                      item.enterprise ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )
                    ) : (
                      item.enterprise
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pricing FAQs */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Subscription & Billing FAQs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pricingFaqs.map((faq, fIdx) => (
            <div key={fIdx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

