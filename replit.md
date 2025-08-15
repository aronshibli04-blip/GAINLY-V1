# Overview

GAINLY is a mobile fitness application designed to help hardgainers gain weight by accurately calculating their Total Daily Energy Expenditure (TDEE) and generating AI-powered, personalized meal plans. The app utilizes 7-28 days of tracked data for TDEE calibration and leverages the OpenAI API for meal plan generation. It features a React Native frontend for cross-platform mobile capabilities, supported by local storage and Firebase (optional) for data persistence. The core vision is to provide a comprehensive, engaging, and highly personalized solution for aggressive weight gain, specifically targeting the hardgainer demographic.

# User Preferences

Preferred communication style: Simple, everyday language.
UX preferences: Clickable numbers for editing rather than small icon buttons - more intuitive interaction.
Motivation focus: User appreciates gamification elements and comprehensive motivational features to increase engagement.

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