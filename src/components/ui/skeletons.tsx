export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`}></div>
  );
}

export function PromptCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-4">
           <Skeleton className="w-12 h-5" />
           <Skeleton className="w-12 h-5" />
        </div>
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
       <div className="h-32 bg-slate-800 rounded-xl animate-pulse md:h-48 relative">
           <div className="absolute -bottom-10 left-6">
              <Skeleton className="w-24 h-24 rounded-full border-4 border-slate-950" />
           </div>
       </div>
       <div className="mt-14 px-6 space-y-4">
           <Skeleton className="w-48 h-8" />
           <Skeleton className="w-32 h-4" />
           <Skeleton className="w-full max-w-lg h-16" />
       </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="p-4 border-b border-slate-800 flex gap-4">
        <Skeleton className="w-64 h-10" />
        <div className="flex-1"></div>
        <Skeleton className="w-24 h-10" />
      </div>
      <div className="bg-slate-900/30 p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-1/3 h-4" />
              <Skeleton className="w-1/4 h-3" />
            </div>
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-8 h-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
