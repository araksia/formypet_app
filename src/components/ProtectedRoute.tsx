import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { remoteLogger } from '@/utils/remoteLogger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log("🛡️ ForMyPet: ProtectedRoute component rendering");
  remoteLogger.info("ProtectedRoute component rendering", "ProtectedRoute");
  
  const { user, loading } = useAuth();
  
  console.log(`🔍 ForMyPet: ProtectedRoute state - User: ${user?.email || 'none'}, Loading: ${loading}`);
  remoteLogger.info(`ProtectedRoute state - User: ${user?.email || 'none'}, Loading: ${loading}`, "ProtectedRoute");

  if (loading) {
    console.log("⏳ ForMyPet: ProtectedRoute showing loading screen");
    remoteLogger.info("ProtectedRoute showing loading screen", "ProtectedRoute");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🐾</div>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-32 mx-auto" />
            <div className="h-3 bg-muted animate-pulse rounded w-24 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("🚫 ForMyPet: No user found, redirecting to login");
    remoteLogger.warn("No user found, redirecting to login", "ProtectedRoute");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ ForMyPet: User authenticated, rendering protected content");
  remoteLogger.info("User authenticated, rendering protected content", "ProtectedRoute");
  return <>{children}</>;
};

export default ProtectedRoute;