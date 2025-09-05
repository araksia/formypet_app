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
import DebugPushPage from "./pages/DebugPushPage";

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

const App = () => {
  console.log("🎯 ForMyPet: Main App component initializing");
  remoteLogger.info("Main App component initializing", "App");
  
  useAnalytics(); // Initialize analytics here properly
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                  <Layout>
                    <AddPetPage />
                  </Layout>
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
                  <Layout>
                    <AddEventPage />
                  </Layout>
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
              <Route path="/debug-push" element={
                <ProtectedRoute>
                  <Layout>
                    <DebugPushPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/add-expense" element={
                <ProtectedRoute>
                  <Layout>
                    <AddExpensePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/add-family-member" element={
                <ProtectedRoute>
                  <Layout>
                    <AddFamilyMemberPage />
                  </Layout>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
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