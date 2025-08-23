import React from 'react';
import { Heart, Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HappinessMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const HappinessMeter: React.FC<HappinessMeterProps> = ({ 
  score, 
  size = 'md', 
  showLabel = true,
  className 
}) => {
  const getHappinessLevel = (score: number) => {
    if (score >= 80) return { icon: Smile, color: 'text-green-500', bg: 'bg-green-100', label: 'Πολύ Χαρούμενο', emoji: '😄' };
    if (score >= 60) return { icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Χαρούμενο', emoji: '😊' };
    if (score >= 40) return { icon: Meh, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Μέτριο', emoji: '😐' };
    return { icon: Frown, color: 'text-red-500', bg: 'bg-red-100', label: 'Λυπημένο', emoji: '😢' };
  };

  const happiness = getHappinessLevel(score);
  const Icon = happiness.icon;

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <div className={cn(
        'relative rounded-full border-4 border-gray-200 flex items-center justify-center',
        sizeClasses[size],
        happiness.bg
      )}>
        {/* Background circle for progress */}
        <div 
          className="absolute inset-1 rounded-full bg-gradient-to-t from-gray-300 to-gray-100"
          style={{
            background: `conic-gradient(${happiness.color.replace('text-', '')} ${score * 3.6}deg, #e5e7eb 0deg)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-2xl mb-1">{happiness.emoji}</div>
          <div className={cn('font-bold', happiness.color)}>
            {Math.round(score)}%
          </div>
        </div>
      </div>
      
      {showLabel && (
        <div className="text-center">
          <div className={cn('font-medium text-sm', happiness.color)}>
            {happiness.label}
          </div>
          <div className="text-xs text-muted-foreground">
            Επίπεδο Ευτυχίας
          </div>
        </div>
      )}
    </div>
  );
};