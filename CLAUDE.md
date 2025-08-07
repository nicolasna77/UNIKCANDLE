# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UNIKCANDLE is a Next.js 15 e-commerce application for customizable candles with unique features like AR visualization, scent selection, audio recording, and QR code integration. The app uses React 19, TypeScript, Prisma with PostgreSQL, and deploys on Vercel.

## Development Commands

```bash
# Development
npm run dev                    # Start development server with Turbopack
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database
npm run db:generate           # Generate Prisma client
npm run db:seed              # Seed database with sample data
npx prisma studio            # Open Prisma Studio
npx prisma migrate dev       # Run database migrations

# Deployment
npm run vercel-build         # Production build with DB setup for Vercel
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with Google OAuth and One Tap
- **UI**: shadcn/ui components with Radix UI and Tailwind CSS 4
- **Payment**: Stripe integration
- **File Storage**: Vercel Blob
- **Email**: Resend
- **3D Graphics**: Three.js with React Three Fiber

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── (local)/           # Public pages (products, auth, cart, etc.)
│   ├── (private)/         # Admin-only pages with role-based access
│   ├── api/               # API routes organized by feature
│   └── actions/           # Server actions
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── admin/            # Admin-specific components
│   └── sections/         # Page sections
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── context/              # React context providers
├── emails/               # React Email templates
└── types/                # TypeScript type definitions
```

### Database Schema

The Prisma schema (`prisma/schema.prisma`) includes:

- **Users**: Authentication with Better Auth, role-based access
- **Products**: Candles with categories, scents, images, and AR animations
- **Orders**: Complete order management with items, addresses, and status tracking
- **Reviews**: Product ratings and comments
- **Returns**: Full return management system with tracking and refunds
- **QR Codes**: Generated for each order item for AR experiences

### Authentication & Authorization

- **Better Auth** setup in `src/lib/auth.ts` with Google OAuth and One Tap
- **Middleware** (`middleware.ts`) handles route protection:
  - Public routes: `/`, `/products`, `/about`, `/contact`
  - Auth routes: `/sign-in`, `/sign-up`
  - Protected: All other routes require authentication
  - Admin routes: `/admin/*` requires `role === "admin"`

### API Architecture

RESTful API routes in `src/app/api/` organized by feature:

- **Admin routes** (`/api/admin/*`): Protected, require admin role
- **Public routes**: Products, categories, scents, reviews
- **User routes**: Cart, orders, returns
- **Upload routes**: File handling for images, audio, avatars
- **Stripe webhook**: Payment processing

## Development Guidelines

### Database Workflow

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Run `npm run db:generate` to update Prisma client
4. Update TypeScript types in `src/types/` if needed

### File Upload

- Images: Uploaded to Vercel Blob via `/api/upload/image`
- Audio: Custom voice recordings for candles via `/api/upload/audio`
- Avatars: User profile pictures via `/api/upload/avatar`

### Component Conventions

- Use shadcn/ui components from `@/components/ui`
- Custom hooks in `@/hooks` for data fetching (useProducts, useOrders, etc.)
- Admin components separated in `@/components/admin`
- Form validation using react-hook-form with Zod schemas

### State Management

- React Query (TanStack Query) for server state
- React Context for cart state (`src/context/CartContext.tsx`)
- Local state with useState/useReducer for UI state

### Styling

- Tailwind CSS 4 configuration
- CSS variables for theming in `src/app/globals.css`
- Component variants using class-variance-authority

### Testing

- No specific test framework configured - check with user before assuming testing approach

## Key Features

### E-commerce Core

- Product catalog with categories and scent selection
- Shopping cart with persistent state
- Stripe checkout and payment processing
- Order management and tracking
- Return system with admin approval workflow

### Unique Candle Features

- **AR Integration**: 3D candle models with custom animations
- **Audio Recording**: Customers can add voice messages to candles
- **QR Code Generation**: Each order item gets a unique QR code for AR experience
- **Scent Customization**: Multiple scent options with visual color coding

### Admin Dashboard

- User management with banning capabilities
- Product, category, and scent CRUD operations
- Order tracking and status management
- Return request handling with refund processing
- Analytics dashboard

## Environment Setup

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_URL`: Base URL for authentication
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Payment processing
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage
- `RESEND_API_KEY`: Email service

## Common Patterns

### Data Fetching

```typescript
// Use custom hooks for consistent data fetching
const { data: products, isLoading } = useProducts();
const { data: categories } = useCategories();
```

### Error Handling

- API routes return standardized error responses
- Client-side error boundaries for UI error handling
- Form validation with detailed error messages

### Type Safety

- Strict TypeScript configuration
- Prisma-generated types for database models
- Zod schemas for runtime validation
- Better Auth type inference for sessions
