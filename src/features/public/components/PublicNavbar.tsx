import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/rentals", label: "Explore Rentals" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const activePortal = useAppSelector((s) => s.auth.activePortal);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const dashboardTarget =
    activePortal === "SUPERADMIN" || user?.isSuperAdmin ? "/superadmin" : "/dashboard";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3"
          : "bg-white/80 backdrop-blur-xs border-b border-slate-200/50 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/RentMate%20Smart%20Rentals%20Logo.png"
              alt="RentMate"
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <Link to={dashboardTarget}>
                <Button className="h-10 px-4 text-xs font-semibold gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="h-10 px-4.5 text-xs font-semibold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs hover:shadow-sm transition-all duration-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Get Started</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {token && (
              <Link to={dashboardTarget}>
                <Button size="sm" className="h-9 px-3 text-xs bg-blue-600 text-white rounded-lg">
                  Workspace
                </Button>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {token ? (
              <Link to={dashboardTarget} className="w-full">
                <Button className="w-full h-11 text-xs font-semibold gap-2 bg-blue-600 text-white rounded-xl">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Open Workspace Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full h-11 text-xs font-semibold rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button className="w-full h-11 text-xs font-semibold gap-2 bg-blue-600 text-white rounded-xl">
                    <Sparkles className="h-4 w-4" />
                    <span>Get Started</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
