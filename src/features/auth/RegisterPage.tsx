import { Navigate } from "react-router-dom";

export default function RegisterPage() {
  // RENTMATE utilizes unified Mobile + OTP onboarding for instant sign-in and sign-up.
  return <Navigate to="/login" replace />;
}
