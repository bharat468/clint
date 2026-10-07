import { Menu, LogOut, Server, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleSidebar } from "@/features/ui/uiSlice";
import { logout } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";

export default function SuperAdminNavbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md transition-all sm:px-6 lg:px-8">
      {/* Left side: Mobile Toggle & Portal title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">
              RentMate Executive Platform
            </span>
            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
              SuperAdmin Console
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Vitals & Direct Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/60 text-xs">
          <Server className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-mono text-slate-600 text-[11px]">API 5000: Operational</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/60 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-700 text-xs">{user?.mobile}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
