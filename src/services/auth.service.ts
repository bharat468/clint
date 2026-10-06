import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";
import type { User } from "@/types";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User & { isSuperAdmin?: boolean };
  token: string;
  refreshToken?: string;
  isNewUser?: boolean;
}

export interface SendOtpResponse {
  mobile: string;
  expiresInSeconds: number;
  devOtp?: string;
}

export interface LookupResponse {
  exists: boolean;
  message?: string;
  user?: {
    id: string;
    mobile: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    organizationName?: string | null;
  };
}

export const authService = {
  lookup: (mobile: string) =>
    api
      .post<ApiResponse<LookupResponse>>(ENDPOINTS.AUTH.LOOKUP, { mobile })
      .then((r) => r.data?.data ?? r.data),

  sendOtp: (mobile: string) =>
    api
      .post<ApiResponse<SendOtpResponse>>(ENDPOINTS.AUTH.SEND_OTP, { mobile })
      .then((r) => r.data?.data ?? r.data),

  verifyOtp: (mobile: string, otp: string) =>
    api
      .post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.VERIFY_OTP, { mobile, otp })
      .then((r) => r.data?.data ?? r.data),

  refreshToken: () =>
    api
      .post<ApiResponse<{ accessToken: string; user: User }>>(ENDPOINTS.AUTH.REFRESH_TOKEN)
      .then((r) => r.data?.data ?? r.data),

  me: () =>
    api
      .get<ApiResponse<{ user: User }>>(ENDPOINTS.AUTH.ME)
      .then((r) => (r.data?.data ?? r.data).user),

  logout: () =>
    api
      .post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT)
      .then((r) => r.data?.data ?? r.data),
};
