import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { Brain, TrendingDown, TrendingUp, Minus, BarChart3, Save } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { queryClient } from "@/lib/queryClient";

interface StressTrackingCardProps {
  className?: string;
}

export function StressTrackingCard({ className }: StressTrackingCardProps) {
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [chartPeriod, setChartPeriod] = useState<'7D' | '14D' | '30D'>('7D');
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const stressLabels = {
    1: "Veldig rolig", 2: "Rolig", 3: "Balansert", 4: "Anspent", 5: "Stresset",
    6: "Høyt stress", 7: "Veldig stresset", 8: "Overveldet", 9: "Ekstremt stress", 10: "Panikk"
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return "text-emerald-400";
    if (level <= 4) return "text-green-400";
    if (level <= 6) return "text-yellow-400";
    if (level <= 8) return "text-orange-400";
    return "text-red-400";
  };

  const getStressIcon = (level: number) => {
    if (level <= 3) return TrendingDown;
    if (level <= 6) return Minus;
    return TrendingUp;
  };

  const getContextualTip = (level: number) => {
    const hour = new Date().getHours();
    const isEvening = hour >= 18;
    
    if (level <= 2) return "Fantastisk! Du håndterer stress godt 🌟";
    if (level <= 4) return isEvening ? "Prøv meditasjon før sengetid 🧘‍♂️" : "Ta en kort pause og pust dypt 💨";
    if (level <= 6) return isEvening ? "Skriv ned bekymringer før du sover 📝" : "Gå en runde eller hør musikk 🎵";
    if (level <= 8) return "Snakk med noen du stoler på eller ring helsevesenet 💙";
    return "Søk profesjonell hjelp hvis dette vedvarer 🆘";
  };

  // Convert 1-10 UI scale to 1-5 DB scale
  const convertToDbScale = (uiLevel: number): number => {
    if (uiLevel <= 2) return 1;
    if (uiLevel <= 4) return 2; 
    if (uiLevel <= 6) return 3;
    if (uiLevel <= 8) return 4;
    return 5;
  };
  
  // Fetch real stress data from database
  const { data: stressLogsData = [] } = useQuery({
    queryKey: ['/api/stress-logs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/stress-logs/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stress logs');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Check if user has logged today (smart daily logic)
  const hasLoggedToday = stressLogsData.some((log: any) => log.logDate === today);
  const showChart = hasLoggedToday;
  
  // Save stress log mutation
  const saveStressMutation = useMutation({
    mutationFn: async (stressData: { userId: string; level: number; logDate: string }) => {
      const response = await fetch('/api/stress-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stressData)
      });
      if (!response.ok) throw new Error('Failed to save stress log');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stress logget!",
        description: `Stress-nivå ${stressLevel}/10 er lagret for i dag.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stress-logs', userId] });
    },
    onError: () => {
      toast({
        title: "Feil ved lagring",
        description: "Kunne ikke lagre stressdata. Prøv igjen.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveStress = () => {
    if (!userId) {
      toast({
        title: "Ingen bruker funnet",
        description: "Kan ikke lagre stressdata uten bruker-ID.",
        variant: "destructive"
      });
      return;
    }
    
    saveStressMutation.mutate({
      userId,
      level: convertToDbScale(stressLevel),
      logDate: today
    });
  };

  // Process real stress data for chart
  const getChartData = () => {
    const periodDays = { '7D': 7, '14D': 14, '30D': 30 };
    const days = periodDays[chartPeriod];
    
    if (!stressLogsData.length) {
      // Return mock data if no real data available
      return Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - 1 - i);
        const level = 2 + Math.random() * 3; // 2-5 level to match DB scale
        return {
          date: format(date, 'MMM dd'),
          dayName: format(date, 'EEE'),
          level: Math.round(level)
        };
      });
    }
    
    // Use real data
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    return Array.from({ length: days }, (_, i) => {
      const currentDate = subDays(endDate, days - 1 - i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Find stress log for this date
      const stressLog = stressLogsData.find((log: any) => log.logDate === dateStr);
      
      return {
        date: format(currentDate, 'MMM dd'),
        dayName: format(currentDate, 'EEE'),
        level: stressLog ? stressLog.level : 0
      };
    }).filter(day => day.level > 0); // Only show days with data
  };
  
  const chartData = getChartData();
  const weeklyData = chartData.slice(-7).map(d => d.level);
  const StressIcon = getStressIcon(stressLevel);

  const renderLoggingMode = () => (
    <>
      {/* Compact Header with Trend Line */}
      <div className="flex items-center justify-between mb-3">
        <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          Stress Level
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* Mini trend line */}
          <div className="flex items-end gap-0.5 h-4">
            {weeklyData.map((value, index) => (
              <div 
                key={index}
                className="w-1 bg-purple-400 rounded-sm transition-all"
                style={{ height: `${(value / 5) * 16}px` }}
              />
            ))}
          </div>
          <span className="text-slate-400 text-xs">7d</span>
        </div>
      </div>

      {/* Compact Level Display with Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StressIcon className={cn("w-5 h-5", getStressColor(stressLevel))} />
            <span className="text-xl font-bold text-white">{stressLevel}</span>
          </div>
          <p className={cn("text-xs font-medium", getStressColor(stressLevel))}>
            {stressLabels[stressLevel as keyof typeof stressLabels]}
          </p>
        </div>
        
        {/* Stress Level Slider */}
        <div className="px-1">
          <Slider
            value={[stressLevel]}
            onValueChange={([value]) => setStressLevel(value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid="stress-slider"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Smart Contextual Tips */}
      <div className="pt-2 border-t border-slate-600 mb-3">
        <p className="text-slate-400 text-xs text-center leading-relaxed">
          {getContextualTip(stressLevel)}
        </p>
      </div>
      
      {/* Save Stress Button */}
      <Button
        onClick={handleSaveStress}
        disabled={saveStressMutation.isPending}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        data-testid="save-stress-button"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveStressMutation.isPending ? 'Lagrer...' : 'Logg Stress'}
      </Button>
    </>
  );

  const renderChartMode = () => (
    <>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
        <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Stressstatistikk
        </CardTitle>
        <div className="flex gap-1">
          {(['7D', '14D', '30D'] as const).map((period) => (
            <Button
              key={period}
              variant={chartPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartPeriod(period)}
              className={cn(
                "text-xs h-6 px-2",
                chartPeriod === period
                  ? "bg-purple-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              )}
              data-testid={`period-${period}`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey={chartPeriod === '7D' ? 'dayName' : 'date'}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[1, 5]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            
            {/* Balanced Line (level 3) */}
            <ReferenceLine 
              y={3} 
              stroke="#ffffff" 
              strokeDasharray="3 3" 
              opacity={0.7}
            />
            
            {/* Stress Bars */}
            <Bar 
              dataKey="level" 
              fill="hsl(270, 91%, 60%)"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded"></div>
            <span className="text-slate-400">Stress-nivå</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-white opacity-70"></div>
            <span className="text-slate-400">Balansert</span>
          </div>
        </div>
        <div className="text-slate-400">
          Ø: {chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.level, 0) / chartData.length).toFixed(1) : '0'}
        </div>
      </div>
    </>
  );

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-3">
        {showChart ? renderChartMode() : renderLoggingMode()}
      </CardContent>
    </Card>
  );
}