import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
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

  const displayPlans = plans;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Flexible Plans For Every Portfolio Size
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Scale your rental property operations smoothly. Change or upgrade your quotas anytime directly from your dashboard.
        </p>

        {/* Billing Toggle */}
        <div className="pt-2 inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 rounded-lg transition-all ${
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
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {displayPlans.map((plan, idx) => {
          const isPopular = plan.slug === "pro" || idx === 1;
          const price =
            billingCycle === "YEARLY"
              ? Math.round((plan.priceYearly || plan.priceMonthly * 10) / 12)
              : plan.priceMonthly;

          return (
            <Card
              key={plan.id}
              className={`p-8 rounded-2xl flex flex-col justify-between transition-all duration-200 ${
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
                  <span className="text-4xl font-extrabold text-slate-900">
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
                  <div className="font-bold text-slate-700">Included Allocations:</div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Up to <strong>{plan.maxProperties} Units</strong>
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
                      Up to <strong>{plan.maxStaff} Staff Accounts</strong>
                    </span>
                  </div>

                  <div className="pt-2 font-bold text-slate-700">Included Features:</div>
                  {Array.isArray(plan.features) &&
                    plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-slate-600">
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

      {/* Feature Comparison Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 text-center">Plan Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-bold text-slate-700">Feature</th>
                <th className="p-3 font-bold text-slate-700 text-center">Starter</th>
                <th className="p-3 font-bold text-slate-700 text-center">Pro</th>
                <th className="p-3 font-bold text-slate-700 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium text-slate-800">Unit Limit</td>
                <td className="p-3 text-center text-slate-600">Up to 5</td>
                <td className="p-3 text-center text-slate-600">Up to 25</td>
                <td className="p-3 text-center font-bold text-blue-600">Unlimited (100+)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Digital Rent Receipts</td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Zero-Trust Mobile OTP</td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Staff Role Property Scoping</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Multi-Tenant Boundaries</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Dedicated Account SLA</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-center font-bold text-blue-600">Priority 24/7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
