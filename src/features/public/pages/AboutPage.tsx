import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Our Story & Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Building the Operating System for Modern Property Rentals
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          RentMate was created with a clear mission: replace messy notebooks and unorganized spreadsheets with an intuitive, enterprise-grade cloud workspace.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">
            Why Property Management Needed a Rethink
          </h2>
          <p>
            For decades, landlords, PG owners, and real estate operators in India have managed multi-lakh rental portfolios using informal WhatsApp chats, paper receipt books, and disparate spreadsheets.
          </p>
          <p>
            When leases renew or payments get delayed, critical records get lost. Landlords face friction with tenants, and property staff have no clear delegation system.
          </p>
          <p>
            RentMate delivers a modern solution: zero-trust mobile OTP authentication, automated rent collection tracking, instant PDF receipts, and granular role permissions that keep property owners in complete control.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">100% Cloud-Native & Secure</div>
              <div className="text-xs text-slate-500">Accessible anywhere on mobile, tablet, or PC</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Zero Password Vulnerability</div>
              <div className="text-xs text-slate-500">6-digit mobile OTP gate protects your account</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Multi-Tenant Scalability</div>
              <div className="text-xs text-slate-500">Built to handle from 1 unit to 10,000+ properties</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Our Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-2xl border border-slate-200 bg-white">
            <ShieldCheck className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900">Security Without Friction</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              We never compromise on security. Zero-trust architecture ensures your financial records and tenant agreements remain private and tamper-proof.
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white">
            <Sparkles className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900">Simplicity First</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              No complex 50-page enterprise manuals. Every screen in RentMate is designed to be self-explanatory and fast to use for non-tech-savvy users.
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white">
            <Building2 className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900">Real Real-Estate Focus</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              We build specifically for Indian rental practices—supporting partial payments, cash/UPI vouchers, and individual room leases.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-blue-600 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Join the Rental Revolution</h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
          Start managing your property portfolio like an enterprise today.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button className="h-11 px-7 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-xs">
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
