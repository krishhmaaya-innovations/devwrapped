import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 animate-fadeIn">
      {/* Profile header skeleton */}
      <div className="flex items-start gap-4 sm:gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Year + Theme selector skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-14 rounded-md" />
          ))}
        </div>
      </div>

      {/* Heatmap skeleton */}
      <Skeleton className="h-[140px] w-full rounded-xl" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Highlights skeleton */}
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}
