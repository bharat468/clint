import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

interface AuthState { user: User | null; token: string | null }

const KEY = "rentmate_auth";
const empty: AuthState = { user: null, token: null };

const load = (): AuthState => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "") as AuthState; }
  catch { return empty; }
};
const persist = (s: AuthState) => {
  try {
    if (s.token) localStorage.setItem(KEY, JSON.stringify({ user: s.user, token: s.token }));
    else localStorage.removeItem(KEY);
  } catch { /* storage unavailable */ }
};

const authSlice = createSlice({
  name: "auth",
  initialState: load(),
  reducers: {
    setCredentials: (s, a: PayloadAction<{ user: User; token: string }>) => {
      s.user = a.payload.user;
      s.token = a.payload.token;
      persist(s);
    },
    logout: (s) => {
      s.user = null;
      s.token = null;
      persist(s);
    },
  },
});
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
