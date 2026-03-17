import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import QiblaPage from "@/pages/QiblaPage";
import DhikrPage from "@/pages/DhikrPage";
import Names99Page from "@/pages/Names99Page";
import QuranPage from "@/pages/QuranPage";
import SettingsPage from "@/pages/SettingsPage";
import AiChatButton from "@/components/AiChatButton";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <div className="max-w-md mx-auto relative">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/focus" element={<QiblaPage />} />
              <Route path="/log" element={<DhikrPage />} />
              <Route path="/me" element={<SettingsPage />} />
              <Route path="/qibla" element={<QiblaPage />} />
              <Route path="/dhikr" element={<DhikrPage />} />
              <Route path="/names99" element={<Names99Page />} />
              <Route path="/quran" element={<QuranPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
            <AiChatButton />
          </div>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
