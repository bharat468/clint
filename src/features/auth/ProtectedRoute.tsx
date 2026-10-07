import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);
  const activePortal = useAppSelector((s) => s.auth.activePortal);
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");
  const hasAdminPrivileges = Boolean(user.isSuperAdmin || user.adminRole);

  // If a non-admin tries to access /superadmin, redirect to landlord home
  if (isSuperAdminRoute && !hasAdminPrivileges) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
