import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log("🛡️ ForMyPet: ProtectedRoute component rendering");
  
  const { user, loading } = useAuth();
  
  console.log(`🔍 ForMyPet: ProtectedRoute state - User: ${user?.email || 'none'}, Loading: ${loading}`);

  if (loading) {
    console.log("⏳ ForMyPet: ProtectedRoute showing loading screen");
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
    return <Navigate to="/login" replace />;
  }

  console.log("✅ ForMyPet: User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;