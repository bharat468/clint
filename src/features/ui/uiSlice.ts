import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const isDesktop = typeof window !== "undefined" ? window.innerWidth >= 768 : true;

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: isDesktop, theme: "light" as "light" | "dark" },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    closeSidebar: (s) => { s.sidebarOpen = false; },
    setSidebarOpen: (s, a: PayloadAction<boolean>) => { s.sidebarOpen = a.payload; },
    setTheme: (s, a: PayloadAction<"light" | "dark">) => { s.theme = a.payload; },
  },
});
export const { toggleSidebar, closeSidebar, setSidebarOpen, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
