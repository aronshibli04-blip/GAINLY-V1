import { useState, useEffect, useRef } from "react";
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
  Camera,
  Apple
} from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMenu: () => void;
}

export function SideMenu({ isOpen, onClose, onOpenMenu }: SideMenuProps) {
  const [location, navigate] = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

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
          badge: null
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
      section: "Tools",
      items: [
        { 
          icon: Target, 
          label: "Progress", 
          path: "/progress", 
          description: "Charts, photos & detailed tracking",
          badge: "New"
        },
        { 
          icon: Calendar, 
          label: "Training", 
          path: "/training", 
          description: "Workout planning & logging",
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
      section: "Analytics",
      items: [
        { 
          icon: Brain, 
          label: "Coach", 
          path: "/ai-coach", 
          description: "Nutrition guidance",
          badge: "Enhanced"
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
        },
        { 
          icon: Apple, 
          label: "About", 
          path: "/about", 
          description: "About Gainly",
          badge: null
        }
      ]
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Focus management, escape handling, and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !navRef.current) return;
      
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Strengthen focus trap for Tab/Shift+Tab
      if (e.key === 'Tab') {
        const focusableElements = navRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // If focus is outside the menu, redirect to first element
        if (!navRef.current.contains(document.activeElement)) {
          firstElement?.focus();
          e.preventDefault();
          return;
        }
        
        if (e.shiftKey) {
          // Shift+Tab: If on first element, go to last
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          // Tab: If on last element, go to first
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      // Save currently focused element to restore later using ref
      openerRef.current = document.activeElement as HTMLElement;
      
      // Focus the close button when menu opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to opener element (MenuToggle)
      if (openerRef.current) {
        openerRef.current.focus();
        openerRef.current = null;
      }
      
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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
          aria-hidden="true"
          data-testid="side-menu-backdrop"
        />
      )}

      {/* Side Menu */}
      <nav 
        ref={navRef}
        id="side-menu"
        className={`
          fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-primary/20 
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation menu"
        aria-hidden={!isOpen}
        data-testid="side-menu"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-green-400 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GAINLY</h2>
              <p className="text-xs text-primary/80">Weight Gain Coach</p>
            </div>
          </div>
          <Button 
            ref={closeButtonRef}
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-primary/20"
            aria-label="Close navigation menu"
            data-testid="close-side-menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
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
                      aria-label={`Navigate to ${item.label}: ${item.description}`}
                      aria-current={isActive ? "page" : undefined}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
                <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Your plan is ready</p>
                <p className="text-xs text-gray-400">7 days of data collected</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-medium"
              onClick={() => handleNavigation('/ai-coach')}
              aria-label="Generate AI meal plan"
              data-testid="generate-meal-plan"
            >
              Generate Meal Plan
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}

// Menu Toggle Button Component
interface MenuToggleProps {
  onClick: () => void;
  className?: string;
  isOpen?: boolean;
}

export function MenuToggle({ onClick, className = "", isOpen = false }: MenuToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={onClick}
      className={`text-gray-400 hover:text-white hover:bg-primary/20 ${className}`}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      aria-controls="side-menu"
      data-testid="menu-toggle"
    >
      <Menu className="h-6 w-6" aria-hidden="true" />
    </Button>
  );
}