import { useState, useEffect } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleSidebar } from "@/features/ui/uiSlice";
import { useLogout } from "@/features/auth/useLogout";
import { Button } from "@/components/ui/button";
import GlobalSearchModal from "@/components/layout/GlobalSearchModal";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

export default function SuperAdminNavbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const handleLogout = useLogout();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md transition-all sm:px-6">
        {/* Left side: Menu Toggle, Mobile Logo & Search Bar */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Mobile / Tablet Logo */}
          <img
            src="/RentMate%20Smart%20Rentals%20Logo.png"
            alt="RentMate Logo"
            className="h-10 w-auto md:hidden object-contain"
          />

          {/* Interactive Search Bar Trigger (Desktop) */}
          <div
            onClick={() => setSearchOpen(true)}
            role="button"
            tabIndex={0}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-1.5 text-xs text-slate-400 border border-slate-200/50 transition-all hover:border-blue-400 hover:bg-slate-100 cursor-pointer shadow-2xs select-none active:scale-[0.99]"
          >
            <Search className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-normal text-slate-500">Search organizations, users, plans...</span>
            <kbd className="ml-3 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side: Mobile Search, Notifications, User Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="sm:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
        {/* Notifications Dropdown */}
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Chip */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || "Super Administrator"}</p>
            <p className="text-[11px] font-medium text-slate-400 leading-tight">Super Administrator</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-xs font-bold text-white shadow-xs">
            {getInitials(user?.name)}
          </div>
        </div>

        {/* Clean Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-xs font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>

    {/* Universal Command Palette / Global Search Modal */}
    <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>
  );
}
