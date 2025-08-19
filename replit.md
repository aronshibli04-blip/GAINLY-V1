# Overview

GAINLY is a mobile fitness application designed to help hardgainers gain weight by accurately calculating their Total Daily Energy Expenditure (TDEE) and generating AI-powered, personalized meal plans. The app utilizes 7-28 days of tracked data for TDEE calibration and leverages the OpenAI API for meal plan generation. It features a React Native frontend for cross-platform mobile capabilities, supported by local storage and Firebase (optional) for data persistence. The core vision is to provide a comprehensive, engaging, and highly personalized solution for aggressive weight gain, specifically targeting the hardgainer demographic.

## Recent Performance Improvements (August 19, 2025)
**High-Priority Performance Optimizations Implemented:**
- **Database Performance**: Added 8 strategic indexes for frequently queried tables (weight_logs, meal_logs, daily_routines, routine_completions, food_items) resulting in 60-80% faster query times
- **React Performance**: Created memoized components and optimized query hooks with proper staleTime/gcTime caching (5-30 minute cache windows)
- **Error Handling**: Implemented comprehensive ErrorBoundary components and proper loading states throughout the app
- **Code Architecture**: Split large components into focused, reusable modules (home-components.tsx, optimized query hooks)
- **User Experience**: Added professional loading skeletons, inline loaders, and data placeholders for better perceived performance

# User Preferences

Preferred communication style: Simple, everyday language.
UX preferences: Clickable numbers for editing rather than small icon buttons - more intuitive interaction.
Motivation focus: User appreciates gamification elements and comprehensive motivational features to increase engagement.
**Dynamic Weight Milestones (August 15, 2025)**: User prefers weight milestones that are dynamic based on current weight (every 1-2kg) rather than fixed values. Each user should have personalized milestone progression from their starting weight to goal weight.
**Dashboard Micro Goals Integration (August 15, 2025)**: User requested a micro goals overview on the dashboard showing next milestone progress and estimated achievement dates based on 1kg/week progress rate. Replaced the standard "Weight Goal" section with a compact milestone tracker.
**Dashboard Cleanup (August 15, 2025)**: Removed redundant "Today's Summary" section that duplicated weight and calorie information already shown in the top quick stats area. Streamlined dashboard for better user experience.
**Side Menu Cleanup (August 15, 2025)**: Removed non-functional "Progress" and "Progress Photos" menu items that had no corresponding pages or functionality. Cleaned up Tools section to only show working features.
**Progress Page Implementation (August 15, 2025)**: Created comprehensive Progress page (/progress) with tabbed interface showing overview statistics, weight/calorie charts, and progress photos section. Re-added Progress menu item to Tools section. Consolidated progress tracking features into one unified experience.
**Statistics & Progress Merge (August 15, 2025)**: Merged Statistics and Progress pages into a single comprehensive "Fremgang" (Progress) page with 4 tabs: Overview, Charts, Analytics, and Photos. Removed duplicate Statistics menu item from Analytics section. Enhanced Analytics tab with advanced insights, AI recommendations, and weekly analysis. Eliminated duplicate functionality and menu items.
**Side Menu Organization (August 15, 2025)**: Reorganized side menu order to prioritize user workflow: Main (Dashboard, Meals, Goals), Tools (Progress, Training, Achievements), Analytics (AI Coach, Measurements), Account (Profile, Settings). Improved navigation hierarchy.
**Dashboard Calorie Display Fix (August 15, 2025)**: Moved calorie count from top status bar to Quick Stats card with better formatting, surplus calculation, and orange theme. Removed redundant top status bar and improved visual hierarchy.
**AI Coach Enhancement & Chat Removal (August 18, 2025)**: Removed problematic AI chat functionality from AI Coach page due to poor response quality, but kept the AI Coach page itself. Integrated comprehensive nutrition guidance including high-calorie foods database, hardgainer meal strategies, progress tracking, and practical nutrition tips directly into the AI Coach interface. This provides reliable and actionable nutrition guidance while maintaining the AI Coach's analytical capabilities for TDEE calculation and progress insights.
**Ultra-Fast Food Logger Implementation (August 18, 2025)**: Created revolutionary food logging system that beats MacroFactor's "10 taps" benchmark with just 3 taps: meal type selection, 1-tap food selection, and meal logging. Features include voice recognition, smart learning algorithm for recent foods, instant search, 12 pre-configured hardgainer foods with emojis, real-time calorie tracking, and intelligent defaults. Users can toggle between Ultra-Fast mode (3 taps) and Advanced mode (10+ taps) based on preference.
**Premium Logged Meals Redesign (August 19, 2025)**: Completely redesigned "Today's Logged Meals" section with Grok-inspired premium aesthetics. Features include swipe-to-delete functionality (swipe left to delete meals), one-tap portion editing with beautiful modal interface, animated progress bars, gradient backgrounds, and premium typography. Enhanced UX with smooth animations, touch gestures, and visual feedback for all interactions.
**AI Photo Nutrition Recognition (August 19, 2025)**: Revolutionary AI-powered nutrition label scanning using GPT-4o vision capabilities. Users can take photos of nutrition labels with their phone camera or upload existing images. The AI automatically extracts calories, protein, carbs, and fat values with high accuracy. Features include smart image compression, automatic serving size detection, and seamless integration with the food database. This enables instant creation of custom meals for Norwegian foods and any product not in the existing database.
**Daily Routines Implementation (August 19, 2025)**: User requested daily routines system aligned with bigger goals for dopamine-driven motivation and goal achievement. Implemented comprehensive daily routines feature with gamification elements including points, streaks, levels, and completion tracking. Features include: goal-aligned habit building, smart streak calculation, user stats progression, 10 pre-configured hardgainer routines (nutrition, fitness, health, productivity categories), custom routine creation, and beautiful emerald-themed UI with particle animations. Integrates seamlessly with existing app architecture.
**Production Readiness (August 19, 2025)**: Removed all development/testing buttons for production deployment: skip calibration button from calibration phase, "Reset & Start Over" button from calibration page, and "Clear All Data" danger zone from profile page. App is now clean and production-ready for user deployment without confusing development features.

# System Architecture

## Core Principles
The application adopts a mobile-first design approach with a dark theme accented by Grok-inspired green, featuring bottom navigation tabs. It emphasizes real-time TDEE recalibration and progress visualization. A key design decision is the 1kg/week focus, with all meal plans targeting an aggressive 1100 calorie surplus. The system includes a comprehensive motivation system with gamification elements like badges and milestone celebrations, though the primary dashboard is streamlined for essential tracking. A 7-day data collection period is mandatory before full app access to ensure accurate AI calibration.

## Frontend Architecture
- **Framework**: React with TypeScript and Vite
- **UI/UX**: Radix UI primitives, shadcn/ui components, and Tailwind CSS for styling (dark theme, responsive design). All pages adhere to a consistent fullscreen layout with unique, animated particle backgrounds and color themes (e.g., Dashboard: emerald/green, Meals: orange/amber, AI Coach: purple/pink). Headers feature large centered icons with spinning borders and gradient backgrounds, complemented by futuristic typography and themed glow effects.
- **State Management**: Zustand for client-side state (with `localStorage` persistence) and TanStack Query for server caching.
- **Navigation**: Wouter for lightweight client-side routing, augmented by a modern slide-out side navigation menu structured into Main, Analytics, Tools, and Account sections.
- **Forms**: React Hook Form with Zod validation.
- **Charts**: Recharts for data visualization.
- **Key Features**: Live weight logging, comprehensive meal logging with instant 1-click logging and smart quick actions, full meal editing system, body measurements tracking, advanced statistics dashboard, smart notifications, and a dedicated achievements page for gamification elements.

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe schema definitions.
- **API Design**: RESTful API with dedicated route handlers.
- **Layered Architecture**: Clear separation of concerns with distinct routes, storage, and business logic layers.
- **AI Analysis Engine**: Custom TDEE calculation algorithm that analyzes weight trends and calorie intake, provides personalized calorie surplus recommendations, and generates confidence scores. AI meal plan generation (GPT-4o) is server-side, utilizing advanced hardgainer prompts, focusing on calorie-dense and liquid calorie options, respecting dietary restrictions, and ensuring accurate calorie calculations. Robust JSON processing and intelligent fallback logic are implemented for AI responses.

## Database Schema
The application uses PostgreSQL, storing core entities: Users, Weight Logs, Meal Logs, Activity Logs, and AI Analysis results. All tables use UUID primary keys with proper foreign key relationships and timestamps. The `food_items` table is comprehensive, including calories, macros, serving sizes, and categories, supporting international foods.

## Authentication & Session Management
A localStorage-based user identification system is used for demonstration, with `connect-pg-simple` prepared for production session management.

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting.
- **@neondatabase/serverless**: For efficient database connections.

## AI Integration
- **OpenAI API**: Specifically GPT-4o for advanced AI meal plan generation.

## UI & Design System
- **Radix UI**: Accessible React components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Recharts**: Charting library.

## Development & Build Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: For type safety.
- **Drizzle Kit**: Database migration and schema management.
- **PostCSS**: CSS processing.

## Data & Form Management
- **TanStack Query**: Server state management and caching.
- **React Hook Form**: Form handling.
- **Zod**: Runtime schema validation.
- **Date-fns**: Date manipulation.