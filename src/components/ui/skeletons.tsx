import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Base Skeleton component
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/60 dark:bg-gray-700/60",
        className
      )}
      {...props}
    />
  );
}

// Dashboard Skeletons
export function WelcomeBannerSkeleton() {
  return (
    <Card className="bg-gradient-to-r from-gray-200 to-gray-300 border-0 overflow-hidden animate-pulse">
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-4 relative max-w-xs">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-300" />
                <Skeleton className="h-4 w-3/4 bg-gray-300" />
                <Skeleton className="h-4 w-1/2 bg-gray-300" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center ml-6">
            <Skeleton className="w-12 h-12 rounded-full bg-white/30" />
            <Skeleton className="h-3 w-16 mt-2 bg-white/30" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export function QuickActionSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse cursor-pointer">
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
        <Skeleton className="h-4 w-16 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function AchievementBadgeSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
        <Skeleton className="h-4 w-3/4 mx-auto mb-1" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function UpcomingEventSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Pet Related Skeletons
export function PetCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Skeleton className="w-full h-32 sm:w-24 sm:h-24 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
          <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Calendar & Events Skeletons
export function EventCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarDaySkeleton() {
  return (
    <div className="p-2 space-y-1">
      <Skeleton className="h-6 w-8 mx-auto" />
      <div className="space-y-1">
        <Skeleton className="h-1 w-full rounded-full" />
        <Skeleton className="h-1 w-3/4 rounded-full mx-auto" />
      </div>
    </div>
  );
}

// Expenses Skeletons
export function ExpenseItemSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseChartSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-4 w-20" />
              <div className="flex-1">
                <Skeleton 
                  className="h-6 rounded-full" 
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Profile & Settings Skeletons
export function ProfileHeaderSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsItemSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="w-10 h-6 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Medical Records Skeletons
export function MedicalRecordSkeleton() {
  return (
    <Card className="border-0 shadow-sm animate-pulse">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Full Page Loading Skeletons
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <WelcomeBannerSkeleton />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </div>
        
        {/* Stats */}
        <div>
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Achievements */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <AchievementBadgeSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <UpcomingEventSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PetsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        {[...Array(3)].map((_, i) => (
          <PetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CalendarPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Skeleton className="h-8 w-32 mb-6" />
        
        {/* Calendar Grid */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <CalendarDaySkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Events */}
        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}