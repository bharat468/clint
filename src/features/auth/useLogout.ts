import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { authService } from "@/services/auth.service";

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Regardless of network failures, ensure local state is cleared
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  return handleLogout;
}
