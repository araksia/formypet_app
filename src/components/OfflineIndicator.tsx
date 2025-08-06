import React from 'react';

const OfflineIndicator = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Sleeping Dog */}
        <div className="relative mb-8">
          <div className="text-8xl mb-4">🐕</div>
          <div className="absolute -top-4 -right-4">
            {/* ZZZ animation */}
            <div className="animate-pulse">
              <span className="text-2xl opacity-70">💤</span>
            </div>
          </div>
        </div>
        
        {/* Speech Bubble */}
        <div className="relative bg-white border-2 border-border rounded-2xl p-6 max-w-xs mx-auto shadow-lg">
          <p className="text-foreground font-medium">
            Δεν υπάρχει σύνδεση στο διαδίκτυο
          </p>
          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white"></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-border absolute -top-[10px] left-0"></div>
          </div>
        </div>
        
        <p className="text-muted-foreground mt-6 text-sm">
          Παρακαλώ ελέγξτε τη σύνδεσή σας
        </p>
      </div>
    </div>
  );
};

export default OfflineIndicator;