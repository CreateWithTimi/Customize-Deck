# Conversation Deck Builder

## Overview

A premium, gamified e-commerce MVP for building customizable 52-card conversation decks designed for relationships and meaningful conversations. Users create a balanced mix across five categories (Romantic, Deep, Naughty, Friendship, Playful) to build their personalized deck, select a card back design, and complete checkout for a physical product.

The application follows a multi-step wizard flow: Landing → Customize (category selection) → Card Back → Preview → Checkout → Success.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, localStorage for deck configuration persistence
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Server**: HTTP server with Vite dev middleware in development, static file serving in production

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all database tables and Zod validation schemas
- **Client State**: localStorage persists deck configuration with sanitization and validation layer (`client/src/lib/deck-state.ts`)

### Key Design Patterns
- **Shared Types**: `shared/` directory contains schemas used by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared directory
- **Page Guards**: Navigation protection ensures users complete steps in order (deck must have 52 cards before card-back selection, card-back required before preview)
- **Validation-First**: Deck state is sanitized and validated on every read, totals are recalculated rather than trusted from storage

### Animation Layer
- **Rive Integration**: `@rive-app/canvas` for interactive animations and gamification elements
- **Centralized Manager**: `client/src/lib/rive-manager.ts` provides:
  - Asset caching (files only downloaded once)
  - Visibility-based pause/resume (saves CPU when offscreen via IntersectionObserver)
  - Tab visibility handling (pauses all when tab hidden)
  - Proper lifecycle management and cleanup
- **Asset Manifest**: `client/src/lib/rive-manifest.ts` defines all animations with:
  - Expected artboard and state machine names
  - Input definitions (triggers, booleans, numbers)
  - Validation on load to catch naming mismatches early
- **Usage Pattern**: Use `useRiveManaged` hook with asset IDs from manifest
- **Assets Location**: `.riv` files stored in `client/public/`
- **Current Animations**:
  - `hero` - Landing page hero animation
  - `romanticIcon`, `deepIcon`, `naughtyIcon`, `friendshipIcon`, `playfulIcon` - Category icons with +/- triggers
  - `celebrationDesktop`, `celebrationMobile` - Full-screen celebration overlay when deck reaches 52 cards

### Multi-Step Flow
1. **Customize**: Adjust category counts with +/- controls, must total exactly 52
2. **Card Back**: Select from predefined card back designs via carousel
3. **Preview**: Review deck composition and card back selection
4. **Checkout**: Shipping form with validation, quantity selector (1-10 decks), dynamic pricing
5. **Success**: Order confirmation with deck state cleanup

### Pricing & Quantity
- **Currency**: Nigerian Naira (₦ / NGN)
- **Base Price**: ₦20,000 per deck (DECK_PRICE constant in schema)
- **Quantity Range**: 1-10 decks per order (MAX_QUANTITY constant)
- **Shipping**: Free for all orders
- **Price Formatting**: Use `formatPrice()` helper from schema for consistent currency display

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with schema-driven migrations
- **connect-pg-simple**: Session storage for Express (configured but sessions may not be active)

### UI/Animation
- **Radix UI**: Accessible component primitives (dialog, popover, accordion, etc.)
- **Rive**: Canvas-based animation runtime for interactive elements
- **Embla Carousel**: Touch-friendly carousel for card back selection

### Form Handling
- **react-hook-form**: Form state management with validation
- **Zod**: Schema validation shared between client and server
- **@hookform/resolvers**: Zod integration for react-hook-form

### Build/Dev Tools
- **Vite**: Development server with HMR and production bundling
- **esbuild**: Server-side bundling for production deployment
- **Tailwind CSS**: Utility-first styling with custom configuration