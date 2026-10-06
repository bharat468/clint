import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { toggleSidebar } from "@/features/ui/uiSlice";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const getInitials = (name?: string | null) => {
    if (!name) return "RM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md transition-all sm:px-6">
      {/* Left side: Menu Toggle & Quick Context */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
          className="text-slate-600 hover:text-slate-900"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar Display */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-1.5 text-xs text-slate-400 border border-slate-200/50 transition-colors hover:border-slate-300">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-normal text-slate-500">Search dashboard...</span>
          <kbd className="ml-3 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs border border-slate-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Notifications, User Avatar & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notifications Icon */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Chip */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || "Administrator"}</p>
            <p className="text-[11px] font-medium text-slate-400 leading-tight">Property Manager</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-xs font-bold text-white shadow-xs">
            {getInitials(user?.name)}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(logout())}
          className="gap-1.5 text-xs font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
