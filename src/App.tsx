import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { useAnalytics } from "./hooks/useAnalytics";
import { remoteLogger } from "./utils/remoteLogger";
import { useEffect } from 'react';
import Dashboard from "./pages/Dashboard";
import PetsPage from "./pages/PetsPage";
import AddPetPage from "./pages/AddPetPage";
import CalendarPage from "./pages/CalendarPage";
import AddEventPage from "./pages/AddEventPage";
import PetProfilePage from "./pages/PetProfilePage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import ExpensesPage from "./pages/ExpensesPage";
import AddExpensePage from "./pages/AddExpensePage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import AddFamilyMemberPage from "./pages/AddFamilyMemberPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AchievementsPage from "./pages/AchievementsPage";
import LoginPage from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import ScreenshotsPage from "./pages/ScreenshotsPage";

const queryClient = new QueryClient();

// Deep Link Handler Component
const DeepLinkHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const initializeDeepLinks = async () => {
      try {
        // Check if we're on native platform and capacitor modules are available
        const { Capacitor } = await import('@capacitor/core');
        
        if (!Capacitor.isNativePlatform()) {
          console.log('🔗 Not on native platform, skipping deep link setup');
          return;
        }
        
        const { App: CapacitorApp } = await import('@capacitor/app');
        
        const handleDeepLink = async (urlObj: { url: string }) => {
          console.log('🔗 Deep link received:', urlObj.url);
          
          try {
            const url = new URL(urlObj.url);
            const path = url.pathname;
            const params = url.searchParams;
            
            if (path === '/accept-invitation') {
              const token = params.get('token');
              if (token) {
                console.log('🔗 Navigating to accept invitation with token:', token);
                navigate(`/accept-invitation?token=${token}`);
              }
            }
          } catch (error) {
            console.error('🔗 Error handling deep link:', error);
          }
        };
        
        // Listen for app URL events
        await CapacitorApp.addListener('appUrlOpen', handleDeepLink);
        
        cleanup = () => {
          CapacitorApp.removeAllListeners();
        };
      } catch (error) {
        console.log('🔗 Capacitor modules not available, skipping deep link setup:', error);
      }
    };
    
    initializeDeepLinks();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [navigate]);
  
  return null; // This component doesn't render anything
};

// Analytics Wrapper Component
const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  console.log("📊 ForMyPet: Initializing analytics");
  remoteLogger.info("Initializing analytics", "App");
  
  useAnalytics(); // This is now called properly within a component
  
  console.log("✅ ForMyPet: Analytics initialized successfully");
  remoteLogger.info("Analytics initialized successfully", "App");
  
  return <>{children}</>;
};

const AppRoutes = () => {
  console.log("🚀 ForMyPet: AppRoutes component mounting");
  remoteLogger.info("AppRoutes component mounting", "App");
  
  return (
    <AuthProvider>
      <DeepLinkHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/screenshots" element={<ScreenshotsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/pets" element={
          <ProtectedRoute>
            <Layout>
              <PetsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/add-pet" element={
          <ProtectedRoute>
            <AddPetPage />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <CalendarPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/add-event" element={
          <ProtectedRoute>
            <AddEventPage />
          </ProtectedRoute>
        } />
        <Route path="/pet/:petId" element={
          <ProtectedRoute>
            <Layout>
              <PetProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/pet/:petId/medical" element={
          <ProtectedRoute>
            <Layout>
              <MedicalRecordsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute>
            <Layout>
              <ExpensesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <Layout>
              <AchievementsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/add-expense" element={
          <ProtectedRoute>
            <AddExpensePage />
          </ProtectedRoute>
        } />
        <Route path="/add-family-member" element={
          <ProtectedRoute>
            <AddFamilyMemberPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

const App = () => {
  console.log("🎯 ForMyPet: Main App component initializing");
  remoteLogger.info("Main App component initializing", "App");
  
  try {
    console.log("⚙️ ForMyPet: Setting up QueryClient and providers");
    remoteLogger.info("Setting up QueryClient and providers", "App");
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsWrapper>
              <AppRoutes />
            </AnalyticsWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("💥 ForMyPet: Critical error in App component:", error);
    remoteLogger.error("Critical error in App component", "App", { error: error?.toString() });
    
    // Fallback error UI for iOS debugging
    return (
      <div style={{ 
        backgroundColor: 'red', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '18px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1>ForMyPet Error</h1>
        <p>Critical error occurred: {error?.message || 'Unknown error'}</p>
        <p>Check Safari Console for details</p>
      </div>
    );
  }
};

// Add global error handler for iOS debugging
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('🚨 ForMyPet: Global Error:', event.error);
    console.error('🚨 ForMyPet: Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
    
    // Send to remote logging
    remoteLogger.error('Global Error', "GlobalErrorHandler", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.toString()
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 ForMyPet: Unhandled Promise Rejection:', event.reason);
    
    // Send to remote logging
    remoteLogger.error('Unhandled Promise Rejection', "GlobalErrorHandler", {
      reason: event.reason?.toString()
    });
  });
}

export default App;