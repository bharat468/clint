import { Outlet } from "react-router-dom";

export default function SettingsLayout() {
  return (
    <div className="animate-in fade-in duration-150">
      <Outlet />
    </div>
  );
}
