import { BottomNav } from "@/components/ui/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Target, 
  Mail, 
  Zap,
  Apple,
  Brain,
  TrendingUp,
  Award
} from "lucide-react";

export default function MobileAbout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="pt-8 pb-24 px-4 space-y-6">
        
        {/* Header */}
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">About Gainly</h1>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">
            Weight Gain Coach
          </Badge>
        </div>

        {/* Mission */}
        <Card className="bg-slate-800/60 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Heart className="h-5 w-5 mr-2 text-emerald-400" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Making healthy weight gain simple, sustainable, and achievable for people who struggle to put on weight.
            </p>
          </CardContent>
        </Card>

        {/* Our Approach */}
        <Card className="bg-slate-800/60 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-emerald-400" />
              Our Approach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-slate-300 mb-4">
              We provide comprehensive nutrition tracking with personalized recommendations designed specifically for hardgainers who need to gain weight effectively.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Apple className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Smart nutrition tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Personalized guidance</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Progress tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Motivation system</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-slate-800/60 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Mail className="h-5 w-5 mr-2 text-emerald-400" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Questions or feedback? Contact us at support@gainly.app
            </p>
            <Button 
              variant="outline" 
              className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              data-testid="contact-support"
              onClick={() => window.location.href = 'mailto:support@gainly.app'}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>

      </div>

      <BottomNav />
    </div>
  );
}