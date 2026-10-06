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
  user: User;
  token: string;
  isNewUser?: boolean;
}

export interface SendOtpResponse {
  mobile: string;
  expiresInSeconds: number;
  devOtp?: string;
}

export const authService = {
  sendOtp: (mobile: string) =>
    api
      .post<ApiResponse<SendOtpResponse>>(ENDPOINTS.AUTH.SEND_OTP, { mobile })
      .then((r) => r.data.data),

  verifyOtp: (mobile: string, otp: string) =>
    api
      .post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.VERIFY_OTP, { mobile, otp })
      .then((r) => r.data.data),

  me: () =>
    api
      .get<ApiResponse<{ user: User }>>(ENDPOINTS.AUTH.ME)
      .then((r) => r.data.data.user),

  logout: () =>
    api
      .post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT)
      .then((r) => r.data),
};
