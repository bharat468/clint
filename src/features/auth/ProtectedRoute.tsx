import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();
  return token ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
