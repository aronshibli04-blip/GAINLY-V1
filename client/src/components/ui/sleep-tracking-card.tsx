import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ComposedChart } from "recharts";
import { Moon, Clock, Coffee, Smartphone, Dumbbell, Brain, UtensilsCrossed, Wine, BarChart3, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface SleepTrackingCardProps {
  className?: string;
}

export function SleepTrackingCard({ className }: SleepTrackingCardProps) {
  const [viewMode, setViewMode] = useState<'logging' | 'chart'>('logging');
  const [chartPeriod, setChartPeriod] = useState<'7D' | '14D' | '30D'>('7D');
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [sleepQuality, setSleepQuality] = useState<number>(7);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  
  // Mock sleep data for different periods
  const generateMockData = (days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const hours = 6.5 + Math.random() * 2.5; // 6.5-9 hours
      const quality = 5 + Math.random() * 4; // 5-9 quality
      return {
        date: format(date, 'MMM dd'),
        dayName: format(date, 'EEE'),
        hours: Number(hours.toFixed(1)),
        quality: Number(quality.toFixed(1))
      };
    });
  };
  
  const getChartData = () => {
    const periodDays = { '7D': 7, '14D': 14, '30D': 30 };
    return generateMockData(periodDays[chartPeriod]);
  };
  
  const chartData = getChartData();
  const weeklyData = chartData.slice(-7).map(d => d.hours);

  const quickHourOptions = [6, 7, 8, 9];
  const sleepGoal = 8; // Fixed 8h goal

  const sleepFactors = [
    { id: "caffeine", label: "Koffein", icon: Coffee, color: "bg-amber-500" },
    { id: "screen", label: "Skjermtid", icon: Smartphone, color: "bg-blue-500" },
    { id: "exercise", label: "Trening", icon: Dumbbell, color: "bg-green-500" },
    { id: "stress", label: "Stress", icon: Brain, color: "bg-purple-500" },
    { id: "food", label: "Mat", icon: UtensilsCrossed, color: "bg-orange-500" },
    { id: "alcohol", label: "Alkohol", icon: Wine, color: "bg-red-500" }
  ];

  const getQualityColor = (quality: number) => {
    if (quality <= 3) return "text-red-400";
    if (quality <= 5) return "text-orange-400";
    if (quality <= 7) return "text-yellow-400";
    if (quality <= 8) return "text-green-400";
    return "text-emerald-400";
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 2) return "Søvnløs";
    if (quality <= 4) return "Dårlig";
    if (quality <= 6) return "OK";
    if (quality <= 8) return "Bra";
    return "Perfekt";
  };

  const getSmartTip = (hours: number, quality: number) => {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 18;
    
    if (hours >= 8 && quality >= 7) return "Fantastisk! Du får nok god søvn 🌟";
    if (hours < 7) return isEvening ? "Legg deg tidligere i kveld for å nå 8t målet 🛏️" : "Prøv å gå til sengs 1 time tidligere 💤";
    if (quality <= 5) return "Vurder å redusere koffein og skjermtid før sengetid ☕📱";
    if (hours >= 8 && quality <= 6) return "Du sover nok timer, men kvaliteten kan forbedres 🧘‍♂️";
    return "Du er på rett vei! Hold oppe gode søvnrutiner 💪";
  };

  const weeklyAverage = weeklyData.reduce((sum, hours) => sum + hours, 0) / weeklyData.length;
  const goalProgress = (weeklyAverage / sleepGoal) * 100;
  
  const getBarColor = (hours: number) => {
    if (hours >= 8) return "hsl(142, 76%, 36%)"; // Green
    if (hours >= 7) return "hsl(217, 91%, 60%)"; // Blue
    return "hsl(25, 95%, 53%)"; // Orange
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

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
        
        <div className="flex gap-2 justify-center">
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
            {sleepQuality}/10 - {getQualityLabel(sleepQuality)}
          </span>
        </div>
        
        <div className="px-1">
          <Slider
            value={[sleepQuality]}
            onValueChange={([value]) => setSleepQuality(value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid="sleep-quality-slider"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Sleep Factors */}
      <div className="mb-3">
        <h4 className="text-xs font-medium text-slate-300 mb-2">Søvnpåvirkere:</h4>
        <div className="flex flex-wrap gap-1.5">
          {sleepFactors.map((factor) => {
            const IconComponent = factor.icon;
            const isSelected = selectedFactors.includes(factor.id);
            return (
              <Badge
                key={factor.id}
                variant="outline"
                className={cn(
                  "cursor-pointer text-xs h-6 px-2 flex items-center gap-1 transition-all",
                  isSelected
                    ? `${factor.color} text-white border-transparent`
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                )}
                onClick={() => toggleFactor(factor.id)}
                data-testid={`sleep-factor-${factor.id}`}
              >
                <IconComponent className="w-3 h-3" />
                {factor.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Smart Tips */}
      <div className="pt-2 border-t border-slate-600">
        <p className="text-slate-400 text-xs text-center leading-relaxed">
          {getSmartTip(sleepHours, sleepQuality)}
        </p>
      </div>
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
              domain={[5, 10]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="quality"
              orientation="right"
              domain={[1, 10]}
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
        {viewMode === 'logging' ? renderLoggingMode() : renderChartMode()}
        
        {/* Toggle Section */}
        <div className="pt-3 mt-3 border-t border-slate-600">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant={viewMode === 'logging' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('logging')}
              className={cn(
                "text-xs h-7 px-3 flex items-center gap-1.5",
                viewMode === 'logging'
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              )}
              data-testid="toggle-logging"
            >
              <Edit3 className="w-3 h-3" />
              Logg Søvn
            </Button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <Button
              variant={viewMode === 'chart' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('chart')}
              className={cn(
                "text-xs h-7 px-3 flex items-center gap-1.5",
                viewMode === 'chart'
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              )}
              data-testid="toggle-chart"
            >
              <BarChart3 className="w-3 h-3" />
              Graf
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}