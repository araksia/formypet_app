import React from 'react';

const OfflineIndicator = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Sleeping Dog Animation */}
        <div className="relative mb-8 flex justify-center items-center">
          <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
            🐕
          </div>
          <div className="absolute -top-2 -right-4 text-2xl animate-pulse">
            💤
          </div>
          <div className="absolute top-0 right-8 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>
            z
          </div>
          <div className="absolute -top-1 right-12 text-sm animate-pulse" style={{ animationDelay: '1s' }}>
            z
          </div>
          <div className="absolute -top-2 right-16 text-xs animate-pulse" style={{ animationDelay: '1.5s' }}>
            z
          </div>
        </div>
        
        {/* Speech Bubble */}
        <div className="relative bg-card border-2 border-border rounded-2xl p-6 max-w-xs mx-auto shadow-lg">
          <p className="text-foreground font-medium">
            Γεια σου! Δεν υπάρχει σύνδεση στο διαδίκτυο
          </p>
          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-card"></div>
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