import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("loading-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Pet Card Skeleton
function PetCardSkeleton() {
  return (
    <div className="overflow-hidden shadow-sm rounded-lg border bg-card">
      <div className="flex flex-col sm:flex-row h-full">
        <Skeleton className="w-full h-32 sm:w-24 sm:h-full" />
        <div className="flex-1 p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Calendar Event Skeleton
function EventCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}

// Expense Item Skeleton
function ExpenseItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-md">
      <div className="flex items-center gap-2 flex-1">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

// Stats Card Skeleton  
function StatsCardSkeleton() {
  return (
    <div className="p-2 sm:p-3 bg-card border rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-4 mb-1 sm:mb-0" />
        <div className="text-left sm:text-right space-y-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  PetCardSkeleton, 
  EventCardSkeleton, 
  ExpenseItemSkeleton,
  StatsCardSkeleton 
}
