import React from 'react';
import { Flame, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StreakProps {
  type: string;
  currentCount: number;
  bestCount: number;
  isActive: boolean;
  className?: string;
}

export const StreakDisplay: React.FC<StreakProps> = ({
  type,
  currentCount,
  bestCount,
  isActive,
  className
}) => {
  const getStreakInfo = (type: string) => {
    const types = {
      feeding: { label: 'Φαγητό', emoji: '🍽️', color: 'text-orange-500' },
      exercise: { label: 'Άσκηση', emoji: '🏃', color: 'text-blue-500' },
      medical: { label: 'Υγεία', emoji: '🏥', color: 'text-red-500' },
      general_care: { label: 'Φροντίδα', emoji: '❤️', color: 'text-pink-500' }
    };
    return types[type as keyof typeof types] || types.general_care;
  };

  const streakInfo = getStreakInfo(type);

  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-lg border',
      isActive ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : 'bg-muted/50 border-muted',
      className
    )}>
      <div className="flex items-center space-x-3">
        {/* Type Icon and Label */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{streakInfo.emoji}</span>
          <div>
            <div className="font-medium text-sm">{streakInfo.label}</div>
            <div className="text-xs text-muted-foreground">Συνεχόμενες μέρες</div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="flex items-center space-x-1">
            <Flame className={cn(
              'h-4 w-4',
              isActive ? 'text-orange-500' : 'text-gray-400'
            )} />
            <span className={cn(
              'font-bold text-lg',
              isActive ? 'text-orange-600' : 'text-gray-500'
            )}>
              {currentCount}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Τρέχουσα</div>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-lg text-yellow-600">
              {bestCount}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Καλύτερη</div>
        </div>

        {/* Status Badge */}
        {isActive && currentCount > 0 && (
          <Badge variant={currentCount >= 7 ? 'default' : 'secondary'} className="text-xs">
            {currentCount >= 7 ? '🔥 Στα κάρβουνα!' : '💪 Συνεχίζεις!'}
          </Badge>
        )}
      </div>
    </div>
  );
};