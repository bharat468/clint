import { Link } from "react-router-dom";
import { Building2, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-white text-slate-600 font-sans border-t border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/RentMate%20Smart%20Rentals%20Logo.png"
                alt="RentMate"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              The modern property & rental management platform. Streamline rent collection, automate lease tracking, and manage properties with zero friction.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero-Trust Security</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Multi-Tenant Cloud</span>
              </div>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Key Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Live Demo Login
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors">
                  About RentMate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Frequently Asked
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Reach Out
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <a href="mailto:bharatpareek256@gmail.com" className="hover:text-blue-600 font-medium transition-colors">
                  bharatpareek256@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <a href="tel:+918003953815" className="hover:text-blue-600 font-medium transition-colors">
                  +91 8003953815
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Jaipur, Rajasthan, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} RentMate Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-800 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-slate-800 transition-colors">
              Terms of Service
            </Link>
            <Link to="/login" className="hover:text-slate-800 transition-colors">
              Landlord Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
