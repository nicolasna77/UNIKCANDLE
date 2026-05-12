import { Skeleton } from "@/components/ui/skeleton";

export default function AffiliatesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-4">
        <Skeleton className="h-4 w-48" />
        <div className="flex justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-px w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-80 w-full rounded-md" />
    </div>
  );
}
