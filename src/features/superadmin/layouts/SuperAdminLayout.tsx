import { Outlet } from "react-router-dom";
import { Lock, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import SuperAdminNavbar from "../components/SuperAdminNavbar";

export default function SuperAdminLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const isSuperAdmin =
    Boolean(user?.isSuperAdmin) ||
    user?.adminRole === "SUPER_ADMIN";

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full p-8 bg-white border border-slate-200 text-center rounded-2xl shadow-xl space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto border border-rose-100">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This portal is strictly restricted to Platform SuperAdministrators with master administrative credentials.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => dispatch(logout())}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2 text-xs"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout & Return to Login</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans">
      <SuperAdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <SuperAdminNavbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
