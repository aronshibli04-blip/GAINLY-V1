import React, { useState, useEffect } from 'react';

// Simulated data for demo
const demoData = {
  user: {
    name: 'Alex',
    currentWeight: 72.5,
    calculatedTargetWeight: 85, // FFMI-based target weight
    goalWeight: 82, // Old manual goal for fallback
    startWeight: 68
  },
  todayStats: {
    calories: 2847,
    caloriesGoal: 3500,
    meals: 4,
    weight: 72.5
  },
  recentMeals: [
    { id: 1, name: 'Protein Smoothie', time: '08:30', calories: 850, emoji: '🥤' },
    { id: 2, name: 'Chicken & Rice', time: '13:00', calories: 1200, emoji: '🍖' },
    { id: 3, name: 'Peanut Butter Toast', time: '16:30', calories: 450, emoji: '🥜' },
    { id: 4, name: 'Pasta Bolognese', time: '19:00', calories: 1100, emoji: '🍝' }
  ],
  routines: [
    { id: 1, name: 'Morning Protein', completed: true, streak: 7 },
    { id: 2, name: 'Log Weight', completed: true, streak: 12 },
    { id: 3, name: 'Evening Meal', completed: false, streak: 5 },
    { id: 4, name: 'Workout', completed: true, streak: 3 }
  ]
};

const tabs = [
  { id: 'dashboard', title: 'Dashboard', icon: '🏠', color: '#10b981' },
  { id: 'meals', title: 'Meals', icon: '🍽️', color: '#f59e0b' },
  { id: 'routines', title: 'Routines', icon: '✅', color: '#8b5cf6' },
  { id: 'progress', title: 'Progress', icon: '📈', color: '#ef4444' },
  { id: 'ai', title: 'Coach', icon: '🤖', color: '#06b6d4' },
];

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 px-10">
      <h1 className="text-4xl font-bold text-emerald-500 tracking-wider mb-6">GAINLY</h1>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-slate-400 text-center">Loading your native mobile experience...</p>
    </div>
  );
}

function DashboardContent() {
  const progressPercentage = (demoData.user.currentWeight - demoData.user.startWeight) / 
                            ((demoData.user.calculatedTargetWeight || demoData.user.goalWeight) - demoData.user.startWeight) * 100;
  
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl p-5 border border-emerald-500/20">
        <h2 className="text-xl font-bold text-white mb-1">Welcome back, {demoData.user.name}! 👋</h2>
        <p className="text-emerald-500 text-sm">Ready to gain today?</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{demoData.todayStats.weight}</p>
          <p className="text-xs text-white/80">kg today</p>
        </div>
        <div className="bg-amber-500 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{demoData.todayStats.calories}</p>
          <p className="text-xs text-white/80">calories</p>
        </div>
        <div className="bg-purple-500 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{Math.round(progressPercentage)}%</p>
          <p className="text-xs text-white/80">progress</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 border border-emerald-500/20">
        <h3 className="text-lg font-bold text-white mb-3">🎯 Weight Goal Progress</h3>
        <div className="mb-4">
          <p className="text-white font-medium">
            {demoData.user.currentWeight}kg → {demoData.user.calculatedTargetWeight || demoData.user.goalWeight}kg
          </p>
          <p className="text-emerald-500 text-sm">
            +{(demoData.user.currentWeight - demoData.user.startWeight).toFixed(1)}kg gained
          </p>
        </div>
        <div className="w-full bg-slate-700 rounded-lg h-2 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-lg transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">🏃‍♂️ Today's Routines</h3>
        {demoData.routines.map((routine) => (
          <div key={routine.id} className="flex justify-between items-center py-3 border-b border-slate-700 last:border-b-0">
            <div>
              <p className="text-white font-medium">
                {routine.completed ? '✅' : '⏳'} {routine.name}
              </p>
              <p className="text-emerald-500 text-xs">🔥 {routine.streak} day streak</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealsContent() {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-2">🍽️ Quick Food Logging</h2>
        <p className="text-emerald-500 text-sm mb-4">Log meals in just 3 taps</p>
        
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl p-4 font-bold text-white transition-colors">
          + Quick Log Meal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-500 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{demoData.todayStats.calories}</p>
          <p className="text-xs text-white/80">eaten today</p>
        </div>
        <div className="bg-emerald-500 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">{demoData.todayStats.caloriesGoal - demoData.todayStats.calories}</p>
          <p className="text-xs text-white/80">remaining</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Today's Meals</h3>
        {demoData.recentMeals.map((meal) => (
          <div key={meal.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{meal.emoji}</span>
              <div>
                <p className="text-white font-medium">{meal.name}</p>
                <p className="text-slate-400 text-xs">{meal.time}</p>
              </div>
            </div>
            <p className="text-emerald-500 font-semibold">{meal.calories} kcal</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutinesContent() {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-2">✅ Daily Routines</h2>
        <p className="text-emerald-500 text-sm">Build habits for consistent gains</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Today's Progress</h3>
        {demoData.routines.map((routine) => (
          <div key={routine.id} className="bg-slate-700 rounded-xl p-4 mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <p className="text-white font-medium">
                {routine.completed ? '✅' : '⏳'} {routine.name}
              </p>
              <p className="text-emerald-500 text-sm">🔥 {routine.streak}</p>
            </div>
            <p className="text-slate-400 text-xs">
              {routine.completed ? 'Completed today' : 'Pending'}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">🎮 Gamification</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-500 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-white">Level 12</p>
            <p className="text-xs text-white/80">current</p>
          </div>
          <div className="bg-red-500 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-white">2,450</p>
            <p className="text-xs text-white/80">XP points</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericContent({ title }: { title: string }) {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-2">🚀 {title}</h2>
        <p className="text-emerald-500 text-sm mb-4">Complete tracking and insights</p>
        
        <p className="text-slate-400 text-sm mb-4">
          Comprehensive {title.toLowerCase()} features including:
        </p>
        
        <div className="space-y-2">
          <p className="text-slate-300 text-sm">• Detailed insights and recommendations</p>
          <p className="text-slate-300 text-sm">• Progress analytics and trends</p>
          <p className="text-slate-300 text-sm">• Personalized goal tracking</p>
          <p className="text-slate-300 text-sm">• Achievement system</p>
        </div>
      </div>
    </div>
  );
}

export default function MobileDemo() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'meals':
        return <MealsContent />;
      case 'routines':
        return <RoutinesContent />;
      default:
        return <GenericContent title={tabs.find(t => t.id === activeTab)?.title || 'Feature'} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col max-w-sm mx-auto border-x border-slate-700">
      {/* Mobile Status Bar Simulation */}
      <div className="bg-slate-800 px-4 py-2 flex justify-between items-center text-xs text-white">
        <span>9:41</span>
        <span>GAINLY Native</span>
        <span>100%</span>
      </div>
      
      {/* Header */}
      <div className="bg-slate-800 p-5 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-emerald-500 text-center">GAINLY</h1>
        <p className="text-slate-400 text-sm text-center">Native Mobile App</p>
      </div>
      
      {/* Content */}
      {renderContent()}
      
      {/* Bottom Navigation */}
      <div className="bg-slate-800 px-2 py-3 border-t border-slate-700">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'text-slate-400'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}