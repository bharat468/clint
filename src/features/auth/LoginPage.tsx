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
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Copy,
  X,
  AlertCircle,
  Building2,
} from "lucide-react";
import type { User } from "@/types";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);

  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE");
  const [mobile, setMobile] = useState("");
  const [lookupUser, setLookupUser] = useState<{
    name?: string | null;
    role?: string;
    organizationName?: string | null;
    isSuperAdmin?: boolean;
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSuperAdminAuth, setPendingSuperAdminAuth] = useState<{
    user: User;
    token: string;
  } | null>(null);

  // Live lookup when 10 digits entered
  useEffect(() => {
    const clean = mobile.trim();
    if (/^\d{10}$/.test(clean)) {
      setIsLookingUp(true);
      authService
        .lookup(clean)
        .then((res) => {
          if (res?.exists && res?.user) {
            setLookupUser(res.user);
          } else {
            setLookupUser(null);
          }
        })
        .catch(() => setLookupUser(null))
        .finally(() => setIsLookingUp(false));
    } else {
      setLookupUser(null);
    }
  }, [mobile]);

  // Dev Toast Notification state
  const [toastOtp, setToastOtp] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Input refs for 6 OTP boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (token) return <Navigate to="/" replace />;

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
      setOtpDigits(["", "", "", "", "", ""]);

      // Show toast if devOtp is returned by API
      if (res.devOtp) {
        setToastOtp(res.devOtp);
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
        ["8003953815", "9876543210"].includes(result.user?.mobile || "");

      if (isSuper) {
        // Show Workspace Selection Popup Modal for SuperAdmin
        setPendingSuperAdminAuth({
          user: { ...result.user, isSuperAdmin: true },
          token: result.token,
        });
      } else {
        // Standard users go directly to Landlord & Staff workspace
        dispatch(
          setCredentials({
            user: result.user,
            token: result.token,
            activePortal: "LANDLORD",
          })
        );
        navigate("/", { replace: true });
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
        activePortal: portal,
      })
    );
    if (portal === "SUPERADMIN") {
      navigate("/superadmin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.sendOtp(mobile.trim());
      if (res.devOtp) {
        setToastOtp(res.devOtp);
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // Auto-focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
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

    // Focus last filled index
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Auto-fill from Toast
  const handleAutofillToast = () => {
    if (!toastOtp) return;
    const digits = toastOtp.slice(0, 6).split("");
    setOtpDigits(digits);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans overflow-hidden relative">
      {/* ============================================================ */}
      {/* FLOATING DEV TOAST NOTIFICATION                              */}
      {/* ============================================================ */}
      {toastOtp && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl border border-blue-200 bg-white p-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dev OTP Ready</h4>
                  <p className="text-[11px] text-slate-500">Verification code generated</p>
                </div>
              </div>
              <button
                onClick={() => setToastOtp(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-blue-50/70 px-3 py-1.5 border border-blue-100">
              <span className="font-mono text-base font-extrabold tracking-widest text-blue-800">
                {toastOtp}
              </span>
              <button
                type="button"
                onClick={handleAutofillToast}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
              >
                {copiedToast ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Auto-filled!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Auto-fill OTP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LEFT SIDE: SIMPLE FULL BIG LOGO & 1-2 LINES (NO SCROLL)      */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/40 border-r border-slate-200/80 text-center select-none">
        <div className="max-w-md flex flex-col items-center">
          {/* Full Big Logo */}
          <img
            src="/RentMate%20Smart%20Rentals%20Logo.png"
            alt="RentMate Smart Rentals Logo"
            className="h-28 xl:h-32 w-auto max-w-[320px] object-contain drop-shadow-xs mb-6 transition-transform hover:scale-105 duration-300"
          />

          {/* Simple 1-2 Line Title & Subtitle */}
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            Smart Property & Rental Management
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm">
            Simplify rent collections, manage tenants, and track occupancies effortlessly in real-time.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Fast, secure & transparent platform</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: CLEAN COMPACT FORM (NO SCROLL, 100% RESPONSIVE)  */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16 overflow-y-auto lg:overflow-hidden">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo on Normal / Mobile screens */}
          <div className="text-center mb-6 lg:hidden">
            <img
              src="/RentMate%20Smart%20Rentals%20Logo.png"
              alt="RentMate Smart Rentals Logo"
              className="h-14 w-auto mx-auto object-contain drop-shadow-xs mb-2"
            />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Welcome to RentMate
            </h2>
            <p className="text-xs text-slate-500">
              {step === "MOBILE"
                ? "Enter your mobile number to sign in"
                : `Enter the code sent to +91 ${mobile}`}
            </p>
          </div>

          {/* Heading on Large Screens */}
          <div className="hidden lg:block mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign In
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {step === "MOBILE"
                ? "Enter your mobile number to receive an OTP"
                : `Enter verification code sent to +91 ${mobile}`}
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-6 sm:p-7 shadow-xs border-slate-200/90 rounded-2xl bg-white">
            {/* Dev Mode Notification Alert */}
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50/70 p-2.5 text-xs text-blue-900 border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] leading-snug">
                <strong>Dev Mode:</strong> OTP auto-generates via backend API & Toast.
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200 animate-in fade-in">
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
                  <div className="relative flex rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all bg-white overflow-hidden">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 border-r border-slate-200 text-xs font-semibold text-slate-600 select-none">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>+91</span>
                    </div>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="h-11 w-full px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                      autoFocus
                      required
                    />
                    {mobile.length > 0 && (
                      <div className="flex items-center pr-3 text-[11px] font-semibold text-slate-400">
                        {mobile.length}/10
                      </div>
                    )}
                  </div>

                  {/* Dynamic User Lookup Banner */}
                  {lookupUser && (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5 animate-in fade-in">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0 font-bold text-xs">
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 truncate">
                            Welcome, {lookupUser.name || "Member"}!
                          </p>
                          {(lookupUser as any).isSuperAdmin && (
                            <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 shrink-0">
                              SuperAdmin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-700 truncate">
                          {lookupUser.role || "Staff"}{" "}
                          {lookupUser.organizationName ? `at ${lookupUser.organizationName}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {mobile.length === 10 && !isLookingUp && !lookupUser && (
                    <div className="mt-3 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-amber-950">Number Not Registered</p>
                        <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                          Only pre-registered owners and staff invited by an administrator can log in.
                        </p>
                      </div>
                    </div>
                  )}

                  {isLookingUp && (
                    <p className="mt-2 text-[11px] text-slate-400 animate-pulse">
                      Checking profile records...
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="w-full h-11 text-sm font-semibold gap-2 mt-2 bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending OTP...</span>
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
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                    Enter 6-Digit Code
                  </label>

                  {/* 6 Individual OTP Boxes */}
                  <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
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
                        className={`h-11 sm:h-12 w-10 sm:w-11 text-center text-lg sm:text-xl font-bold rounded-xl border transition-all outline-none ${
                          digit
                            ? "border-blue-600 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/10"
                            : "border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otpValue.length !== 6}
                  className="w-full h-11 text-sm font-semibold gap-2 mt-1 bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20"
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
                    className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change number</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Passwordless login secured by RentMate</span>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DUAL-DASHBOARD WORKSPACE SELECTION POPUP MODAL               */}
      {/* ============================================================ */}
      {pendingSuperAdminAuth && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-lg w-full bg-white border border-slate-200 p-6 sm:p-7 rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Choose Workspace Dashboard
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mobile <span className="font-semibold text-slate-800 font-mono">+91 {pendingSuperAdminAuth.user.mobile}</span> has Platform SuperAdmin authorization. Please select which dashboard you want to enter:
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Normal Landlord Dashboard */}
              <button
                type="button"
                onClick={() => handleSelectPortal("LANDLORD")}
                className="group w-full flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all duration-150 shadow-2xs"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      Normal Landlord / User Dashboard
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-800">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Manage rental properties, tenant leases, and track monthly payments according to your assigned organization role.
                  </p>
                </div>
              </button>

              {/* Option 2: SuperAdmin Platform Executive Portal */}
              <button
                type="button"
                onClick={() => handleSelectPortal("SUPERADMIN")}
                className="group w-full flex items-start gap-3.5 p-4 rounded-xl border border-blue-200/90 bg-blue-50/25 hover:border-blue-600 hover:bg-blue-50/70 text-left transition-all duration-150 shadow-2xs"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      SuperAdmin Executive Portal
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Platform Master
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Access platform vitals, dynamic SaaS pricing engines, client subscription expiry management, and platform RBAC.
                  </p>
                  <p className="text-[11px] font-medium text-amber-700 mt-1.5 flex items-center gap-1">
                    <span>* SuperAdmin portal me jaane ke baad vapis aane ke liye logout karna hoga.</span>
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
