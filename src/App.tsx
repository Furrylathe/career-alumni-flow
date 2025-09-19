import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { JobProvider } from "./contexts/JobContext";
import Index from "./pages/Index";
import UserLogin from "./pages/UserLogin";
import AlumniLogin from "./pages/AlumniLogin";
import UserDashboard from "./pages/UserDashboard";
import AlumniVerification from "./pages/AlumniVerification";
import AlumniDashboard from "./pages/AlumniDashboard";
import JobOpenings from "./pages/JobOpenings";
import JobDetail from "./pages/JobDetail";
import FeedbackPage from "./pages/FeedbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <JobProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/alumni-login" element={<AlumniLogin />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/alumni-verification" element={<AlumniVerification />} />
            <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
            
            <Route path="/job-openings" element={<JobOpenings />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/feedback/:jobId" element={<FeedbackPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </JobProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
