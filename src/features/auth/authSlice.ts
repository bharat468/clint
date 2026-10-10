import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  activePortal: "LANDLORD" | "SUPERADMIN" | null;
}

const KEY = "rentmate_auth";
const empty: AuthState = { user: null, token: null, refreshToken: null, activePortal: null };

const load = (): AuthState => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? "");
    return {
      user: data.user ?? null,
      token: data.token ?? null,
      refreshToken: data.refreshToken ?? null,
      activePortal: data.activePortal ?? null,
    };
  } catch {
    return empty;
  }
};

const persist = (s: AuthState) => {
  try {
    if (s.token) {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          user: s.user,
          token: s.token,
          refreshToken: s.refreshToken,
          activePortal: s.activePortal,
        })
      );
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    /* storage unavailable */
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: load(),
  reducers: {
    setCredentials: (
      s,
      a: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string | null;
        activePortal?: "LANDLORD" | "SUPERADMIN" | null;
      }>
    ) => {
      s.user = a.payload.user;
      s.token = a.payload.token;
      if (a.payload.refreshToken !== undefined) {
        s.refreshToken = a.payload.refreshToken;
      }
      if (a.payload.activePortal !== undefined) {
        s.activePortal = a.payload.activePortal;
      }
      persist(s);
    },
    setActivePortal: (s, a: PayloadAction<"LANDLORD" | "SUPERADMIN">) => {
      s.activePortal = a.payload;
      persist(s);
    },
    logout: (s) => {
      s.user = null;
      s.token = null;
      s.refreshToken = null;
      s.activePortal = null;
      persist(s);
    },
  },
});

export const { setCredentials, setActivePortal, logout } = authSlice.actions;
export default authSlice.reducer;
