import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Stethoscope, Trash2 } from 'lucide-react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant: 'calendar' | 'edit' | 'medical' | 'delete';
}

interface SwipeableCardProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  className?: string;
  style?: React.CSSProperties;
  onSwipeReveal?: () => void;
  onSwipeHide?: () => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  actions,
  className,
  style,
  onSwipeReveal,
  onSwipeHide,
}) => {
  const { translateX, isRevealed, handlers } = useSwipeGesture({
    threshold: 60,
    onSwipeLeft: onSwipeReveal,
    onSwipeRight: onSwipeHide,
  });

  const getActionStyles = (variant: SwipeAction['variant']) => {
    switch (variant) {
      case 'calendar':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'edit':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'medical':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'delete':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    action.onClick();
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Action buttons (revealed on swipe) */}
      <div 
        className={cn(
          "absolute right-0 top-0 h-full flex items-center transition-opacity duration-200",
          isRevealed ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          width: '120px',
          transform: `translateX(${120 + translateX}px)`
        }}
      >
        <div className="flex h-full w-full">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={cn(
                "h-full rounded-none flex-1 transition-all duration-200",
                getActionStyles(action.variant)
              )}
              onClick={() => handleActionClick(action)}
              aria-label={action.label}
            >
              <action.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </div>

      {/* Main card content */}
      <Card 
        className={cn(
          "transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing",
          className
        )}
        style={{ 
          transform: `translateX(${translateX}px)`,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          ...style,
        }}
        {...handlers}
      >
        {children}
      </Card>
    </div>
  );
};

export default SwipeableCard;