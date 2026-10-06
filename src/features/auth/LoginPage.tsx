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
} from "lucide-react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);

  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE");
  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate("/", { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
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
    </div>
  );
}
