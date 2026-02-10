import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import DependentLayout from "./layouts/DependentLayout";
import Dashboard from "./pages/admin/Dashboard";
import Caregivers from "./pages/admin/Caregivers";
import Dependents from "./pages/admin/Dependents";
import DependentHome from "./pages/dependent/Home";
import DependentActivities from "./pages/dependent/Activities";
import DependentMedications from "./pages/dependent/Medications";
import CaregiverMedications from "./pages/caregiver/Medications";
import CaregiverActivities from "./pages/caregiver/Activities";
import CaregiverAlerts from "./pages/caregiver/Alerts";

// AJOUT : Import du nouveau composant d'état de santé
import CaregiverHealth from "./pages/caregiver/health_status"; 

import CaregiverLayout from "./layouts/CaregiverLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Routes Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="caregivers" element={<Caregivers />} />
              <Route path="dependents" element={<Dependents />} />
            </Route>

            {/* Routes Personne Surveillée */}
            <Route path="/dependent" element={<DependentLayout />}>
              <Route index element={<DependentHome />} />
              <Route path="activities" element={<DependentActivities />} />
              <Route path="medications" element={<DependentMedications />} />
            </Route>
            
            {/* Routes Aidant (Caregiver) */}
            <Route path="/caregiver" element={<CaregiverLayout />}>
              <Route index element={<CaregiverMedications />} />
              <Route path="activities" element={<CaregiverActivities />} />
              
              {/* AJOUT : Route pour l'état de santé */}
              <Route path="health" element={<CaregiverHealth />} />
              
              <Route path="alerts" element={<CaregiverAlerts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;