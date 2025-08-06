import React from 'react';

const OfflineIndicator = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Walking Paws Animation */}
        <div className="relative mb-8 flex justify-center items-center space-x-4">
          <div className="animate-bounce" style={{ animationDelay: '0s' }}>
            🐾
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            🐾
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
            🐾
          </div>
        </div>
        
        {/* Speech Bubble */}
        <div className="relative bg-white border-2 border-border rounded-2xl p-6 max-w-xs mx-auto shadow-lg">
          <p className="text-foreground font-medium">
            Γεια σου! Δεν υπάρχει σύνδεση στο διαδίκτυο
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