export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 font-sans">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Legal & Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            RentMate Technologies Pvt. Ltd. collects information necessary to deliver property and rental management services. This includes property owner contact details, tenant names, contact numbers, email addresses, and payment logs recorded by authorized organization users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Zero-Trust Authentication</h2>
          <p>
            We do not store passwords. Authentication is conducted via 6-digit one-time passwords (OTP) sent to verified mobile numbers. Tokens are cryptographically signed using JSON Web Tokens (JWT) with standard expiration lifetimes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Multi-Tenant Data Isolation</h2>
          <p>
            All organization data is strictly partitioned. Data from your properties, tenants, and collections is inaccessible to any other landlord or organization on the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Third-Party Sharing</h2>
          <p>
            RentMate never sells, monetizes, or leases your tenant or property data to advertisers or third-party marketers. Data is stored solely to execute rental operations as directed by the property owner.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Contact Our Data Protection Officer</h2>
          <p>
            If you have questions or requests regarding your stored data, reach out to us at{" "}
            <a href="mailto:bharatpareek256@gmail.com" className="text-blue-600 font-semibold underline">
              bharatpareek256@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
