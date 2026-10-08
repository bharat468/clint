export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 font-sans">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          User Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-slate-500">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or subscribing to RentMate ("Service"), you agree to abide by these Terms and Conditions. If you are registering an organization on behalf of an enterprise or family partnership, you represent that you hold authority to bind that entity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Permitted Use</h2>
          <p>
            RentMate is provided for managing residential, commercial, or PG rental properties, tracking tenant records, and recording collections. Users agree not to store unlawful or fraudulent records on the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Subscription Plans & Quotas</h2>
          <p>
            Access is provided subject to active subscription plan quotas (max properties, tenants, and staff seats). Exceeding plan limits requires an upgrade or quota adjustment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Limitation of Liability</h2>
          <p>
            RentMate serves as software infrastructure to record property transactions. We are not a party to tenant leases or landlord-tenant disputes. Rent payments remain direct agreements between landlords and tenants.
          </p>
        </section>
      </div>
    </div>
  );
}
