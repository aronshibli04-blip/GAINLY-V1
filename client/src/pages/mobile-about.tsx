import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useSideMenu } from "@/hooks/use-side-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Users, 
  Mail, 
  Zap,
  Apple,
  Brain,
  Shield,
  Award
} from "lucide-react";

export default function MobileAbout() {
  const { openMenu } = useSideMenu();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <MobileHeader 
          title="About Gainly" 
          onMenuClick={openMenu}
          icon={Heart}
          gradient="from-emerald-600 to-green-500"
        />

        <div className="pt-24 pb-24 px-4 space-y-6">
          
          {/* Hero Section */}
          <Card className="bg-gradient-to-br from-emerald-900/40 via-slate-800/60 to-green-900/40 border-emerald-500/20 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                <Zap className="h-8 w-8 text-black" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                GAINLY
              </CardTitle>
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/50 bg-emerald-500/10">
                Weight Gain Coach
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-center leading-relaxed">
                Making healthy weight gain simple, sustainable, and achievable for people who struggle to put on weight.
              </p>
            </CardContent>
          </Card>

          {/* Our Approach Section */}
          <Card className="bg-slate-800/60 border-emerald-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Target className="h-6 w-6 mr-3 text-emerald-400" />
                Our Approach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                We provide comprehensive nutrition tracking with personalized recommendations designed specifically for hardgainers who need to gain weight effectively.
              </p>
              
              <div className="grid gap-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Apple className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Smart Nutrition Tracking</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Precise calorie and macro tracking tailored for weight gain goals
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Personalized Guidance</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Custom meal plans and recommendations based on your progress
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Progress Tracking</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Detailed analytics and insights to optimize your weight gain journey
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Motivation System</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Achievements, streaks, and daily routines to keep you engaged
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Gainly Section */}
          <Card className="bg-slate-800/60 border-emerald-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Users className="h-6 w-6 mr-3 text-emerald-400" />
                Built for Hardgainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Unlike generic fitness apps, Gainly is specifically designed for people who struggle to gain weight. We understand the unique challenges hardgainers face and provide tools that actually work.
              </p>
              
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="font-medium text-emerald-400">Our Promise</span>
                </div>
                <p className="text-sm text-slate-300">
                  Simple, sustainable, and achievable weight gain through evidence-based nutrition tracking and supportive guidance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-slate-800/60 border-emerald-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Mail className="h-6 w-6 mr-3 text-emerald-400" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Questions, feedback, or need support? We're here to help you succeed.
              </p>
              
              <Button 
                variant="outline" 
                className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
                data-testid="contact-support"
                onClick={() => window.location.href = 'mailto:support@gainly.app'}
              >
                <Mail className="h-4 w-4 mr-2" />
                support@gainly.app
              </Button>
            </CardContent>
          </Card>

          {/* App Version Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">
              Gainly v1.0 • Made with ❤️ for hardgainers
            </p>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}