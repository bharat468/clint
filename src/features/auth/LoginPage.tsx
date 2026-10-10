import { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { authService } from "@/services/auth.service";
import { setCredentials } from "./authSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { errMsg } from "@/lib/utils";
import {
  ArrowRight,
  RefreshCw,
  Phone,
  ArrowLeft,
  Building2,
  ShieldCheck,
} from "lucide-react";
import type { User } from "@/types";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE");
  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingSuperAdminAuth, setPendingSuperAdminAuth] = useState<{
    user: User;
    token: string;
    refreshToken?: string;
  } | null>(null);

  // Input refs for 6 OTP boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (user) return <Navigate to="/dashboard" replace />;

  const otpValue = otpDigits.join("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(cleanMobile);
      setStep("OTP");
      setResendCooldown(30);

      // In development/test mode, auto-fill OTP digits if provided by backend API
      if (res.devOtp && res.devOtp.length === 6) {
        setOtpDigits(res.devOtp.split(""));
      } else {
        setOtpDigits(["", "", "", "", "", ""]);
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOtp(mobile.trim(), otpValue);
      const isSuper =
        Boolean(result.user?.isSuperAdmin) ||
        result.user?.adminRole === "SUPER_ADMIN";

      if (isSuper) {
        // Show Workspace Selection Popup Modal for SuperAdmin
        setPendingSuperAdminAuth({
          user: { ...result.user, isSuperAdmin: true },
          token: result.token,
          refreshToken: result.refreshToken,
        });
      } else {
        // Standard users go directly to Landlord & Staff workspace
        dispatch(
          setCredentials({
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken,
            activePortal: "LANDLORD",
          })
        );
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPortal = (portal: "LANDLORD" | "SUPERADMIN") => {
    if (!pendingSuperAdminAuth) return;
    dispatch(
      setCredentials({
        user: pendingSuperAdminAuth.user,
        token: pendingSuperAdminAuth.token,
        refreshToken: pendingSuperAdminAuth.refreshToken,
        activePortal: portal,
      })
    );
    if (portal === "SUPERADMIN") {
      navigate("/superadmin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await authService.sendOtp(mobile.trim());
      setResendCooldown(30);
      if (res.devOtp && res.devOtp.length === 6) {
        setOtpDigits(res.devOtp.split(""));
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // Auto-focus first empty OTP box when entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        const firstEmptyIndex = otpDigits.findIndex((d) => !d);
        const targetIndex = firstEmptyIndex === -1 ? 5 : firstEmptyIndex;
        inputRefs.current[targetIndex]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle individual OTP box change
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    // Auto-advance to next box if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP box keyboard navigation (Backspace, Left/Right arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = "";
        setOtpDigits(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event across all 6 boxes
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtpDigits(newOtp);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* ============================================================ */}
      {/* LEFT SIDE: PROMINENT BIG LOGO & VALUE PROPOSITION            */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 xl:p-16 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 border-r border-slate-200 select-none">
        <div className="max-w-lg flex flex-col items-center text-center">
          {/* Big, Crisp, High-Resolution Brand Logo */}
          <img
            src="/RentMate%20Smart%20Rentals%20Logo.png"
            alt="RentMate - Smarter Rentals. Happier Living."
            className="h-44 lg:h-48 xl:h-56 w-auto max-w-[480px] xl:max-w-[540px] object-contain drop-shadow-sm mb-8 transition-transform hover:scale-[1.02] duration-300"
          />

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-snug">
            Property & Rental Management Platform
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-md">
            Streamline rent collections, tenant tracking, and property maintenance in one centralized workspace.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: CLEAN, PROFESSIONAL SIGN-IN CARD                */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile / Tablet Logo (Prominent) */}
          <div className="text-center mb-8 lg:hidden">
            <img
              src="/RentMate%20Smart%20Rentals%20Logo.png"
              alt="RentMate Logo"
              className="h-24 sm:h-28 md:h-32 w-auto max-w-[340px] sm:max-w-[380px] mx-auto object-contain drop-shadow-xs mb-4"
            />
          </div>

          {/* Form Card */}
          <Card className="p-8 sm:p-9 shadow-sm border border-slate-200/90 rounded-2xl bg-white">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign In
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {step === "MOBILE"
                  ? "Enter your mobile number to receive a verification code"
                  : `Enter the 6-digit code sent to +91 ${mobile}`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200 animate-in fade-in">
                {error}
              </div>
            )}

            {step === "MOBILE" ? (
              /* Step 1: Mobile Form */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="mobile" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative flex rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 transition-all bg-white overflow-hidden">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 border-r border-slate-200 text-sm font-semibold text-slate-700 select-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>+91</span>
                    </div>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setMobile(val);
                        if (error) setError(null);
                      }}
                      className="h-12 w-full px-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none"
                      autoFocus
                      required
                    />
                    {mobile.length > 0 && (
                      <div className="flex items-center pr-3.5 text-xs font-semibold text-slate-400">
                        {mobile.length}/10
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="w-full h-12 text-sm font-semibold gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with OTP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Step 2: 6 Separate OTP Input Boxes */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-3 text-center">
                    Enter Verification Code
                  </label>

                  {/* 6 Individual OTP Boxes */}
                  <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`h-12 w-11 sm:w-12 text-center text-xl font-bold rounded-xl border transition-all outline-none ${digit
                            ? "border-blue-600 bg-blue-50/30 text-blue-900 ring-2 ring-blue-500/10"
                            : "border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otpValue.length !== 6}
                  className="w-full h-12 text-sm font-semibold gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Sign In</span>
                  )}
                </Button>

                {/* Sub Action Links */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("MOBILE");
                      setOtpDigits(["", "", "", "", "", ""]);
                      setError(null);
                    }}
                    className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change number</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || resendCooldown > 0}
                    className={`font-semibold transition-colors flex items-center gap-1 ${resendCooldown > 0
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-800"
                      }`}
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend OTP"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* WORKSPACE SELECTION MODAL                                    */}
      {/* ============================================================ */}
      {pendingSuperAdminAuth && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-lg w-full bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <img
                src="/RentMate%20Smart%20Rentals%20Logo.png"
                alt="RentMate Logo"
                className="h-12 w-auto mx-auto object-contain mb-3"
              />
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Select Workspace
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your account has access to multiple workspace environments. Choose which dashboard to open:
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Normal Landlord Dashboard */}
              <button
                type="button"
                onClick={() => handleSelectPortal("LANDLORD")}
                className="group w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-left transition-all duration-150 shadow-2xs bg-white"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      Property & Rental Workspace
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-800">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Manage properties, tenant leases, and track monthly rental collections.
                  </p>
                </div>
              </button>

              {/* Option 2: SuperAdmin Platform Executive Portal */}
              <button
                type="button"
                onClick={() => handleSelectPortal("SUPERADMIN")}
                className="group w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-left transition-all duration-150 shadow-2xs bg-white"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      SuperAdmin Console
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Platform Master
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Manage SaaS plans, client organizations, platform RBAC, and system controls.
                  </p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
