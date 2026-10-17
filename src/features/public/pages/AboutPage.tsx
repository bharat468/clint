import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  HeartHandshake,
  Cpu,
  Layers,
  MapPin,
} from "lucide-react";

export default function AboutPage() {
  const milestones = [
    {
      year: "The Problem",
      title: "Messy Diaries & Weekend WhatsApp Chases",
      desc: "Like thousands of property owners in India, we started with a notebook, an Excel sheet, and dozens of WhatsApp chats. Every 1st of the month was a headache—calculating sub-meters on scrap paper, verifying blurred UPI screenshots, and arguing over forgotten annual rent hikes.",
    },
    {
      year: "The Prototype",
      title: "Built on the Ground, Not in a Corporate Boardroom",
      desc: "RentMate was born out of real properties in Jaipur and Bengaluru. We coded the first sub-meter tariff calculator and 11-month agreement generator to solve our own family rental disputes before opening it to other owners.",
    },
    {
      year: "Today",
      title: "1,500+ Units Managed Across India",
      desc: "From standalone 2BHK flats to 40-room student PGs and commercial shops, landlords trust RentMate to collect rent on schedule, issue professional receipts, and protect their rental yield without any software bloat.",
    },
  ];

  const principles = [
    {
      icon: Zap,
      title: "Built for Real Indian Tenancies",
      desc: "We don't copy US-centric rental software. RentMate natively handles Indian realities: electricity sub-meter tariffs (₹8–₹12/unit), cash rent vouchers with serial numbers, 11-month agreement templates, and WhatsApp-ready PDF receipts.",
    },
    {
      icon: ShieldCheck,
      title: "Passwordless Zero-Trust Security",
      desc: "No passwords to write on sticky notes or leak online. Log in with a single-use 6-digit cryptographic OTP sent directly to your verified phone, backed by strict IP rate limiting and isolated workspace databases.",
    },
    {
      icon: Layers,
      title: "No Clutter, Zero Software Manuals Needed",
      desc: "Property management shouldn't require an engineering degree. Every screen in RentMate is designed for zero learning curve—whether you're an NRI owner in Singapore or a local caretaker on the ground.",
    },
    {
      icon: HeartHandshake,
      title: "Zero Commission on Your Rental Income",
      desc: "We believe your rent is 100% yours. Unlike aggregators who take a 1%–2% cut of every transaction, RentMate is a transparent flat-fee software tool. We charge zero commission on rent collected.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* 1. Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Our Story & Philosophy</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Built by Landlords Who Were Tired of{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            WhatsApp Chaos & Paper Diaries
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          We built RentMate because existing property tools were either bloated Western corporate CRMs or fragile Excel spreadsheets that broke every month.
        </p>
      </div>

      {/* 2. Story Narrative with Realistic Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Why We Started
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rental management in India has been stuck in the 1990s for too long.
          </h2>
          <p>
            Every month across cities like Jaipur, Pune, Bengaluru, and Delhi NCR, landlords spend hours deciphering screenshot receipts sent on WhatsApp. Did Flat 302 pay their maintenance? What was the previous electricity meter reading for Room 12? When was the last time rent was hiked by 10%?
          </p>
          <p>
            When disputes happen over security deposits or overdue rent, handwritten diaries offer zero proof. Meanwhile, corporate software charges thousands of dollars and demands complex staff onboarding.
          </p>
          <p className="font-medium text-slate-900">
            RentMate changes that. A lightning-fast cloud control center that anyone can use on their phone in 30 seconds, designed from the ground up for Indian tenancy laws and everyday rental routines.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-blue-50/40 p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <span>What Makes RentMate Different</span>
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Sub-Meter Electricity Arithmetic:</strong>
                  Enter previous & current kWh readings. The bill is auto-computed and attached to the rent invoice.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">30-Day Rent Escalation Radar:</strong>
                  Automated alerts before 11 months expire so you never forfeit your standard 8%–10% rent hike.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Aadhaar & Contact Vault:</strong>
                  Safely store tenant ID proofs, permanent addresses, and emergency contacts in one secure folder.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Instant WhatsApp Receipts:</strong>
                  Generate clean PDF vouchers with bank reference numbers ready to send over WhatsApp in 1 tap.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Journey (Milestones) */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How RentMate Evolved
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            From local family properties to an automated platform trusted across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {milestones.map((m, idx) => (
            <Card
              key={idx}
              className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {m.year}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3">{m.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{m.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Core Principles */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Core Product Commitments
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            The fundamental design rules we adhere to for every line of code we ship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card
                key={idx}
                className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-start gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Headquartered & Support info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Proudly Developed & Supported in India</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Available 7 days a week on phone and WhatsApp for landlord onboarding and custom setups.
            </p>
          </div>
        </div>
        <Link to="/contact">
          <Button variant="outline" className="text-xs font-bold border-slate-300 rounded-xl px-5 h-10">
            Contact Our Team
          </Button>
        </Link>
      </div>

      {/* 6. Bottom CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          See How Simple Property Management Can Be
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
          Log in with our 1-click interactive demo account to test the complete dashboard, receipts, and sub-meter calculators in 60 seconds.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-7 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-xs transition-colors">
              <span>Launch Live Demo Workspace</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link to="/rentals" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto h-11 px-6 text-xs font-semibold bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-300/40 rounded-xl transition-colors shadow-2xs"
            >
              Browse Public Rentals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

