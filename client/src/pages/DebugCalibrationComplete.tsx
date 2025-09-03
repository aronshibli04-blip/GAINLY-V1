import React from 'react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/hooks/use-toast';

export default function DebugCalibrationComplete() {
  const { user, setUser } = useUserStore();
  const { toast } = useToast();

  const handleCompleteCalibration = () => {
    if (user) {
      setUser({ ...user, hasCompletedCalibration: true });
      toast({
        title: "✅ Calibration Completed!",
        description: "You can now access the full GAINLY app.",
      });
    }
  };

  const handleResetCalibration = () => {
    if (user) {
      setUser({ ...user, hasCompletedCalibration: false });
      toast({
        title: "🔄 Calibration Reset",
        description: "You'll need to complete calibration again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-500 mb-4">GAINLY Debug</h1>
          <p className="text-slate-300 mb-8">Quick calibration controls for testing</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-2">Current Status:</h3>
            <p className="text-slate-300">
              User: {user?.firstName || 'Unknown'}
            </p>
            <p className="text-slate-300">
              Onboarded: {user ? 'Yes' : 'No'}
            </p>
            <p className="text-slate-300">
              Calibration Complete: {user?.hasCompletedCalibration ? 'Yes' : 'No'}
            </p>
          </div>

          <Button
            onClick={handleCompleteCalibration}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4"
            size="lg"
          >
            ✅ Complete Calibration & Enter App
          </Button>

          <Button
            onClick={handleResetCalibration}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            🔄 Reset Calibration (for testing)
          </Button>

          <div className="text-center pt-4">
            <a 
              href="/" 
              className="text-emerald-500 hover:text-emerald-400 underline"
            >
              → Go to Main App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}