import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout, setCredentials } from "@/features/auth/authSlice";
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
          // If profile check fails (e.g. user was deleted in database), immediately evict
          dispatch(logout());
        });
    }
  }, [dispatch, token]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");
  const hasAdminPrivileges = Boolean(user.isSuperAdmin || user.adminRole);

  // 1. Strict Isolation: Landlords and Tenants cannot access the SuperAdmin console
  if (isSuperAdminRoute && !hasAdminPrivileges) {
    return <Navigate to={user.role?.toUpperCase() === "TENANT" ? "/tenant/my-rentals" : "/dashboard"} replace />;
  }

  // 2. Strict Isolation: SuperAdministrators belong exclusively to the SuperAdmin console
  if (!isSuperAdminRoute && hasAdminPrivileges) {
    return <Navigate to="/superadmin" replace />;
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
  if (pathname.startsWith("/settings/billing")) {
    return <Navigate to="/settings/organization" replace />;
  }

  return <Outlet />;
}
