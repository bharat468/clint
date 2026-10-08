import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Layers,
  ShieldCheck,
  Users,
  Sliders,
  ChevronRight,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setActivePortal } from "@/features/auth/authSlice";
import { toggleSidebar, closeSidebar } from "@/features/ui/uiSlice";
import { cn } from "@/lib/utils";

const superAdminNavLinks = [
  { to: "/superadmin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/superadmin/organizations", label: "Organizations", icon: Building2 },
  { to: "/superadmin/plans", label: "Plans", icon: Layers },
  { to: "/superadmin/roles", label: "Roles & Permissions", icon: ShieldCheck },
  { to: "/superadmin/users", label: "Users", icon: Users },
  { to: "/superadmin/settings", label: "Settings", icon: Sliders },
];

export default function SuperAdminSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const user = useAppSelector((s) => s.auth.user);

  const getInitials = (name?: string | null) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSwitchToLandlord = () => {
    dispatch(setActivePortal("LANDLORD"));
    navigate("/");
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-white">
      <div className="space-y-6">
        {/* Brand Header with Matching Full Size Logo */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <div className="flex items-center">
            <img
              src="/RentMate%20Smart%20Rentals%20Logo.png"
              alt="RentMate Logo"
              className="h-14 xl:h-16 w-auto max-w-[210px] object-contain drop-shadow-2xs"
            />
          </div>
          {/* Mobile close */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Menu
          </p>
          <nav className="mt-2 space-y-1">
            {superAdminNavLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    dispatch(closeSidebar());
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
      </div>

      {/* Bottom Footer Section: Matching Landlord Workspace */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        {/* Switch to Landlord Workspace */}
        <button
          type="button"
          onClick={handleSwitchToLandlord}
          className="flex w-full items-center justify-between rounded-xl bg-blue-50/90 hover:bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 transition-colors border border-blue-200/60 shadow-2xs group"
        >
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600 transition-transform group-hover:scale-110" />
            <span>Landlord Workspace</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
        </button>

        {/* User Mini Profile Card */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-xs text-white shadow-xs">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">{user?.name || "Super Administrator"}</p>
            <p className="truncate text-[11px] text-slate-500 font-medium">
              Super Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
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
