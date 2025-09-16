import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';

import { queryClient } from "@/lib/queryClient";
import { SideMenu } from "@/components/ui/side-menu";
import { SideMenuProvider, useSideMenu } from "@/hooks/use-side-menu";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { InstallPrompt } from "@/components/install-prompt";
import { AnimatedPresenceWrapper } from "@/components/ui/page-transition";

// Enhanced Onboarding Flow
import { EnhancedOnboardingFlow } from "@/components/onboarding/EnhancedOnboardingFlow";

// Pages
import HomePage from "@/pages/home";
import MobileHome from "@/pages/mobile-home";
import MobileMeals from "@/pages/mobile-meals";
import MobileCalories from "@/pages/mobile-calories";
import MobileProgress from "@/pages/mobile-progress";
import MobileProfile from "@/pages/mobile-profile";
import MobileTraining from "@/pages/mobile-training";
import MobileMeasurements from "@/pages/mobile-measurements";
import MobileStatistics from "@/pages/mobile-statistics";
import { MobileGoals } from "@/pages/mobile-goals";
import { MobileAchievements } from "@/pages/mobile-achievements";
import MobileAiCoach from "@/pages/mobile-ai-coach";
import MobileDailyRoutines from "@/pages/mobile-daily-routines";
import MobileAbout from "@/pages/mobile-about";
import ProfileSetup from "@/pages/profile-setup";
import HardgainerProfileSetup from "@/pages/hardgainer-profile-setup";
import HardgainerHome from "@/pages/hardgainer-home";
import CalibrationMode from "@/pages/calibration-mode";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { isOpen, closeMenu, openMenu } = useSideMenu();
  
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <SideMenu isOpen={isOpen} onClose={closeMenu} onOpenMenu={openMenu} />
              <InstallPrompt />

              <AnimatedPresenceWrapper>
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/mobile" component={MobileHome} />
                  <Route path="/mobile/meals" component={MobileMeals} />
                  <Route path="/mobile/calories" component={MobileCalories} />
                  <Route path="/mobile/progress" component={MobileProgress} />
                  <Route path="/mobile/profile" component={MobileProfile} />
                  <Route path="/mobile/training" component={MobileTraining} />
                  <Route path="/mobile/measurements" component={MobileMeasurements} />
                  <Route path="/mobile/statistics" component={MobileStatistics} />
                  <Route path="/mobile/goals" component={MobileGoals} />
                  <Route path="/mobile/achievements" component={MobileAchievements} />
                  <Route path="/mobile/ai-coach" component={MobileAiCoach} />
                  <Route path="/mobile/daily-routines" component={MobileDailyRoutines} />
                  <Route path="/mobile/about" component={MobileAbout} />
                  <Route path="/profile-setup" component={ProfileSetup} />
                  <Route path="/hardgainer-setup" component={HardgainerProfileSetup} />
                  <Route path="/hardgainer" component={HardgainerHome} />
                  <Route path="/calibration" component={CalibrationMode} />
                  <Route path="/onboarding" component={EnhancedOnboardingFlow} />
                  <Route component={NotFound} />
                </Switch>
              </AnimatedPresenceWrapper>
            </div>
          </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SideMenuProvider>
          <AppContent />
        </SideMenuProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;