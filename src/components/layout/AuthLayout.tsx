import { Outlet, Link } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-4xl">🐱</span>
          <span className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MiowNation
          </span>
        </Link>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 MiowNation. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
