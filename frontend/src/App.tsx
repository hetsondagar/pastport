import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import GlobalBackground from "./components/GlobalBackground";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateCapsule from "./pages/CreateCapsule";
import Profile from "./pages/Profile";
import DailyJournal from "./pages/DailyJournal";
import MemoryConstellationPage from "./pages/MemoryConstellationPage";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import TimeChat from "./pages/TimeChat";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/journal" element={<DailyJournal />} />
      <Route path="/memories/constellation" element={<MemoryConstellationPage />} />
      <Route path="/create" element={<CreateCapsule />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/time-chat" element={<TimeChat />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Conditional footer component that excludes constellation page
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Don't render footer on constellation page
  if (location.pathname === '/memories/constellation') {
    return null;
  }
  
  return <Footer />;
};

const FloatingCreateButton = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated || location.pathname === "/create") {
    return null;
  }

  return (
    <Link
      to="/create"
      className="fixed bottom-6 right-6 z-50 btn-glow rounded-full h-12 px-4 flex items-center gap-2 text-primary-foreground shadow-lg hover:scale-[1.02] transition-transform"
      aria-label="Create time capsule"
      title="Create"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create</span>
    </Link>
  );
};

const AppShell = () => {
  return (
    <div className="min-h-screen bg-black relative">
      <GlobalBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppRoutes />
        <ConditionalFooter />
        <FloatingCreateButton />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
