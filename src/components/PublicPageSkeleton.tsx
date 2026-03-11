import { Skeleton } from '@/components/ui/skeleton';

/** Shimmer skeleton for the public portfolio hero section (home page) */
export function HeroSkeleton() {
  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left text */}
          <div className="flex-1 space-y-6">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
          {/* Right circle */}
          <div className="flex-shrink-0">
            <Skeleton className="w-72 h-72 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Shimmer skeleton for a 3-column project/skill card grid */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shimmer skeleton for a vertical list (experience, education) */
export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

/** Shimmer skeleton for the About page bio section */
export function AboutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <Skeleton className="w-72 h-72 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Shimmer skeleton for the Skills page */
export function SkillsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-5 w-64 mx-auto" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
