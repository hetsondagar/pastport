import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateCapsule from "./pages/CreateCapsule";
import Profile from "./pages/Profile";
import DailyJournal from "./pages/DailyJournal";
import MemoryConstellationPage from "./pages/MemoryConstellationPage";
import TestConstellation from "./pages/TestConstellation";
import MinimalTest from "./pages/MinimalTest";
import ConstellationTest from "./pages/ConstellationTest";
import SimpleTest from "./pages/SimpleTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// App routes with transitions
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/journal" element={<PageTransition><DailyJournal /></PageTransition>} />
        <Route path="/memories/constellation" element={<PageTransition><MemoryConstellationPage /></PageTransition>} />
        <Route path="/test-constellation" element={<PageTransition><TestConstellation /></PageTransition>} />
        <Route path="/minimal-test" element={<PageTransition><MinimalTest /></PageTransition>} />
        <Route path="/constellation-test" element={<PageTransition><ConstellationTest /></PageTransition>} />
        <Route path="/simple-test" element={<PageTransition><SimpleTest /></PageTransition>} />
        <Route path="/create" element={<PageTransition><CreateCapsule /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <div className="min-h-screen bg-nebula bg-stars animate-gradient-shift animate-nebula-float animate-star-twinkle">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </div>
);

export default App;
