import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useUserStore } from "@/store/userStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { SideMenu } from "@/components/ui/side-menu";
import { MenuProvider, useMenu } from "@/components/ui/menu-context";

// Mobile pages
import MobileHome from "@/pages/mobile-home";
import MobileCalories from "@/pages/mobile-calories";
import MobileTraining from "@/pages/mobile-training";
import MobileNutrition from "@/pages/mobile-nutrition";
import MobileMeals from "@/pages/mobile-meals";
import MobileProfile from "@/pages/mobile-profile";
import MobileStatistics from "@/pages/mobile-statistics";
import MobileMeasurements from "@/pages/mobile-measurements";
import { MobileAchievements } from "@/pages/mobile-achievements";
import { MobileGoals } from "@/pages/mobile-goals";
import MobileProgress from "@/pages/mobile-progress";

// Setup pages
import HardgainerProfileSetup from "@/pages/hardgainer-profile-setup";
import CalibrationMode from "@/pages/calibration-mode";

function App() {
  const { user, isOnboarded, completeOnboarding } = useUserStore();

  // Force dark theme for Grok-inspired design
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // If no user profile, show setup
  if (!user || !isOnboarded) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <HardgainerProfileSetup />
          <Toaster />
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <AppContent />
        <Toaster />
      </MenuProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isMenuOpen, openMenu, closeMenu } = useMenu();

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
      
      <Switch>
        <Route path="/" component={MobileHome} />
        <Route path="/calibration" component={CalibrationMode} />
        <Route path="/calories" component={MobileCalories} />
        <Route path="/training" component={MobileTraining} />
        <Route path="/nutrition" component={MobileNutrition} />
        <Route path="/meals" component={MobileMeals} />
        <Route path="/profile" component={MobileProfile} />
        <Route path="/measurements" component={MobileMeasurements} />
        <Route path="/achievements" component={MobileAchievements} />
        <Route path="/goals" component={MobileGoals} />
        <Route path="/progress" component={MobileProgress} />
        <Route path="/setup" component={HardgainerProfileSetup} />
        
        {/* Fallback */}
        <Route>
          <MobileHome />
        </Route>
      </Switch>
    </div>
  );
}

export default App;