import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials } from "@/features/auth/authSlice";
import { authService } from "@/services/auth.service";
import { canAccess } from "@/lib/permissions";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      authService
        .me()
        .then((latestUser) => {
          if (latestUser) {
            dispatch(setCredentials({ user: latestUser, token: token ?? "" }));
          }
        })
        .catch(() => {
          // Handled by axios 401 interceptor
        });
    }
  }, [dispatch, token]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");
  const hasAdminPrivileges = Boolean(user.isSuperAdmin || user.adminRole);

  // If a non-admin tries to access /superadmin, redirect to landlord home
  if (isSuperAdminRoute && !hasAdminPrivileges) {
    return <Navigate to="/dashboard" replace />;
  }

  // Strict RBAC Route Guards for Landlord Workspace
  const pathname = location.pathname;
  if (pathname.startsWith("/properties") && !canAccess(user, "property.read") && !canAccess(user, "property.create")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (pathname.startsWith("/tenants") && !canAccess(user, "tenant.read") && !canAccess(user, "tenant.create")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (pathname.startsWith("/payments") && !canAccess(user, "payment.read") && !canAccess(user, "payment.create")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (pathname.startsWith("/settings/team") && !canAccess(user, "role.assign") && !canAccess(user, "role.read")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (pathname.startsWith("/settings/roles") && !canAccess(user, "role.create") && !canAccess(user, "role.read")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (pathname.startsWith("/settings/billing") && !user.isSuperAdmin && !user.permissions?.includes("*")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
