import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight, Search, Sparkles, Phone, MessageSquare } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  category: "Rent & Receipts" | "Sub-Meters & Bills" | "11-Month Agreements" | "Security & Staff" | "Pricing";
}

const ALL_FAQS: FaqItem[] = [
  {
    category: "Rent & Receipts",
    q: "Can I log cash rent collections and still generate a valid digital receipt?",
    a: "Yes! RentMate supports Cash, UPI, Cheque, and direct Bank IMPS. When you log a cash payment, RentMate generates a sequential digital receipt with exact timestamp and payment mode notes, preventing any 'I already paid you cash' disputes at month-end.",
  },
  {
    category: "Rent & Receipts",
    q: "What if a tenant pays half rent on the 5th and the rest on the 20th?",
    a: "RentMate supports partial payments natively. When you log the first installment, RentMate marks the invoice as 'Partially Paid', logs the remaining balance, and issues a partial receipt. Once the remaining amount is settled, the voucher updates to 'Fully Paid'.",
  },
  {
    category: "Rent & Receipts",
    q: "How do I share payment receipts with my tenants over WhatsApp?",
    a: "Every logged payment has a 1-click 'Share Receipt' button. It generates a clean, printable PDF with your property name, tenant name, amount, bank UTR / cash voucher number, and month of rent ready to send directly over WhatsApp.",
  },
  {
    category: "Sub-Meters & Bills",
    q: "How does the sub-meter electricity calculator work?",
    a: "In each unit record, you can enter the previous meter reading and the current month's reading. RentMate subtracts the two to find net units consumed, multiplies by your customized rate (e.g. ₹9 or ₹10.50 per unit), and automatically bundles the electricity charge into the monthly rent invoice.",
  },
  {
    category: "Sub-Meters & Bills",
    q: "Can I add fixed monthly maintenance or water charges?",
    a: "Yes. Alongside electricity sub-meters, you can configure recurring monthly maintenance, water tanker charges, or parking fees so they appear as transparent line items on the tenant's receipt.",
  },
  {
    category: "11-Month Agreements",
    q: "How does RentMate generate 11-month legal rental agreements?",
    a: "RentMate takes your property address, landlord details, tenant Aadhaar/contact, monthly rent, and security deposit, and auto-fills a standard 11-month agreement compliant with Indian tenancy norms. You can download and print it for notarization or stamp paper execution.",
  },
  {
    category: "11-Month Agreements",
    q: "How does the 30-day lease escalation radar work?",
    a: "RentMate actively tracks lease start and end dates. 30 days and 7 days before an 11-month lease expires, RentMate alerts you with the recommended revised rent (e.g., standard +8% to +10% escalation), allowing you to renew agreements on schedule without losing revenue.",
  },
  {
    category: "Security & Staff",
    q: "Can my building caretaker or manager record payments without seeing my private profits?",
    a: "Yes! Using our scoped Staff accounts, you can create a login for your manager that allows them to log payments, record sub-meter readings, and register tenants for their specific building, without granting them access to your overall subscription settings, bank details, or portfolio valuation.",
  },
  {
    category: "Security & Staff",
    q: "Why does RentMate use passwordless Mobile OTP instead of regular passwords?",
    a: "Traditional passwords get leaked, reused, or written on notebooks. RentMate verifies users via a single-use 6-digit cryptographic OTP sent directly to their verified SIM. It is faster, immune to credential stuffing attacks, and ensures zero password vulnerability.",
  },
  {
    category: "Pricing",
    q: "Does RentMate take any commission on the rent we collect?",
    a: "Zero commission. RentMate is 100% pure software. Unlike aggregators who take a 1%–2% cut from every rent transaction, 100% of the rent collected goes straight to your bank account or cash box.",
  },
  {
    category: "Pricing",
    q: "Can I upgrade or downgrade my plan as my unit count changes?",
    a: "Yes, you can upgrade your plan at any time directly from Billing Settings. RentMate calculates pro-rata pricing so you never pay twice for the same billing cycle.",
  },
];

const CATEGORIES = [
  "All Questions",
  "Rent & Receipts",
  "Sub-Meters & Bills",
  "11-Month Agreements",
  "Security & Staff",
  "Pricing",
] as const;

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return ALL_FAQS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Questions" || item.category === selectedCategory;
      const qLower = item.q.toLowerCase();
      const aLower = item.a.toLowerCase();
      const sLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || qLower.includes(sLower) || aLower.includes(sLower);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Help & Knowledge Center</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Everything You Need to Know About{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            RentMate
          </span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Clear, practical answers about rent collections, sub-meter billing, 11-month lease renewals, and security.
        </p>

        {/* Live Search Input */}
        <div className="pt-2 relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g., cash, sub-meter, agreement)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedCategory === cat
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-700">No questions found matching your search.</p>
            <p className="text-xs text-slate-500">Try searching for broader terms or reset the category filter.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Questions");
              }}
              className="text-xs mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline">
                      {item.category}
                    </span>
                    <span>{item.q}</span>
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-90 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5 bg-slate-50/30">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Still Need Help Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span>Have a specific property setup question?</span>
          </h3>
          <p className="text-xs text-slate-600">
            Our landlord support team is available 7 days a week on WhatsApp and direct phone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:+918003953815">
            <Button variant="outline" className="h-10 px-4 text-xs font-semibold gap-2 border-slate-300">
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              <span>Call Helpline</span>
            </Button>
          </a>
          <Link to="/contact">
            <Button className="h-10 px-5 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
              <span>Send Inquiry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

