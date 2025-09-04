# Project Structure

## Root Directory
- **`.env.local`** - Environment variables (copy from `.env.local.example`)
- **`middleware.ts`** - Next.js middleware for Supabase auth
- **`supabase-schema.sql`** - Database schema definitions
- **`country_data/`** - Static country and state data files

## Source Code (`src/`)

### Application Routes (`src/app/`)
Following Next.js App Router conventions:

- **`page.tsx`** - Homepage
- **`layout.tsx`** - Root layout with providers
- **`globals.css`** - Global styles

#### Public Routes
- **`browse/`** - Browse politicians by location
  - `countries/[code]/` - Country-specific politician listings
  - `states/` - State browsing interface
  - `map/` - Interactive map view
- **`politicians/[id]/`** - Individual politician profiles
- **`favourites/`** - User's saved politicians
- **`contact/`** - Contact page
- **`contribute/`** - Contribution guidelines

#### Authentication Routes
- **`auth/callback/`** - OAuth callback handler
- **`auth/auth-code-error/`** - Auth error handling

#### Admin Routes (`admin/`)
Protected admin interface:
- **`dashboard/`** - Admin overview
- **`politicians/`** - Politician management
  - `new/` - Add new politician
  - `[id]/edit/` - Edit existing politician
  - `bulk/` - Bulk operations
- **`user-management/`** - User administration
- **`settings/`** - System settings

#### API Routes (`api/`)
- **`ai/autofill/`** - AI-powered politician data autofill
- **`settings/`** - Settings management
- **`upload-photo/`** - Photo upload handling
- **`test-*`** - Various testing endpoints

### Components (`src/components/`)
- **`ui/`** - shadcn/ui component library
- **`auth/`** - Authentication-related components
- **Core components** - Reusable UI components (Header, Footer, Cards, etc.)

### Business Logic (`src/lib/`)
- **`types.ts`** - TypeScript type definitions
- **`supabase.ts`** / **`supabase-server.ts`** - Database clients
- **`*Service.ts`** - Service layer for data operations
- **`authUtils.ts`** / **`authUtilsServer.ts`** - Authentication utilities
- **`utils.ts`** - General utility functions

### State Management (`src/contexts/`)
- **`AuthContext.tsx`** - Authentication state
- **`FavouritesContext.tsx`** - User favorites state

### Custom Hooks (`src/hooks/`)
- **`use-*.ts`** - Reusable React hooks

### AI Integration (`src/ai/`)
- **`genkit.ts`** - Genkit configuration
- **`flows/`** - AI workflow definitions
- **`dev.ts`** - Development server setup

## Configuration Files
- **`next.config.ts`** - Next.js configuration with image domains
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration with path aliases
- **`components.json`** - shadcn/ui component configuration

## Database Scripts (`scripts/`)
SQL scripts for database setup and maintenance:
- **`create-*.sql`** - Table creation scripts
- **`add-*.sql`** - Data modification scripts

## Documentation (`docs/`)
Setup and troubleshooting guides for various features

## Naming Conventions
- **Files**: kebab-case for pages, PascalCase for components
- **Components**: PascalCase (e.g., `PoliticianCard.tsx`)
- **Utilities**: camelCase (e.g., `authService.ts`)
- **Types**: PascalCase interfaces and types
- **API routes**: kebab-case directories