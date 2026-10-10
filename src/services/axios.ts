import axios, { type InternalAxiosRequestConfig } from "axios";
import { store } from "@/app/store";
import { logout, setCredentials } from "@/features/auth/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh Token Rotation & Concurrency Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || "";

      // Do not attempt token refresh on core auth endpoints
      if (
        url.includes("/auth/refresh-token") ||
        url.includes("/auth/verify-otp") ||
        url.includes("/auth/send-otp") ||
        url.includes("/auth/lookup")
      ) {
        store.dispatch(logout());
        return Promise.reject(err);
      }

      // If a refresh is already underway, wait in queue
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          })
          .catch((queueErr) => Promise.reject(queueErr));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authState = store.getState().auth;
        const currentRefreshToken = authState.refreshToken;

        // Call backend refresh rotation endpoint
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          currentRefreshToken ? { refreshToken: currentRefreshToken } : {},
          { withCredentials: true }
        );

        const data = response.data?.data || response.data;
        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken || currentRefreshToken;

        if (!newAccessToken) {
          throw new Error("No access token provided by refresh rotation response");
        }

        const currentUser = data.user || authState.user;
        if (currentUser) {
          store.dispatch(
            setCredentials({
              user: currentUser,
              token: newAccessToken,
              refreshToken: newRefreshToken,
              activePortal: authState.activePortal,
            })
          );
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(logout());
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
