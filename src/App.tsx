
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
            <Route path="*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/pets" element={<PetsPage />} />
                    <Route path="/add-pet" element={<AddPetPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/add-event" element={<AddEventPage />} />
                    <Route path="/pet/:petId" element={<PetProfilePage />} />
                    <Route path="/pet/:petId/medical" element={<MedicalRecordsPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/add-expense" element={<AddExpensePage />} />
                    <Route path="/add-family-member" element={<AddFamilyMemberPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
