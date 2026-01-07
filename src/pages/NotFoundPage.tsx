import { Link } from "react-router-dom";
import { Ghost, Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-block mb-8 group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500 animate-pulse"></div>
          <Ghost className="w-32 h-32 text-slate-300 relative z-10 animate-float" strokeWidth={1} />
        </div>
        
        <h1 className="text-8xl font-black text-slate-800 mb-2 select-none">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all transform hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Take Me Home
          </Link>
        </div>
      </div>
    </div>
  );
}
