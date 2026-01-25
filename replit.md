# Volleyball Team Scheduler

## Overview

A web application for coordinating volleyball team availability. Players log in with their name, view a weekly schedule grid, and toggle their availability for specific time slots. The app displays a heatmap showing how many players are available for each slot, helping teams find optimal game times.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and interactions
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Pattern**: REST endpoints defined in shared route contracts (`shared/routes.ts`)
- **Validation**: Zod schemas shared between client and server for type-safe API contracts
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Storage
- **Database**: PostgreSQL
- **Schema**: Two tables - `users` (id, username, createdAt) and `availability` (id, userId, date, slot)
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)

### Authentication
- Simple username-based identification stored in browser localStorage
- No password required - users enter their name to join
- User records created on first login if username doesn't exist

### Key Design Decisions

1. **Shared API Contracts**: The `shared/routes.ts` file defines API paths, HTTP methods, input schemas, and response types. Both client and server import from this file, ensuring type safety across the stack.

2. **Storage Abstraction**: The `IStorage` interface in `server/storage.ts` abstracts database operations, making it easy to swap implementations if needed.

3. **Optimistic Updates**: The availability toggle uses TanStack Query's mutation patterns with query invalidation for responsive UI.

4. **Russian Localization**: The UI is in Russian, using `date-fns` with the `ru` locale for date formatting.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### UI Components
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Accessible, unstyled component primitives
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Runtime Libraries
- **TanStack Query**: Server state management and caching
- **Framer Motion**: Animation library
- **date-fns**: Date manipulation and formatting
- **Zod**: Schema validation
- **wouter**: Client-side routing