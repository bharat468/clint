import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  FileQuestion,
  Home,
  ArrowLeft,
  LogIn,
  LayoutDashboard,
  ShieldAlert,
  Mail,
  Phone,
  Compass,
} from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  const isAuthenticated = Boolean(token && user);
  const isSuperAdmin = Boolean(user?.isSuperAdmin || user?.adminRole);
  const primaryDashboardPath = isSuperAdmin ? "/superadmin" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-200/60">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/RentMate%20Smart%20Rentals%20Logo.png"
            alt="RentMate Logo"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(primaryDashboardPath)}
              className="gap-2 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
              <span>Go to Dashboard</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main 404 Hero Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Visual Icon Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-xl -z-10 scale-125" />
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 shadow-md flex items-center justify-center text-blue-600">
              <FileQuestion className="h-12 w-12 stroke-[1.75]" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold shadow-2xs">
              404
            </div>
          </div>

          {/* Heading and explanation */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              Page Not Found
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Yeh Page Maujood Nahi Hai
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              Aap jo URL access karne ki koshish kar rahe hain (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-mono font-semibold border border-slate-200">
                {location.pathname}
              </code>
              ) woh ya toh shift ho gaya hai, remove ho chuka hai, ya fir exist nahi karta.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-11 px-5 rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-2 shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back (Piche Jayein)</span>
            </Button>

            {isAuthenticated ? (
              <Button
                onClick={() => navigate(primaryDashboardPath)}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Open Dashboard</span>
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>Go to Login Screen</span>
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="h-11 px-5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </div>

          {/* Quick Help Card */}
          <div className="max-w-lg mx-auto p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <h2 className="font-bold text-slate-900">Madad Chahiye? (Need Assistance?)</h2>
                <p className="text-slate-500 leading-relaxed">
                  Agar aapko lagta hai ki yeh galat URL hai ya system me koi link break hua hai, toh RentMate platform team se direct sampark karein:
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                  <a
                    href="mailto:bharatpareek256@gmail.com"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>bharatpareek256@gmail.com</span>
                  </a>
                  <a
                    href="tel:+918003953815"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>+91 8003953815</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-slate-200/60 text-xs text-slate-400">
        RentMate Smart Rentals &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
