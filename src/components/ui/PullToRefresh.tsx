import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
  threshold?: number;
  maxDistance?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  threshold = 80,
  maxDistance = 120,
}) => {
  const { 
    isPulling, 
    pullDistance, 
    isRefreshing, 
    canRefresh, 
    handlers 
  } = usePullToRefresh({
    threshold,
    maxDistance,
    onRefresh,
  });

  const getIndicatorOpacity = () => {
    if (isRefreshing || isPulling) {
      return Math.min(pullDistance / (threshold * 0.7), 1);
    }
    return 0;
  };

  const getIndicatorScale = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / threshold, 1);
  };

  return (
    <div 
      className={cn("relative", className)}
      data-scroll
      {...handlers}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          "absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center transition-all duration-300 z-50",
          "bg-background/90 backdrop-blur-sm rounded-full shadow-lg border"
        )}
        style={{
          transform: `translateX(-50%) translateY(${Math.min(pullDistance - 40, 20)}px) scale(${getIndicatorScale()})`,
          opacity: getIndicatorOpacity(),
          width: '60px',
          height: '60px',
        }}
      >
        {isRefreshing ? (
          <RefreshCw 
            className={cn(
              "h-6 w-6 text-primary animate-spin"
            )} 
          />
        ) : canRefresh ? (
          <ArrowDown 
            className={cn(
              "h-6 w-6 text-green-500 transition-transform duration-200",
              "animate-bounce"
            )} 
          />
        ) : (
          <ArrowDown 
            className={cn(
              "h-6 w-6 text-muted-foreground transition-transform duration-200",
              pullDistance > threshold * 0.5 ? "rotate-180" : ""
            )} 
          />
        )}
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-300"
        style={{
          transform: `translateY(${isPulling || isRefreshing ? Math.min(pullDistance * 0.3, 30) : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;