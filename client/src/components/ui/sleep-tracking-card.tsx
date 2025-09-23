import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea, ComposedChart } from "recharts";
import { Moon, Clock, BarChart3, Edit3, Save } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { queryClient } from "@/lib/queryClient";

interface SleepTrackingCardProps {
  className?: string;
}

export function SleepTrackingCard({ className }: SleepTrackingCardProps) {
  // Chart state is now data-driven, not component state
  const [chartPeriod, setChartPeriod] = useState<'7D' | '14D' | '30D'>('7D');
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [sleepQuality, setSleepQuality] = useState<number>(4); // Changed to 1-5 scale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customHours, setCustomHours] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const quickHourOptions = [6, 7, 8, 9];
  const sleepGoal = 8; // Fixed 8h goal
  const extendedHourOptions = [4, 4.5, 5, 5.5, 10, 10.5, 11, 11.5, 12]; // For modal
  const today = format(new Date(), 'yyyy-MM-dd');


  const getQualityColor = (quality: number) => {
    if (quality === 1) return "text-red-400";
    if (quality === 2) return "text-orange-400";
    if (quality === 3) return "text-yellow-400";
    if (quality === 4) return "text-green-400";
    return "text-emerald-400";
  };

  const getQualityLabel = (quality: number) => {
    const labels = {
      1: "Søvnløs",
      2: "Dårlig", 
      3: "OK",
      4: "Bra",
      5: "Perfekt"
    };
    return labels[quality as keyof typeof labels] || "OK";
  };

  const getSmartTip = (hours: number, quality: number) => {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 18;
    
    if (hours >= 8 && quality >= 4) return "Fantastisk! Du får nok god søvn 🌟";
    if (hours < 7) return isEvening ? "Legg deg tidligere i kveld for å nå 8t målet 🛏️" : "Prøv å gå til sengs 1 time tidligere 💤";
    if (quality <= 2) return "Vurder å redusere koffein og skjermtid før sengetid ☕📱";
    if (hours >= 8 && quality <= 3) return "Du sover nok timer, men kvaliteten kan forbedres 🧘‍♂️";
    return "Du er på rett vei! Hold oppe gode søvnrutiner 💪";
  };

  
  // Fetch real sleep data from database
  const { data: sleepLogsData = [] } = useQuery({
    queryKey: ['/api/sleep-logs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/sleep-logs/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch sleep logs');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Check if user has logged today (smart daily logic)
  const hasLoggedToday = sleepLogsData.some((log: any) => log.logDate === today);
  const showChart = hasLoggedToday;
  
  // Save sleep log mutation
  const saveSleepMutation = useMutation({
    mutationFn: async (sleepData: { userId: string; quality: number; hours: number; notes?: string; logDate: string }) => {
      const response = await fetch('/api/sleep-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sleepData)
      });
      if (!response.ok) throw new Error('Failed to save sleep log');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Søvn logget!",
        description: `${sleepHours}t søvn med kvalitet ${sleepQuality}/5 er lagret.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-logs', userId] });
      // Chart will automatically show after query invalidation updates the data
    },
    onError: () => {
      toast({
        title: "Feil ved lagring",
        description: "Kunne ikke lagre søvndata. Prøv igjen.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveSleep = () => {
    if (!userId) {
      toast({
        title: "Ingen bruker funnet",
        description: "Kan ikke lagre søvndata uten bruker-ID.",
        variant: "destructive"
      });
      return;
    }
    
    saveSleepMutation.mutate({
      userId,
      quality: sleepQuality,
      hours: sleepHours,
      notes: undefined,
      logDate: today
    });
  };
  
  const handleCustomHours = () => {
    const hours = parseFloat(customHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      toast({
        title: "Ugyldig verdi",
        description: "Vennligst skriv et tall mellom 0 og 24 timer.",
        variant: "destructive"
      });
      return;
    }
    setSleepHours(hours);
    setCustomHours("");
    setIsModalOpen(false);
  };

  // Process real sleep data for chart
  const getChartData = () => {
    const periodDays = { '7D': 7, '14D': 14, '30D': 30 };
    const days = periodDays[chartPeriod];
    
    if (!sleepLogsData.length) {
      // Return mock data if no real data available
      return Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - 1 - i);
        const hours = 6.5 + Math.random() * 2.5;
        const quality = 2 + Math.random() * 3; // 2-5 quality to match DB scale
        return {
          date: format(date, 'MMM dd'),
          dayName: format(date, 'EEE'),
          hours: Number(hours.toFixed(1)),
          quality: Number(quality.toFixed(1))
        };
      });
    }
    
    // Use real data
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    return Array.from({ length: days }, (_, i) => {
      const currentDate = subDays(endDate, days - 1 - i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Find sleep log for this date
      const sleepLog = sleepLogsData.find((log: any) => log.logDate === dateStr);
      
      return {
        date: format(currentDate, 'MMM dd'),
        dayName: format(currentDate, 'EEE'),
        hours: sleepLog ? Number(sleepLog.hours) : 0,
        quality: sleepLog ? Number(sleepLog.quality) : 0
      };
    }).filter(day => day.hours > 0); // Only show days with data
  };
  
  const chartData = getChartData();
  const weeklyData = chartData.slice(-7).map(d => d.hours);
  const weeklyAverage = weeklyData.length > 0 ? weeklyData.reduce((sum, hours) => sum + hours, 0) / weeklyData.length : 0;
  const goalProgress = (weeklyAverage / sleepGoal) * 100;

  const renderLoggingMode = () => (
    <>
      {/* Compact Header with Weekly Progress */}
      <div className="flex items-center justify-between mb-3">
        <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
          <Moon className="w-4 h-4 text-blue-400" />
          Sleep Tracking
        </CardTitle>
        <div className="text-right">
          <div className="text-xs text-slate-400">
            Uke Ø: <span className={cn("font-medium", weeklyAverage >= 8 ? "text-green-400" : "text-orange-400")}>
              {weeklyAverage.toFixed(1)}t
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="w-16 h-1 bg-slate-600 rounded-full mt-1">
            <div 
              className={cn("h-full rounded-full transition-all", goalProgress >= 100 ? "bg-green-400" : "bg-blue-400")}
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Hour Buttons */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Timer i natt
          </span>
          <span className={cn("text-lg font-bold", sleepHours >= 8 ? "text-green-400" : "text-blue-400")}>
            {sleepHours}t
          </span>
        </div>
        
        <div className="flex gap-2 justify-center flex-wrap">
          {quickHourOptions.map((hours) => (
            <Button
              key={hours}
              variant={sleepHours === hours ? "default" : "outline"}
              size="sm"
              onClick={() => setSleepHours(hours)}
              className={cn(
                "text-sm px-3 py-1.5 h-8 min-w-[44px]",
                sleepHours === hours 
                  ? hours === 8 
                    ? "bg-green-500 text-white border-green-400 ring-2 ring-green-400/50" 
                    : "bg-blue-500 text-white border-blue-400"
                  : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              )}
              data-testid={`sleep-hours-${hours}`}
            >
              {hours}t
            </Button>
          ))}
          
          {/* Annet button with modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1.5 h-8 min-w-[44px] bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                data-testid="sleep-hours-other"
              >
                Annet
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-md bg-slate-900/98 border border-slate-500 text-white shadow-2xl z-[100] pointer-events-auto"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90vw',
                maxWidth: '400px',
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-white">Velg søvntimer</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Velg hvor mange timer du sov, eller skriv inn egendefinert verdi.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {extendedHourOptions.map((hours) => (
                    <Button
                      key={hours}
                      variant="outline"
                      onClick={() => {
                        setSleepHours(hours);
                        setIsModalOpen(false);
                      }}
                      className="text-sm"
                      data-testid={`modal-hours-${hours}`}
                    >
                      {hours}t
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Eller skriv timer:</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="7.5"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      step="0.5"
                      min="0"
                      max="24"
                      className="text-sm"
                      data-testid="custom-hours-input"
                    />
                    <Button onClick={handleCustomHours} size="sm" data-testid="custom-hours-confirm">
                      Velg
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {sleepHours === 8 && (
          <div className="text-center mt-1">
            <span className="text-xs text-green-400">🎯 Perfekt!</span>
          </div>
        )}
      </div>

      {/* Sleep Quality Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-xs">Kvalitet</span>
          <span className={cn("text-xs font-medium", getQualityColor(sleepQuality))}>
            {sleepQuality}/5 - {getQualityLabel(sleepQuality)}
          </span>
        </div>
        
        <div className="px-1">
          <Slider
            value={[sleepQuality]}
            onValueChange={([value]) => setSleepQuality(value)}
            max={5}
            min={1}
            step={1}
            className="w-full"
            data-testid="sleep-quality-slider"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span>3</span>
            <span>5</span>
          </div>
        </div>
      </div>


      {/* Smart Tips */}
      <div className="pt-2 border-t border-slate-600 mb-3">
        <p className="text-slate-400 text-xs text-center leading-relaxed">
          {getSmartTip(sleepHours, sleepQuality)}
        </p>
      </div>
      
      {/* Save Sleep Button */}
      <Button
        onClick={handleSaveSleep}
        disabled={saveSleepMutation.isPending}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        data-testid="save-sleep-button"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveSleepMutation.isPending ? 'Lagrer...' : 'Logg Søvn'}
      </Button>
    </>
  );

  const renderChartMode = () => (
    <>
      {/* Enhanced Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-white text-base font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Søvnstatistikk
        </CardTitle>
        <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
          {(['7D', '14D', '30D'] as const).map((period) => (
            <Button
              key={period}
              variant={chartPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartPeriod(period)}
              className={cn(
                "text-xs h-6 px-3 transition-all duration-200",
                chartPeriod === period
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-600/80"
              )}
              data-testid={`period-${period}`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart with Smart Insights */}
      <div className="h-44 mb-3 relative">
        {/* Paradox indicator */}
        {chartData.some(d => (d.hours >= 9 && d.quality <= 3) || (d.hours <= 6 && d.quality >= 4)) && (
          <div className="absolute top-0 right-0 text-[10px] text-slate-400 bg-slate-700/80 rounded px-1.5 py-0.5 z-10">
            💡 Tidsmytar synlige
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Sleep Hours Background Zones */}
            <defs>
              {/* Green zone for optimal sleep (7-9h) */}
              <linearGradient id="optimalSleepZone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.03" />
              </linearGradient>
              {/* Yellow zone for suboptimal sleep (6-7h and 9-10h) */}
              <linearGradient id="suboptimalSleepZone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.03" />
              </linearGradient>
              {/* Red zone for poor sleep (4-6h and 10-12h) */}
              <linearGradient id="poorSleepZone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {/* Sleep Hours Background Zones - using ReferenceArea for proper positioning */}
            {/* Red zone: Excessive sleep (10-12h) */}
            <ReferenceArea 
              yAxisId="hours" 
              y1={10} 
              y2={12} 
              fill="url(#poorSleepZone)" 
              fillOpacity={0.8}
            />
            
            {/* Yellow zone: A bit much sleep (9-10h) */}
            <ReferenceArea 
              yAxisId="hours" 
              y1={9} 
              y2={10} 
              fill="url(#suboptimalSleepZone)" 
              fillOpacity={0.8}
            />
            
            {/* Green zone: Optimal sleep (7-9h) - centered around 8h */}
            <ReferenceArea 
              yAxisId="hours" 
              y1={7} 
              y2={9} 
              fill="url(#optimalSleepZone)" 
              fillOpacity={0.8}
            />
            
            {/* Yellow zone: Suboptimal sleep (6-7h) */}
            <ReferenceArea 
              yAxisId="hours" 
              y1={6} 
              y2={7} 
              fill="url(#suboptimalSleepZone)" 
              fillOpacity={0.8}
            />
            
            {/* Red zone: Too little sleep (4-6h) */}
            <ReferenceArea 
              yAxisId="hours" 
              y1={4} 
              y2={6} 
              fill="url(#poorSleepZone)" 
              fillOpacity={0.8}
            />
            
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
            <XAxis 
              dataKey={chartPeriod === '7D' ? 'dayName' : 'date'}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="hours"
              domain={[4, 12]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="quality"
              orientation="right"
              domain={[1, 9]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                const labels: { [key: number]: string } = {
                  1: 'Søvnløs', 2: 'Dårlig', 3: 'OK', 4: 'Bra', 5: 'Perfekt'
                };
                return labels[value] || '';
              }}
            />
            
            {/* 8h Goal Line */}
            <ReferenceLine 
              yAxisId="hours"
              y={8} 
              stroke="#22c55e" 
              strokeDasharray="3 3" 
              opacity={0.8}
            />
            
            {/* Perfect Quality Line (aligned with 8h goal) */}
            <ReferenceLine 
              yAxisId="quality"
              y={5} 
              stroke="#22c55e" 
              strokeDasharray="3 3" 
              opacity={0.8}
            />
            
            {/* Quality Reference Lines */}
            <ReferenceLine 
              yAxisId="quality"
              y={3} 
              stroke="#fbbf24" 
              strokeDasharray="2 2" 
              opacity={0.6}
            />
            <ReferenceLine 
              yAxisId="quality"
              y={4} 
              stroke="#22c55e" 
              strokeDasharray="2 2" 
              opacity={0.6}
            />
            
            {/* Hours Bars */}
            <Bar 
              yAxisId="hours"
              dataKey="hours" 
              fill="hsl(217, 91%, 60%)"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
            
            {/* Quality Line with Dynamic Colors */}
            <Line 
              yAxisId="quality"
              type="monotone" 
              dataKey="quality" 
              stroke="#ffffff"
              strokeWidth={2}
              dot={(props) => {
                const quality = props.payload?.quality || 3;
                const hours = props.payload?.hours || 8;
                let color = '#22c55e'; // Default green
                if (quality <= 2) color = '#ef4444'; // Red for poor
                else if (quality === 3) color = '#fbbf24'; // Yellow for OK
                
                // Larger dot if this shows "more hours ≠ better quality"
                const isParadox = (hours >= 9 && quality <= 3) || (hours <= 6 && quality >= 4);
                const radius = isParadox ? 5 : 3;
                const strokeWidth = isParadox ? 2 : 0;
                const strokeColor = isParadox ? '#ffffff' : color;
                
                return (
                  <circle 
                    cx={props.cx} 
                    cy={props.cy} 
                    r={radius} 
                    fill={color} 
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                );
              }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
            
            {/* Add custom labels for paradox points */}
            {chartData.map((entry, index) => {
              const isParadox = (entry.hours >= 9 && entry.quality <= 3) || (entry.hours <= 6 && entry.quality >= 4);
              if (!isParadox) return null;
              
              // Calculate approximate position (this is a rough estimation)
              const xPercent = ((index + 0.5) / chartData.length) * 100;
              const yPercent = entry.hours <= 6 ? 15 : 75; // Top for good quality/low hours, bottom for bad quality/high hours
              
              return (
                <div
                  key={`paradox-${index}`}
                  className="absolute text-[9px] text-white bg-blue-500/90 rounded px-1 py-0.5 pointer-events-none z-20"
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {entry.hours <= 6 && entry.quality >= 4 ? '⚡' : '🤔'}
                </div>
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
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