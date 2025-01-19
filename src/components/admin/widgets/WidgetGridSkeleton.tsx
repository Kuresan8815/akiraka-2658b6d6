import { Skeleton } from "@/components/ui/skeleton";

export const WidgetGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32">
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  );
};