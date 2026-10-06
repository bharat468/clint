import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true, theme: "light" as "light" | "dark" },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    setTheme: (s, a: PayloadAction<"light" | "dark">) => { s.theme = a.payload; },
  },
});
export const { toggleSidebar, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
