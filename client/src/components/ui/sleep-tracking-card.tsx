import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ComposedChart } from "recharts";
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
  const [showChart, setShowChart] = useState(false);
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
  
  // Auto-return to logging mode after showing chart
  useEffect(() => {
    if (showChart) {
      const timer = setTimeout(() => {
        setShowChart(false);
      }, 4000); // 4 seconds
      return () => clearTimeout(timer);
    }
  }, [showChart]);
  
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
      // Show chart automatically after successful save
      setShowChart(true);
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Velg søvntimer</DialogTitle>
                <DialogDescription>
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
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
        <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          Søvnstatistikk
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
                  ? "bg-blue-500 text-white"
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
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
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
              domain={[1, 5]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            
            {/* 8h Goal Line */}
            <ReferenceLine 
              yAxisId="hours"
              y={8} 
              stroke="#ffffff" 
              strokeDasharray="3 3" 
              opacity={0.7}
            />
            
            {/* Hours Bars */}
            <Bar 
              yAxisId="hours"
              dataKey="hours" 
              fill="hsl(217, 91%, 60%)"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
            
            {/* Quality Line */}
            <Line 
              yAxisId="quality"
              type="monotone" 
              dataKey="quality" 
              stroke="hsl(168, 85%, 57%)"
              strokeWidth={2}
              dot={{ fill: "hsl(168, 85%, 57%)", strokeWidth: 0, r: 2 }}
              activeDot={{ r: 4, fill: "hsl(168, 85%, 57%)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded"></div>
            <span className="text-slate-400">Timer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-teal-400 rounded"></div>
            <span className="text-slate-400">Kvalitet</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-white opacity-70"></div>
            <span className="text-slate-400">8t mål</span>
          </div>
        </div>
        <div className="text-slate-400">
          Ø: {weeklyAverage.toFixed(1)}t
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