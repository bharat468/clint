import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqCategories = [
    {
      category: "General & Getting Started",
      items: [
        {
          q: "What is RentMate?",
          a: "RentMate is an enterprise cloud platform built for landlords, property owners, and real estate managers. It streamlines property unit directories, digital tenant leases, rent collection logs, and printable receipts.",
        },
        {
          q: "Can I manage properties across different cities?",
          a: "Yes! RentMate supports multi-city and multi-building portfolios. You can filter and group your properties by location, occupancy status, or rental tier.",
        },
        {
          q: "Is there a mobile app or does it work on mobile browsers?",
          a: "RentMate is a responsive Progressive Web Application (PWA). It works seamlessly across smartphones, tablets, and desktop computers without requiring separate app-store downloads.",
        },
      ],
    },
    {
      category: "Security & Zero-Trust Authentication",
      items: [
        {
          q: "Why does RentMate use Mobile OTP instead of passwords?",
          a: "Traditional passwords are prone to being forgotten, reused, or stolen through phishing attacks. With RentMate's Zero-Trust Mobile OTP, only verified account holders with access to the registered mobile SIM can log in.",
        },
        {
          q: "Is my rental data isolated from other organizations?",
          a: "Yes. RentMate utilizes strict multi-tenant boundary isolation. Your tenant records, lease contracts, and financial payments are completely separated from all other platform clients.",
        },
      ],
    },
    {
      category: "Rent Tracking & Invoices",
      items: [
        {
          q: "Does RentMate charge a commission on rent collected?",
          a: "No! RentMate is a pure SaaS software subscription. We do not deduct any percentage or commission from your rental income.",
        },
        {
          q: "Can I generate and print rent receipts?",
          a: "Yes, every logged payment generates a printable digital rent receipt complete with property name, tenant name, month, amount, payment mode, and unique transaction reference ID.",
        },
      ],
    },
    {
      category: "Plans & Subscription Limits",
      items: [
        {
          q: "What happens if I add more properties than my plan limit?",
          a: "RentMate's Plan Guard will notify you when you approach your quota. You can upgrade your plan with one click from your Billing Settings to unlock higher capacity.",
        },
        {
          q: "Can I test the platform before purchasing a subscription?",
          a: "Yes, you can use our 1-click Demo credentials on the login screen to explore the entire platform without any financial commitment.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Knowledge Base
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600">
          Find answers to common questions about onboarding, security, pricing, and features.
        </p>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-10">
        {faqCategories.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>{cat.category}</span>
            </h3>

            <div className="space-y-2.5">
              {cat.items.map((item, iIdx) => {
                const globalIdx = cIdx * 10 + iIdx;
                const isOpen = openIndex === globalIdx;

                return (
                  <div
                    key={iIdx}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                      className="w-full p-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronRight
                        className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-90 text-blue-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions CTA */}
      <div className="rounded-2xl bg-slate-100 p-8 text-center space-y-3 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Still have questions?</h3>
        <p className="text-xs text-slate-600">
          Our team is available to assist you with customized demos and portfolio setup.
        </p>
        <div className="pt-2">
          <Link to="/contact">
            <Button className="h-10 px-5 text-xs font-semibold gap-2 bg-blue-600 text-white rounded-xl">
              <span>Contact Support</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
