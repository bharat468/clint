import { NavLink } from "react-router-dom";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Users,
  X,
  ShieldCheck,
  Sparkles,
  Settings,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleSidebar } from "@/features/ui/uiSlice";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/tenants", label: "Tenants", icon: Users },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const user = useAppSelector((s) => s.auth.user);

  const isSuperAdmin =
    user?.mobile === "9876543210" || (user as any)?.isSuperAdmin;

  const getInitials = (name?: string | null) => {
    if (!name) return "RM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-white">
      <div className="space-y-6">
        {/* Brand Header with Official Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <img
              src="/RentMate%20Smart%20Rentals%20Logo.png"
              alt="RentMate Logo"
              className="h-11 w-auto object-contain"
            />
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Close sidebar"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Main Menu</p>
          <nav className="mt-2 space-y-1">
            {navigationLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    dispatch(toggleSidebar());
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
                    isActive
                      ? "bg-blue-600 text-white shadow-xs shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Dedicated SuperAdmin Platform Portal (Only for Designated Platform Admin) */}
        {isSuperAdmin && (
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Platform Governance
            </p>
            <nav className="mt-2 space-y-1">
              <NavLink
                to="/superadmin"
                className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>SuperAdmin Portal</span>
                <ExternalLink className="h-3 w-3 ml-auto text-slate-400 group-hover:text-white" />
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Smart Dashboard</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            Units & payment records synced in real-time.
          </p>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white shadow-xs">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800">{user?.name || "Landlord"}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>Owner Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => dispatch(toggleSidebar())}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden h-screen sticky top-0 shrink-0 border-r border-slate-200/80 bg-white transition-all duration-300 md:block",
          open ? "w-64" : "w-0 overflow-hidden border-none"
        )}
      >
        {open && navContent}
      </aside>
    </>
  );
}
