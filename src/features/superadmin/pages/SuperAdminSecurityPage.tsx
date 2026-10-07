import { Lock, ShieldCheck, Key, Server, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SuperAdminSecurityPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Cryptography & Architecture
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Security & Multi-Tenant Isolation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Core architectural security guarantees protecting landlord databases, tenant ledgers, and token lifetimes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Card 1: Dual-Token Architecture */}
        <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">1. Dual-Token Architecture</h3>
              <p className="text-xs text-slate-500">Short-lived Access Token & Persistent Refresh Token</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <p>
              • <strong>Access Token (JWT):</strong> Valid for <strong>15 minutes</strong>. Contains cryptographic payload with user ID, designated mobile, active organization ID, and role permissions. If intercepted, exposure is strictly limited to 15 minutes.
            </p>
            <p className="mt-2">
              • <strong>Refresh Token:</strong> Valid for <strong>7 days</strong> with automatic rotation upon token renewal.
            </p>
          </div>
        </Card>

        {/* Card 2: HttpOnly Cookie Protection */}
        <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">2. HTTP-Only Cookie Protection</h3>
              <p className="text-xs text-slate-500">Eliminates Cross-Site Scripting (XSS) Token Theft</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <p>
              The persistent refresh token is never stored in browser localStorage or accessible to JavaScript scripts. It is securely delivered inside an <code className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">HttpOnly; SameSite=Lax</code> cookie header, blocking malicious browser extensions from reading sensitive credentials.
            </p>
          </div>
        </Card>

        {/* Card 3: Strict Pre-Registered User Gate */}
        <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">3. Strict Pre-Registered Mobile Gate</h3>
              <p className="text-xs text-slate-500">Uninvited logins rejected with 403 Forbidden</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <p>
              RentMate implements a zero-trust login barrier. Arbitrary mobile numbers cannot request OTP or register accounts. Only numbers created as property staff or invited as platform tenants by an Organization Owner or SuperAdmin can receive verification codes.
            </p>
          </div>
        </Card>

        {/* Card 4: Multi-Tenant Data Isolation */}
        <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">4. Multi-Tenant Landlord Isolation</h3>
              <p className="text-xs text-slate-500">Strict Organization Scoping on Database Queries</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <p>
              Every database query (Properties, Tenants, Payments, Leases) enforces an organization boundary (<code className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">organizationId: user.organizationId</code>). Landlord A cannot read or write properties or payment records belonging to Landlord B.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
