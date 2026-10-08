import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Users,
  X,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleSidebar, closeSidebar } from "@/features/ui/uiSlice";
import { setActivePortal } from "@/features/auth/authSlice";
import { canAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const mainNavigationLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/tenants", label: "Tenants", icon: Users },
  { to: "/payments", label: "Payments", icon: CreditCard },
];

const settingsModules = [
  { to: "/settings/team", label: "Team & Staff", icon: Users },
  { to: "/settings/roles", label: "Roles & Permissions", icon: Sliders },
  { to: "/settings/organization", label: "Organization Profile", icon: Building2 },
  { to: "/settings/billing", label: "Plan & Quotas", icon: CreditCard },
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const user = useAppSelector((s) => s.auth.user);

  const isSettingsActive = location.pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  // Dynamic RBAC Filter: Modules only appear if user has the assigned permission
  const filteredMainLinks = mainNavigationLinks.filter((link) => {
    if (link.to === "/") return true;
    if (link.to === "/properties") return canAccess(user, "property.read") || canAccess(user, "property.create");
    if (link.to === "/tenants") return canAccess(user, "tenant.read") || canAccess(user, "tenant.create");
    if (link.to === "/payments") return canAccess(user, "payment.read") || canAccess(user, "payment.create");
    return true;
  });

  const filteredSettingsModules = settingsModules.filter((sub) => {
    if (sub.to === "/settings/team") return canAccess(user, "role.assign") || canAccess(user, "role.read");
    if (sub.to === "/settings/roles") return canAccess(user, "role.create") || canAccess(user, "role.read");
    if (sub.to === "/settings/organization") return canAccess(user, "role.assign") || user?.isSuperAdmin || user?.permissions?.includes("*");
    if (sub.to === "/settings/billing") return user?.isSuperAdmin || user?.permissions?.includes("*");
    return true;
  });

  const hasSettingsAccess = filteredSettingsModules.length > 0;

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  const isSuperAdmin =
    Boolean((user as any)?.isSuperAdmin) ||
    (user as any)?.adminRole === "SUPER_ADMIN";

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
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <div className="flex items-center">
            <img
              src="/RentMate%20Smart%20Rentals%20Logo.png"
              alt="RentMate Logo"
              className="h-14 xl:h-16 w-auto max-w-[210px] object-contain drop-shadow-2xs"
            />
          </div>
          {/* Mobile close button */}
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
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Main Menu</p>
          <nav className="mt-2 space-y-1">
            {filteredMainLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
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

            {/* Expandable Settings Dropdown / Drawer - only shown if user has access to setting modules */}
            {hasSettingsAccess && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!settingsOpen && !isSettingsActive && filteredSettingsModules[0]) {
                      navigate(filteredSettingsModules[0].to);
                    }
                    setSettingsOpen(!settingsOpen);
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
                    isSettingsActive
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Settings
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:rotate-45",
                        isSettingsActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>Settings</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200",
                      settingsOpen ? "rotate-180 text-blue-600" : ""
                    )}
                  />
                </button>

                {/* Sub-modules Accordion Drawer */}
                {settingsOpen && (
                  <div className="ml-3 mt-1.5 space-y-1 border-l-2 border-blue-100 pl-2.5 animate-in slide-in-from-top-2 duration-150">
                    {filteredSettingsModules.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          dispatch(closeSidebar());
                        }
                      }}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-150",
                          isActive
                            ? "bg-blue-600 text-white font-bold shadow-2xs"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5",
                              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      </div>

      {/* Bottom Footer Section: Clean User Profile & Portal Switcher */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        {(isSuperAdmin || Boolean((user as any)?.adminRole)) && (
          <button
            type="button"
            onClick={() => {
              dispatch(setActivePortal("SUPERADMIN"));
              navigate("/superadmin");
            }}
            className="flex w-full items-center justify-between rounded-xl bg-blue-50/90 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200/60 shadow-2xs group"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span>SuperAdmin Platform</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
          </button>
        )}

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-xs text-white shadow-xs">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">{user?.name || "Landlord"}</p>
            <p className="truncate text-[11px] text-slate-500 font-medium">
              {(user as any)?.organizationName || "Owner Account"}
            </p>
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
