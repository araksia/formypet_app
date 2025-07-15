
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PetsPage from "./pages/PetsPage";
import AddPetPage from "./pages/AddPetPage";
import CalendarPage from "./pages/CalendarPage";
import AddEventPage from "./pages/AddEventPage";
import PetProfilePage from "./pages/PetProfilePage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import ExpensesPage from "./pages/ExpensesPage";
import AddExpensePage from "./pages/AddExpensePage";
import AddFamilyMemberPage from "./pages/AddFamilyMemberPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
