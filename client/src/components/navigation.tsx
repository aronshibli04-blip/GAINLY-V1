import { Dumbbell, Bell } from "lucide-react";
import type { User } from "@shared/schema";

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const initials = user.firstName.charAt(0).toUpperCase() + (user.username.charAt(0).toUpperCase());

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hardgainer AI</h1>
              <p className="text-xs text-gray-500">Smart Weight Gain</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
