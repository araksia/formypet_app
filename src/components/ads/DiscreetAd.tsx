import React from 'react';
import GoogleAds from './GoogleAds';

interface DiscreetAdProps {
  className?: string;
}

const DiscreetAd: React.FC<DiscreetAdProps> = ({ className = '' }) => {
  return (
    <div className={`mt-6 mb-3 ${className}`}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-[10px] text-muted-foreground text-center mb-1 opacity-50">
          Διαφήμιση
        </div>
        <div className="bg-muted/20 rounded-md border border-border/30 overflow-hidden">
          {/* Mobile: 320x50 banner */}
          <div className="block md:hidden">
            <GoogleAds 
              slotId="YOUR_MOBILE_AD_SLOT_ID"
              format="auto"
              width={320}
              height={50}
              className="min-h-[50px]"
            />
          </div>
          {/* Desktop: 728x90 banner */}
          <div className="hidden md:block">
            <GoogleAds 
              slotId="YOUR_DESKTOP_AD_SLOT_ID"
              format="auto"
              width={728}
              height={90}
              className="min-h-[90px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscreetAd;