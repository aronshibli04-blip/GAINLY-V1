import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

// Mobile pages
import MobileHome from "@/pages/mobile-home";
import MobileCalories from "@/pages/mobile-calories";
import MobileTraining from "@/pages/mobile-training";
import MobileAICoach from "@/pages/mobile-ai-coach";
import MobileMeals from "@/pages/mobile-meals";
import MobileProfile from "@/pages/mobile-profile";

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
      <div className="min-h-screen bg-background">
        <HardgainerProfileSetup />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={MobileHome} />
        <Route path="/calibration" component={CalibrationMode} />
        <Route path="/calories" component={MobileCalories} />
        <Route path="/training" component={MobileTraining} />
        <Route path="/ai-coach" component={MobileAICoach} />
        <Route path="/meals" component={MobileMeals} />
        <Route path="/profile" component={MobileProfile} />
        <Route path="/setup" component={HardgainerProfileSetup} />
        
        {/* Fallback */}
        <Route>
          <MobileHome />
        </Route>
      </Switch>
      
      <Toaster />
    </div>
  );
}

export default App;