# Overview

GAINLY is a comprehensive mobile fitness application designed to help hardgainers gain weight through intelligent TDEE calculation and AI-powered meal plan generation. The app uses 7-28 days of tracked data to calculate actual TDEE, then leverages OpenAI API to generate personalized meal plans. It features a React Native frontend with cross-platform mobile capabilities, utilizing local storage and optional Firebase integration for data persistence.

## Recent Changes (August 2025)
- **Complete GAINLY Implementation**: Built comprehensive mobile-first weight gain tracking app
- **Goal Weight Feature**: Added goal weight setting with progress tracking and time-to-goal calculations
- **Real-Time TDEE Calibration**: AI continuously recalibrates TDEE with each data entry for maximum accuracy
- **Subtle UI Updates**: Replaced prominent "AI Analysis Ready" status with discrete real-time calibration indicators
- **Mobile-First Design**: Dark theme with Grok-inspired green accents and bottom navigation tabs
- **1kg/Week Focus**: All meal plans use aggressive 1100 calorie surplus targeting rapid hardgainer gains
- **Live Weight Logging**: Front-page weight entry with immediate TDEE updates and progress visualization
- **Comprehensive Motivation System**: Added achievements, daily challenges, progress celebrations, and points system
- **Gamification Elements**: Badge system with rarity levels, milestone celebrations, and visual progress indicators
- **User Interface Refinement**: Clickable goal weight numbers instead of pencil icons for better UX
- **7-Day AI Calibration Period**: Implemented mandatory 7-day data collection before full app access
- **Text-Based Activity Descriptions**: Replaced dropdown with detailed text input for precise activity tracking
- **Enhanced AI Capabilities Showcase**: Added 6-card grid highlighting neural network features
- **Futuristic Calibration Interface**: Created dedicated calibration mode with progress tracking and sci-fi aesthetics
- **AI Meal Plan Upgrade (August 11, 2025)**: Improved meal plan generation with GPT-4o integration
  - **Server-Side OpenAI Integration**: Moved AI generation to backend with environment secret key management
  - **Advanced Hardgainer Prompts**: Specialized nutrition expertise for aggressive weight gain goals
  - **Calorie-Dense Focus**: Optimized for minimal food volume with maximum caloric density
  - **Norwegian Ingredient Support**: Localized meal plans with specific regional ingredients
  - **Liquid Calorie Emphasis**: Strategic smoothies and protein shakes for low appetite periods
  - **Dietary Restrictions Compliance**: AI now properly follows user preferences (no oatmeal, no liquid protein shakes)
  - **Accurate Calorie Calculations**: Fixed ingredient-to-meal calorie alignment and total target matching
  - **Reliable Fallback System**: Hardgainer-specific backup meal plans ensure consistent functionality
  - **Enhanced JSON Processing**: Improved OpenAI response parsing with truncation recovery and increased token limits
  - **Intelligent Fallback Logic**: Fallback system now dynamically respects dietary restrictions
  - **Consistent Performance**: Fixed repetitive meal generation issues with proper AI prompt engineering
- **Major App Enhancements (August 10, 2025)**: Implemented comprehensive feature expansion
  - **Body Measurements Tracking**: Complete measurements page with chest, waist, arms, thighs, shoulders, body fat tracking
  - **Advanced Statistics Dashboard**: Comprehensive analytics with weight/calorie charts, AI insights, performance metrics
  - **Smart Notifications System**: Intelligent reminders, achievement alerts, progress milestones, consistency tracking
  - **Enhanced Meal Logger**: Barcode scanning simulation, photo analysis, detailed nutrition tracking, macro breakdown
  - **Comprehensive Profile Management**: Full user profile with editable info, achievements, progress visualization
  - **Expanded Navigation**: Added Statistics and Measurements pages to bottom navigation
  - **Progress Photos Integration**: Framework for transformation photos and visual progress tracking

# User Preferences

Preferred communication style: Simple, everyday language.
UX preferences: Clickable numbers for editing rather than small icon buttons - more intuitive interaction.
Motivation focus: User appreciates gamification elements and comprehensive motivational features to increase engagement.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast web development
- **UI Library**: Radix UI primitives with shadcn/ui components and Tailwind CSS
- **Styling**: Tailwind CSS with dark theme support and responsive design
- **State Management**: Zustand for client-side state with localStorage persistence and TanStack Query for server caching
- **Navigation**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **AI Integration**: OpenAI API (GPT-4o) for intelligent meal plan generation with server-side secret key management
- **Storage**: Browser localStorage for data persistence with Zustand persist middleware
- **Charts**: Recharts for weight progress visualization and data trends

The web app follows a component-based architecture with clean separation between UI, state management, and business logic layers.

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with type-safe schema definitions
- **API Design**: RESTful API with dedicated route handlers
- **Data Layer**: Storage abstraction layer separating business logic from database operations
- **AI Analysis**: Custom TDEE (Total Daily Energy Expenditure) calculation algorithm

The backend implements a layered architecture with clear separation of concerns:
- Routes layer for HTTP request handling
- Storage layer for data access abstraction  
- Business logic layer for AI analysis and calculations

## Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Profile information including physical stats and activity levels
- **Weight Logs**: Daily weight tracking entries
- **Meal Logs**: Calorie intake tracking with descriptions
- **Activity Logs**: Daily activity type logging (training, work, rest)
- **AI Analysis**: Calculated TDEE and calorie recommendations

All tables use UUID primary keys and include proper foreign key relationships and timestamps.

## Authentication & Session Management
The application uses a simple localStorage-based user identification system for demonstration purposes. Session management is handled through connect-pg-simple for production deployment readiness.

## Data Flow & State Management
- Client-side state is managed through TanStack Query for server synchronization
- Form state uses React Hook Form with Zod schema validation
- UI state is handled through React's built-in state management
- Toast notifications provide user feedback for actions

## AI Analysis Engine
The application includes a custom AI analysis system that:
- Calculates TDEE based on weight trends and calorie intake
- Provides personalized calorie surplus recommendations
- Analyzes weight gain progress and suggests adjustments
- Generates confidence scores for recommendations

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Pooling**: @neondatabase/serverless for efficient database connections

## UI & Design System
- **Radix UI**: Comprehensive set of accessible React components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart library for data visualization

## Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools

## Data & Form Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime schema validation
- **Date-fns**: Date manipulation and formatting utilities

## Deployment & Development
- **Replit Integration**: Development environment with specialized plugins
- **PostCSS**: CSS processing with Tailwind integration
- **WebSocket Support**: Real-time capabilities through ws library