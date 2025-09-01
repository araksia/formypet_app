import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { useAnalytics } from "./hooks/useAnalytics";
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

const AppContent = () => {
  console.log("🚀 ForMyPet: AppContent component mounting");
  
  // Initialize analytics
  try {
    console.log("📊 ForMyPet: Initializing analytics");
    useAnalytics();
    console.log("✅ ForMyPet: Analytics initialized successfully");
  } catch (error) {
    console.error("❌ ForMyPet: Analytics initialization failed:", error);
  }
  
  console.log("🌐 ForMyPet: Setting up BrowserRouter");
  
  return (
    <BrowserRouter>
      <AuthProvider>
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
    </BrowserRouter>
  );
};

const App = () => {
  console.log("🎯 ForMyPet: Main App component initializing");
  
  try {
    console.log("⚙️ ForMyPet: Setting up QueryClient and providers");
    
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("💥 ForMyPet: Critical error in App component:", error);
    
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
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 ForMyPet: Unhandled Promise Rejection:', event.reason);
  });
}

export default App;