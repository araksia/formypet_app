import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeBannerProps {
  userName?: string;
}

export const WelcomeBanner = React.memo<WelcomeBannerProps>(({ userName }) => {
  const displayName = userName?.split('@')[0] || 'φίλε μου';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  return (
    <Card 
      className="bg-gradient-to-r from-primary to-primary/80 border-0 overflow-hidden"
      role="banner"
      aria-label="Καλωσόρισμα με χαρακτήρα σκύλου"
    >
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Speech Bubble */}
            <div 
              className="bg-white rounded-2xl p-4 relative max-w-xs shadow-lg"
              role="img"
              aria-label="Μήνυμα από τον σκύλο Μπάτμαν"
            >
              <p className="text-gray-800 text-sm leading-relaxed">
                "Γεια σου {capitalizedName}! Ευτυχώς που κατέβασες το ForMyPet και δε θα ξεχάσω ξανά να με πας για μπάνιο!"
              </p>
              {/* Speech bubble tail pointing right */}
              <div className="absolute top-4 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-white transform translate-x-full"></div>
            </div>
          </div>
          
          {/* Dog Character */}
          <div className="flex flex-col items-center ml-6">
            <div className="text-5xl mb-2 animate-bounce">🐕‍🦺</div>
            <div className="text-white/90 text-xs text-center font-medium">Μπάτμαν<br />3 ετών</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WelcomeBanner.displayName = 'WelcomeBanner';