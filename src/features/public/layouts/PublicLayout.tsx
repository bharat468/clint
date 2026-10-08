import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Navbar */}
      <PublicNavbar />

      {/* Main Public Content Area */}
      <main className="flex-1 pt-18">
        <Outlet />
      </main>

      {/* Global Public Footer */}
      <PublicFooter />
    </div>
  );
}
