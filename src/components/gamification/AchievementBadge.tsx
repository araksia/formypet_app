import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  isCompleted: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  color,
  isCompleted,
  progress,
  size = 'md',
  className
}) => {
  // Safely get the icon component
  const IconComponent = (Icons as any)[icon] as LucideIcon || Icons.Star;

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3 sm:p-4',
    lg: 'p-4 sm:p-6'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6 sm:h-8 sm:w-8',
    lg: 'h-8 w-8 sm:h-10 sm:w-10'
  };

  const getColorClasses = (color: string, completed: boolean) => {
    const baseColors = {
      primary: completed ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-muted-foreground/20 text-muted-foreground',
      secondary: completed ? 'bg-secondary/10 border-secondary text-secondary-foreground' : 'bg-muted border-muted-foreground/20 text-muted-foreground',
      success: completed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-muted border-muted-foreground/20 text-muted-foreground',
      warning: completed ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-muted border-muted-foreground/20 text-muted-foreground',
      danger: completed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-muted border-muted-foreground/20 text-muted-foreground',
      info: completed ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-muted border-muted-foreground/20 text-muted-foreground'
    };
    return baseColors[color as keyof typeof baseColors] || baseColors.primary;
  };

  return (
    <div className={cn(
      'relative rounded-lg border-2 transition-all duration-200',
      sizeClasses[size],
      getColorClasses(color, isCompleted),
      isCompleted ? 'shadow-sm scale-105' : 'opacity-60 hover:opacity-80',
      className
    )}>
      {/* Achievement Icon */}
      <div className="flex flex-col items-center space-y-2">
        <div className={cn(
          'rounded-full p-2 flex items-center justify-center',
          isCompleted ? 'bg-white/50' : 'bg-white/20'
        )}>
          <IconComponent className={iconSizes[size]} />
        </div>
        
        {/* Title and Description */}
        <div className="text-center">
          <h4 className="font-semibold text-xs sm:text-sm leading-tight">
            {title}
          </h4>
          <p className="text-[10px] sm:text-xs opacity-80 mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Progress Bar (if not completed and has progress) */}
        {!isCompleted && progress !== undefined && (
          <div className="w-full">
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div 
                className="bg-current h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-center mt-1 opacity-75">
              {progress}%
            </div>
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <Badge variant="default" className="text-[10px] sm:text-xs px-2 py-1">
            ✨ Ολοκληρωμένο
          </Badge>
        )}
      </div>

      {/* Shine effect for completed achievements */}
      {isCompleted && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </div>
  );
};