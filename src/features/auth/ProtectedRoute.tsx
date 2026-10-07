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

  // If in SuperAdmin mode, lock navigation to SuperAdmin portal until logged out
  if (activePortal === "SUPERADMIN" && !isSuperAdminRoute) {
    return <Navigate to="/superadmin" replace />;
  }

  // If in Landlord mode, prevent entering SuperAdmin portal without selecting it at login
  if (activePortal === "LANDLORD" && isSuperAdminRoute) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
