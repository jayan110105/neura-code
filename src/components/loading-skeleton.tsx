import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="mb-1 h-9 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Daily Log Card */}
      <div className="mb-8">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Grid Section */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-8 w-1/4" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </div>
    </div>
  )
} 