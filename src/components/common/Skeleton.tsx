interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-700/50 ${className || ""}`}
      {...props}
    />
  );
}

export default Skeleton;
