# Overview

Hardgainer AI is a fitness tracking application designed to help users gain weight through intelligent calorie and activity monitoring. The application combines user data tracking with AI-powered analysis to provide personalized recommendations for achieving weight gain goals. It features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

The frontend follows a component-based architecture with a clear separation between pages, reusable UI components, and business logic. The application uses a mobile-first responsive design approach.

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