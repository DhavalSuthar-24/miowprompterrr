import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
