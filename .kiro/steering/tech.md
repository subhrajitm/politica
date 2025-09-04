# Technology Stack

## Framework & Runtime
- **Next.js 15.3.3** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **Supabase SSR** - Server-side rendering integration
- **Firebase** - Additional services integration

## AI & Machine Learning
- **Google Genkit** - AI development framework
- **Google AI** - LLM integration for politician data autofill and summaries

## UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless component primitives
- **Lucide React** - Icon library
- **shadcn/ui** - Component system built on Radix + Tailwind

## Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Hookform Resolvers** - Form validation integration

## Development Tools
- **Turbopack** - Fast bundler for development
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run genkit:dev   # Start Genkit AI development server
npm run genkit:watch # Start Genkit with file watching
```

### Build & Deploy
```bash
npm run build        # Build production application
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

### Environment Setup
- Copy `.env.local.example` to `.env.local`
- Configure Supabase credentials
- Set up Google AI API keys for Genkit integration