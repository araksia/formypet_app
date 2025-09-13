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
      feeding: { label: 'Φαγητό', emoji: '🍽️', color: 'bg-orange-100 border-orange-200' },
      exercise: { label: 'Άσκηση', emoji: '🏃', color: 'bg-blue-100 border-blue-200' },
      medical: { label: 'Υγεία', emoji: '🏥', color: 'bg-purple-100 border-purple-200' },
      general_care: { label: 'Φροντίδα', emoji: '❤️', color: 'bg-pink-100 border-pink-200' }
    };
    return types[type as keyof typeof types] || types.general_care;
  };

  const streakInfo = getStreakInfo(type);

  return (
    <div className={cn(
      'p-4 rounded-xl border-2',
      streakInfo.color,
      className
    )}>
      <div className="flex items-start justify-between">
        {/* Left side - Icon and Label */}
        <div className="flex flex-col items-start gap-2">
          <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center">
            <span className="text-xl">{streakInfo.emoji}</span>
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground">{streakInfo.label}</h4>
            <p className="text-xs text-muted-foreground">Συνεχόμενες μέρες</p>
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="flex items-start gap-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{currentCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Τρέχουσα</p>
          </div>

          {/* Best Streak */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Target className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{bestCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Καλύτερη</p>
          </div>
        </div>
      </div>
    </div>
  );
};