import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import FocusPage from "@/pages/FocusPage";
import LogPage from "@/pages/LogPage";
import QiblaPage from "@/pages/QiblaPage";
import DhikrPage from "@/pages/DhikrPage";
import Names99Page from "@/pages/Names99Page";
import QuranPage from "@/pages/QuranPage";
import SettingsPage from "@/pages/SettingsPage";
import AiChatButton from "@/components/AiChatButton";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#F5F3EF" });
      SplashScreen.hide({ fadeOutDuration: 300 });
    } catch {}
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AppProvider>
          <BrowserRouter>
            {/* Full-height native shell — bg fills screen on all devices */}
            <div className="max-w-md mx-auto relative h-dvh overflow-hidden bg-background flex flex-col">
              {/* Scrollable content — pb-20 clears the bottom nav */}
              <div className="flex-1 overflow-y-auto overscroll-none pb-20">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/focus" element={<FocusPage />} />
                  <Route path="/log" element={<LogPage />} /> {/* ← separate page */}
                  <Route path="/me" element={<SettingsPage />} />
                  <Route path="/qibla" element={<QiblaPage />} />
                  <Route path="/dhikr" element={<DhikrPage />} />
                  <Route path="/names99" element={<Names99Page />} />
                  <Route path="/quran" element={<QuranPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              {/* Fixed to bottom — AiChatButton sits above it */}
              <BottomNav />
              <AiChatButton className="bottom-20 right-4" />
            </div>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
