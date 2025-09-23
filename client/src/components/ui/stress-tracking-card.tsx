import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea, Cell, Tooltip } from "recharts";
import { Brain, TrendingDown, TrendingUp, Minus, BarChart3, Save, Info, TrendingUp as ArrowUp, TrendingDown as ArrowDown } from "lucide-react";
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

  // Stress level zones and colors
  const getStressZone = (level: number) => {
    if (level <= 2) return { zone: 'optimal', color: '#22c55e', label: 'Rolig' }; // Green
    if (level <= 3.5) return { zone: 'moderate', color: '#eab308', label: 'Balansert' }; // Yellow
    return { zone: 'high', color: '#ef4444', label: 'Høyt stress' }; // Red
  };

  const getBarColor = (level: number) => {
    return getStressZone(level).color;
  };

  // Process real stress data for chart
  const getChartData = () => {
    const periodDays = { '7D': 7, '14D': 14, '30D': 30 };
    const days = periodDays[chartPeriod];
    
    if (!stressLogsData.length) {
      return [];
    }
    
    // Use real data
    const endDate = new Date();
    
    return Array.from({ length: days }, (_, i) => {
      const currentDate = subDays(endDate, days - 1 - i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Find stress log for this date
      const stressLog = stressLogsData.find((log: any) => log.logDate === dateStr);
      
      return {
        date: format(currentDate, 'MMM dd'),
        dayName: format(currentDate, 'EEE'),
        level: stressLog ? stressLog.level : 0,
        hasData: !!stressLog
      };
    }).filter(day => day.hasData);
  };
  
  const chartData = getChartData();
  const weeklyData = chartData.slice(-7).map(d => d.level);
  const StressIcon = getStressIcon(stressLevel);

  // Calculate chart statistics
  const chartStats = {
    average: chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.level, 0) / chartData.length) : 0,
    trend: 0 // Will calculate trend vs previous period if needed
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const level = payload[0].value;
      const { zone, label: zoneLabel } = getStressZone(level);
      const tip = getContextualTip(level <= 2 ? level * 5 : level <= 3.5 ? 6 : 9); // Map back to 1-10 scale for tips
      
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-lg">
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-purple-400 text-xs">
            Stress: {level}/5 - {zoneLabel}
          </p>
          <p className="text-slate-300 text-xs mt-1 max-w-40">
            {tip}
          </p>
        </div>
      );
    }
    return null;
  };

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

  const renderChartMode = () => {
    if (chartData.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-white text-sm font-medium mb-2">Ingen stressdata ennå</h3>
          <p className="text-slate-400 text-xs mb-4">
            Logg stress-nivået ditt for å se mønstre og trender
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 text-left">
            <h4 className="text-white text-xs font-medium mb-2">Stress-skala forklaring:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-green-400">1-2: Rolig, optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-yellow-400">3: Balansert, håndterbart</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-red-400">4-5: Høyt, trenger oppmerksomhet</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              🎢 Mål: Mest tid i grønn sone (1-2)
            </p>
          </div>
        </div>
      );
    }

    const avgZone = getStressZone(chartStats.average);

    return (
      <>
        {/* Summary Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-semibold">Stressstatistikk</span>
            </div>
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
          
          {/* Average Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: avgZone.color }}
                ></div>
                <span className="text-white text-sm font-medium">
                  Ø {chartStats.average.toFixed(1)}
                </span>
                <span 
                  className="text-xs px-1.5 py-0.5 rounded" 
                  style={{ 
                    backgroundColor: avgZone.color + '20',
                    color: avgZone.color 
                  }}
                >
                  {avgZone.label}
                </span>
              </div>
            </div>
            <div className="text-slate-400 text-xs">
              Mål: 1-2 (grønn sone)
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              
              {/* Color Zones Background */}
              <ReferenceArea y1={1} y2={2} fill="#22c55e" fillOpacity={0.1} />
              <ReferenceArea y1={2} y2={3.5} fill="#eab308" fillOpacity={0.1} />
              <ReferenceArea y1={3.5} y2={5} fill="#ef4444" fillOpacity={0.1} />
              
              {/* Target Line (optimal zone) */}
              <ReferenceLine 
                y={2.5} 
                stroke="#22c55e" 
                strokeDasharray="2 2" 
                opacity={0.8}
              />
              
              <XAxis 
                dataKey={chartPeriod === '7D' ? 'dayName' : 'date'}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[1, 5]}
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  if (value <= 2) return 'Rolig';
                  if (value <= 3.5) return 'Balansert';
                  return 'Høyt';
                }}
              />
              
              {/* Custom Tooltip */}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Stress Bars with Individual Colors */}
              <Bar 
                dataKey="level" 
                radius={[2, 2, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded"></div>
              <span className="text-slate-400">Rolig (1-2)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded"></div>
              <span className="text-slate-400">Balansert (3)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded"></div>
              <span className="text-slate-400">Høyt (4-5)</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-green-500 opacity-80"></div>
            <span className="text-slate-400">Mål</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-3">
        {showChart ? renderChartMode() : renderLoggingMode()}
      </CardContent>
    </Card>
  );
}