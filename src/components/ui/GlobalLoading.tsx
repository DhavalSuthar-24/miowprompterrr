import { useUIStore } from "../../stores/uiStore";
import { Sparkles } from "lucide-react";

export function GlobalLoading() {
  const isLoading = useUIStore((state) => state.globalLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative p-4 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl animate-bounce">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-white tracking-wide">
             Loading...
          </p>
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
