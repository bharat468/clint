import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    units: "1-10",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Support & Consultation
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch with RentMate
        </h1>
        <p className="text-sm text-slate-600">
          Have questions about onboarding your portfolio or custom enterprise pricing? Our team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <Card className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Direct Support Helpline</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                <a href="tel:+918003953815" className="hover:text-blue-600 transition-colors">
                  +91 8003953815
                </a>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Available: 9:00 AM - 8:00 PM IST</div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Email Inquiries</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                <a href="mailto:bharatpareek256@gmail.com" className="hover:text-emerald-600 transition-colors">
                  bharatpareek256@gmail.com
                </a>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Fast response within 2 hours</div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Office Location</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">RentMate Technologies</div>
              <div className="text-[11px] text-slate-400 mt-1">Jaipur, Rajasthan, India</div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Inquiry Received Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{form.name}</strong>. Our rental portfolio specialist will call you at{" "}
                  <strong>+91 {form.mobile}</strong> within 2 hours to help you configure your account.
                </p>
                <div className="pt-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", mobile: "", email: "", units: "1-10", message: "" });
                    }}
                    className="text-xs font-semibold rounded-xl"
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Send us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio Size</label>
                    <select
                      value={form.units}
                      onChange={(e) => setForm({ ...form, units: e.target.value })}
                      className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                    >
                      <option value="1-5">1 - 5 Units (Individual)</option>
                      <option value="5-25">5 - 25 Units (Pro)</option>
                      <option value="25-100">25 - 100 Units (Commercial/PG)</option>
                      <option value="100+">100+ Units (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message or Questions</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your properties or what you'd like to achieve..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? "Sending..." : "Submit Inquiry"}</span>
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
