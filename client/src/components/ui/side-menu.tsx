import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import {
  Menu,
  X,
  Home,
  Utensils,
  TrendingUp,
  BarChart3,
  Ruler,
  User,
  Brain,
  Zap,
  Target,
  Settings,
  Trophy,
  Calendar,
  Camera
} from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMenu: () => void;
}

export function SideMenu({ isOpen, onClose, onOpenMenu }: SideMenuProps) {
  const [location, navigate] = useLocation();

  const menuItems = [
    {
      section: "Main",
      items: [
        { 
          icon: Home, 
          label: "Dashboard", 
          path: "/", 
          description: "Weight tracking & daily overview",
          badge: null
        },
        { 
          icon: Utensils, 
          label: "Meals", 
          path: "/meals", 
          description: "Log food & track calories",
          badge: "AI"
        },
        { 
          icon: TrendingUp, 
          label: "Mikro Mål", 
          path: "/goals", 
          description: "Weight milestones & rewards",
          badge: "Rewards"
        }
      ]
    },
    {
      section: "Analytics",
      items: [
        { 
          icon: BarChart3, 
          label: "Statistics", 
          path: "/statistics", 
          description: "Detailed analytics & insights",
          badge: "Pro"
        },
        { 
          icon: Brain, 
          label: "AI Coach", 
          path: "/ai-coach", 
          description: "Personal nutrition guidance",
          badge: "GPT-4o"
        },
        { 
          icon: Ruler, 
          label: "Measurements", 
          path: "/measurements", 
          description: "Body measurements tracking",
          badge: null
        }
      ]
    },
    {
      section: "Tools",
      items: [
        { 
          icon: Target, 
          label: "Progress", 
          path: "/progress", 
          description: "Weight trends & goal tracking",
          badge: null
        },
        { 
          icon: Calendar, 
          label: "Training", 
          path: "/training", 
          description: "Workout planning & logging",
          badge: "New"
        },
        { 
          icon: Camera, 
          label: "Progress Photos", 
          path: "/photos", 
          description: "Visual transformation tracking",
          badge: null
        },
        { 
          icon: Trophy, 
          label: "Achievements", 
          path: "/achievements", 
          description: "Gamification & rewards",
          badge: "Fun"
        }
      ]
    },
    {
      section: "Account",
      items: [
        { 
          icon: User, 
          label: "Profile", 
          path: "/profile", 
          description: "Personal info & preferences",
          badge: null
        },
        { 
          icon: Settings, 
          label: "Settings", 
          path: "/settings", 
          description: "App configuration",
          badge: null
        }
      ]
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Side Menu */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-primary/20 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-green-400 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GAINLY</h2>
              <p className="text-xs text-primary/80">AI Weight Gain Coach</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-primary/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation - Fixed scrolling */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                        ${isActive 
                          ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-0.5 ${
                                item.badge === 'AI' || item.badge === 'GPT-4o' 
                                  ? 'bg-primary/20 text-primary border border-primary/30' 
                                  : item.badge === 'New'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {sectionIndex < menuItems.length - 1 && (
                <Separator className="mt-6 bg-white/10" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary/20">
          <div className="bg-gradient-to-r from-primary/10 to-green-400/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI Analysis Ready</p>
                <p className="text-xs text-gray-400">7 days of data collected</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-medium"
              onClick={() => handleNavigation('/ai-coach')}
            >
              Generate Meal Plan
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Menu Toggle Button Component
interface MenuToggleProps {
  onClick: () => void;
  className?: string;
}

export function MenuToggle({ onClick, className = "" }: MenuToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={onClick}
      className={`text-gray-400 hover:text-white hover:bg-primary/20 ${className}`}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}