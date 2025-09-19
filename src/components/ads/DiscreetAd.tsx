import React from 'react';
import GoogleAds from './GoogleAds';

interface DiscreetAdProps {
  className?: string;
}

const DiscreetAd: React.FC<DiscreetAdProps> = ({ className = '' }) => {
  return (
    <div className={`mt-6 mb-3 ${className}`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-[10px] text-muted-foreground text-center mb-1 opacity-50">
          Διαφήμιση
        </div>
        <div className="bg-muted/20 rounded-md border border-border/30 overflow-hidden">
          <GoogleAds 
            slotId="YOUR_AD_SLOT_ID"
            format="horizontal"
            width={728}
            height={90}
            className="min-h-[90px]"
          />
        </div>
      </div>
    </div>
  );
};

export default DiscreetAd;