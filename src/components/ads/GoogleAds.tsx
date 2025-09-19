import React, { useEffect } from 'react';

interface GoogleAdsProps {
  slotId: string;
  width?: number;
  height?: number;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAds: React.FC<GoogleAdsProps> = ({ 
  slotId, 
  width = 320, 
  height = 100, 
  format = 'auto',
  className = ''
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.log('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`flex justify-center py-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: format === 'auto' ? '100%' : width,
          height: format === 'auto' ? 'auto' : height,
        }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAds;