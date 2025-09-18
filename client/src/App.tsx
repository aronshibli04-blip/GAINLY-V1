import React, { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useUserStore } from "@/store/userStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { SideMenu } from "@/components/ui/side-menu";
import { SideMenuProvider, useSideMenu } from "@/hooks/use-side-menu";
import { OnboardingFlow } from "@/components/ui/onboarding-flow";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { InstallPrompt } from "@/components/install-prompt";
import { AnimatedPresenceWrapper } from "@/components/ui/page-transition";
import { useLocation } from "wouter";

// Enhanced Onboarding Flow
import { EnhancedOnboardingFlow } from "@/components/onboarding/EnhancedOnboardingFlow";

// Mobile pages  
import MobileHome from "@/pages/mobile-home";
import MobileDashboardNew from "@/pages/mobile-dashboard-new";
import MobileCalories from "@/pages/mobile-calories";
import MobileTraining from "@/pages/mobile-training";
import MobileAICoach from "@/pages/mobile-ai-coach";
import MobileMeals from "@/pages/mobile-meals";
import MobileProfile from "@/pages/mobile-profile";
import MobileStatistics from "@/pages/mobile-statistics";
import MobileMeasurements from "@/pages/mobile-measurements";
import { MobileAchievements } from "@/pages/mobile-achievements";
import { MobileGoals } from "@/pages/mobile-goals";
import MobileProgress from "@/pages/mobile-progress";
import MobileAbout from "@/pages/mobile-about";
import MobileDemo from "./pages/MobileDemo";
import MobileHomeDemo from "./pages/mobile-home-demo";


// Setup pages
import HardgainerProfileSetup from "@/pages/hardgainer-profile-setup";

function App() {
  const { user, isOnboarded, completeOnboarding } = useUserStore();
  const [hasError, setHasError] = useState(false);

  // Force dark theme for Grok-inspired design
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">GAINLY</h1>
          <p className="text-gray-300 mb-4">Starting app...</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-emerald-500 text-white px-4 py-2 rounded"
          >
            Reset & Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no user profile or still loading, show enhanced onboarding
  if (!user || !isOnboarded || user === undefined) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><h1>Loading GAINLY...</h1></div>}>
          <div className="min-h-screen bg-background">
            <EnhancedOnboardingFlow />
            <Toaster />
          </div>
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SideMenuProvider>
        <InstallPrompt />
        <AppContent />
        <Toaster />
      </SideMenuProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isOpen: isMenuOpen, openMenu, closeMenu } = useSideMenu();

  // Force dark theme for Grok-inspired design
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global Side Menu */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={closeMenu}
        onOpenMenu={openMenu}
      />
      
      <ErrorBoundary>
        <AnimatedPresenceWrapper>
          <Switch>
            <Route path="/" component={MobileDashboardNew} />
            <Route path="/calories" component={MobileCalories} />
            <Route path="/training" component={MobileTraining} />
            <Route path="/ai-coach" component={MobileAICoach} />
            <Route path="/meals" component={MobileMeals} />
            <Route path="/profile" component={MobileProfile} />
            <Route path="/measurements" component={MobileMeasurements} />
            <Route path="/achievements" component={MobileAchievements} />
            <Route path="/goals" component={MobileGoals} />
            <Route path="/progress" component={MobileProgress} />
            <Route path="/about" component={MobileAbout} />
            <Route path="/mobile-demo" component={MobileDemo} />
            <Route path="/home-demo" component={MobileHomeDemo} />
            <Route path="/futuristic-demo">
              {() => {
                const FuturisticDemo = React.lazy(() => import('./pages/FuturisticDemo'));
                return (
                  <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center">
                    <div className="text-emerald-400">Loading...</div>
                  </div>}>
                    <FuturisticDemo />
                  </React.Suspense>
                );
              }}
            </Route>

            <Route path="/setup" component={HardgainerProfileSetup} />
            
            {/* Fallback */}
            <Route>
              <MobileHome />
            </Route>
          </Switch>
        </AnimatedPresenceWrapper>
      </ErrorBoundary>
    </div>
  );
}

export default App;