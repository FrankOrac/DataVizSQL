# replit.md

## Overview

This is a modern full-stack web application that provides a natural language to SQL interface with data visualization capabilities. The system allows users to write queries in plain English, automatically converts them to SQL, executes the queries against a database, and provides interactive data visualization options.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a clean separation between frontend and backend with a shared schema layer:

- **Frontend**: React application built with Vite, using TypeScript and modern UI components
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Shared Layer**: Common TypeScript schemas and types used by both frontend and backend

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints for query translation, execution, and visualization
- **External Services**: OpenAI integration for natural language processing
- **Development**: Hot module replacement with Vite integration

### Database Layer
- **Primary Database**: PostgreSQL (configured via Drizzle)
- **Sample Data**: In-memory SQLite with pre-populated sales data for demonstration
- **Schema Management**: Drizzle migrations in `./migrations` directory
- **Connection**: Neon Database serverless PostgreSQL integration

### Core Features
1. **Natural Language Processing**: Converts plain English to SQL queries using OpenAI
2. **Query Execution**: Safe SQL execution with result formatting
3. **Data Visualization**: Interactive charts (bar, line, pie, scatter) using React components
4. **Query Management**: Save, load, and manage query history
5. **Export Functionality**: Data export in multiple formats

## Data Flow

1. **Query Input**: User enters natural language query
2. **Translation**: OpenAI service converts natural language to SQL
3. **Execution**: Database service executes SQL query safely
4. **Results**: Query results are formatted and returned
5. **Visualization**: Optional chart generation from query results
6. **Storage**: Queries and visualizations can be saved to database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **better-sqlite3**: Local SQLite for development/demo data
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Comprehensive UI component library
- **openai**: Natural language processing integration

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend and backend with HMR
- **Database**: Uses in-memory SQLite with sample data for immediate functionality
- **Hot Reloading**: Vite provides instant feedback for frontend changes

### Production
- **Build Process**: `npm run build` creates optimized bundles
- **Frontend**: Static files served from Express server
- **Backend**: Single Node.js process serving both API and static assets
- **Database**: PostgreSQL via Neon Database serverless platform

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required for production)
- **OPENAI_API_KEY**: Required for natural language processing features
- **NODE_ENV**: Controls development vs production behavior

The application is designed to work immediately in development with sample data while being ready for production deployment with proper database and API key configuration.

## Recent Changes (July 28, 2025)

### Fixed Non-Clickable Features
- **Share Query**: Now copies shareable link to clipboard after executing a query
- **Save Query**: Properly saves queries with PATCH request to backend API
- **Sidebar Buttons**: Added functionality to all previously non-clickable buttons
- **Chart Builder**: Made all export and generation buttons interactive with user feedback
- **SQL Editor**: Made SQL query text area fully editable with real-time updates

### OpenAI Integration Improvements
- **Fallback System**: Implemented smart pattern matching when OpenAI API quota is exceeded
- **Error Handling**: Added graceful degradation from AI translation to pattern-based SQL generation
- **Sample Queries**: Added demo query buttons for common use cases (sales by region, top customers, etc.)
- **User Experience**: Clear messaging when using fallback vs AI-generated queries

### UI/UX Enhancements
- **Demo Queries Component**: Added clickable sample queries for immediate user engagement
- **Interactive Feedback**: All buttons now provide visual feedback and appropriate messaging
- **Error Recovery**: Better error handling throughout the application with user-friendly messages

The application now works fully even without OpenAI API access, using intelligent pattern matching for common queries.