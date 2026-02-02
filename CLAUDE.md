# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UNIKCANDLE is a Next.js 16 e-commerce application for customizable candles with AR visualization, scent selection, audio recording, and QR code integration. Built with React 19, TypeScript, Prisma with PostgreSQL, and deployed on Vercel.

## Development Commands

```bash
# Development
npm run dev                    # Start development server with Turbopack
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database
npm run db:generate           # Generate Prisma client (also runs on postinstall)
npm run db:seed              # Seed database with sample data
npx prisma studio            # Open Prisma Studio GUI
npx prisma migrate dev       # Create and apply new migration
npx prisma db push          # Push schema changes without migration (dev only)

# Deployment
npm run vercel-build         # Vercel build: generate Prisma client + push schema + build
```

## Tech Stack

- **Framework**: Next.js 16.0.10 with App Router
- **React**: 19.2.1 with Server Components
- **Database**: PostgreSQL with Prisma 7.1.0 (adapter-pg for connection pooling)
- **Authentication**: Better Auth 1.4.5 with Google OAuth + One Tap plugin
- **UI**: shadcn/ui + Radix UI + Tailwind CSS 4
- **Forms**: react-hook-form 7.55 + Zod 3.25 validation
- **State**: TanStack Query 5.71.5 + React Context (cart)
- **Payment**: Stripe 18.1.0
- **File Storage**: Vercel Blob 0.27.3
- **Email**: Resend 4.2.0 with React Email templates
- **3D/AR**: Three.js 0.174 + React Three Fiber 9.1 + React Three Drei 10.0
- **i18n**: next-intl 4.5.5 (French/English)
- **TypeScript**: 5.8.2 with strict mode

## Critical Architecture Notes

### Proxy Configuration (Next.js 16)

**IMPORTANT**: Next.js 16 renamed `middleware.ts` → `proxy.ts`. This project is correctly configured.

Current setup:
- File location: `src/proxy.ts` with `proxy()` function
- Automatic execution: Next.js 16 recognizes and runs proxy on matched routes
- Protected routes: All non-public routes require authentication
- Admin routes: `/admin/*` requires `role === "admin"`
- Public routes: `/`, `/products`, `/about`, `/contact`, `/cart`, `/ar`
- Auth routes: `/auth/signin`, `/auth/signup`, password reset routes

The proxy handles:
1. next-intl locale detection and routing (integrates createMiddleware from next-intl)
2. Better Auth session validation via `auth.api.getSession()`
3. Role-based access control for admin routes
4. Redirect to signin for unauthenticated users
5. Single source of truth for authentication - no duplicate checks in layouts

### Authentication & Authorization

Better Auth configured in `src/lib/auth.ts`:
- Email/password with email verification required
- Google OAuth with One Tap plugin
- Session expires: 7 days
- Admin plugin with role-based access
- Email flows: verification, password reset, welcome (via Resend)

**Authentication Flow**: All auth checks happen in `src/proxy.ts` - layouts and pages trust that authentication has been validated by the proxy.

### Database Models (Prisma)

Core entities in `prisma/schema.prisma`:

- **User**: Better Auth managed, with `role` ("admin" or null), `banned`, `banExpires`, orders, reviews
- **Product**: Name (FR/EN), description, price, subtitle, slogan, `messageType` ("audio"/"text"), `arAnimation`, scent, category, images, soft-delete with `deletedAt`
- **Category**: Name/description (i18n), icon, color, imageUrl, soft-delete
- **Scent**: Name/description (i18n), icon, color, notes array
- **Order**: User, status (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED), items, total, Stripe payment intent, refund data, shipping address
- **OrderItem**: Product, quantity, price, scent, audioUrl OR textMessage, animationId, QRCode
- **QRCode**: Unique code per order item for AR experience
- **Return**: Linked to OrderItem, status flow (REQUESTED→APPROVED→RETURN_SHIPPING_SENT→RETURN_IN_TRANSIT→RETURN_DELIVERED→PROCESSING→COMPLETED), tracking, refund via Stripe
- **Review**: User rating and comment on product
- **Address**: Shipping address linked to order
- **TemporaryOrder**: Holds incomplete orders with expiration

Key patterns:
- Soft deletes on Product and Category via `deletedAt`
- i18n fields: `name`/`nameEN`, `description`/`descriptionEN`
- Stripe integration: `stripePaymentIntentId`, `stripeRefundId` fields
- Cascade deletes: OrderItem → Order, Address → Order, QRCode → OrderItem

### Route Structure

```
src/app/[locale]/
├── (local)/              # Public pages (RSC)
│   ├── page.tsx         # Homepage
│   ├── products/        # Product catalog and detail pages
│   ├── about/
│   ├── contact/
│   ├── cart/
│   ├── ar/              # AR viewer pages
│   └── auth/            # Sign in/up, password reset
│
├── (private)/           # Protected routes (requires auth)
│   ├── admin/           # Admin dashboard (requires role="admin")
│   │   ├── page.tsx    # Analytics dashboard
│   │   ├── products/   # Product management CRUD
│   │   ├── orders/     # Order tracking and status updates
│   │   ├── returns/    # Return request handling
│   │   ├── users/      # User management and banning
│   │   └── scents/     # Scent management
│   └── profil/          # User profile pages
│
├── layout.tsx           # Root layout with providers
├── error.tsx            # Error boundary
├── not-found.tsx        # 404 page
└── unauthorized.tsx     # 403 page

api/
├── auth/[...all]/       # Better Auth endpoints
├── products/            # Product listing, detail, reviews
├── categories/          # Category CRUD
├── scents/              # Scent listing
├── orders/              # Order creation, listing, invoice, cancel
├── returns/             # Return request creation
├── cart/                # Cart operations
├── qr/                  # QR code data retrieval
├── upload/              # Image, audio, avatar uploads to Vercel Blob
├── admin/               # Admin-protected API routes
│   ├── products/       # Admin product CRUD + upload
│   ├── orders/         # Admin order management
│   ├── returns/        # Return approval, tracking, refunds
│   ├── scents/         # Admin scent CRUD + upload
│   ├── users/          # User ban/unban
│   └── dashboard/      # Analytics data
├── create-checkout-session/  # Stripe checkout
└── webhooks/stripe/     # Stripe payment webhooks
```

### Component Organization

```
src/components/
├── ui/                  # shadcn/ui base components (40+ components)
├── admin/               # Admin-specific components
│   ├── forms/          # Admin forms (product, category, scent, order status)
│   ├── stats-card.tsx
│   ├── recent-orders.tsx
│   └── admin-sidebar.tsx
├── forms/               # Public forms organized by feature
│   ├── auth/           # Sign in/up forms
│   ├── products/       # Product selection, scent picker
│   ├── order/          # Checkout, address forms
│   └── returns/        # Return request form
├── sections/            # Page sections (hero, features, FAQ, etc.)
├── skeleton/            # Loading skeletons
├── magicui/             # Animation/visual effects (particles, borders, etc.)
├── product-card.tsx
├── category-card.tsx
├── scent-card.tsx
├── order-card.tsx
├── review-section.tsx
├── qr-code.tsx
├── audio-recorder.tsx
└── three/               # Three.js components for AR
```

### Server Actions vs API Routes

**Server Actions** (`src/app/actions/`):
- For form submissions with progressive enhancement
- Used by: products, categories, scents, reviews, returns, newsletter, contact
- Pattern: Accept FormData, validate with Zod, return ActionResponse<T>
- Always include server-side auth check and role validation
- Use revalidatePath() or revalidateTag() for cache invalidation

**API Routes** (`src/app/api/`):
- For data fetching (GET), complex operations, webhooks
- Used by: product listing/detail, order management, file uploads, Stripe
- Pattern: Standard Next.js route handlers with Response

**Service Layer** (`src/services/`):
- Client-side API fetch wrappers for React Query
- Currently only: categories, products, returns, scents
- Pattern: fetch() calls to API routes with typed responses

**Missing Service Layer**: No service wrappers for orders, users, or payments. These features use API routes directly or Server Actions.

### State Management

1. **Server State**: TanStack Query (`src/providers/QueryProvider.tsx`)
   - React Query wraps the app for data fetching and caching
   - Service layer functions used with `useQuery` hooks
   - No custom hooks like `useProducts()` exist yet

2. **Cart State**: React Context (`src/context/CartContext.tsx`)
   - Global cart with add/remove/update/clear operations
   - Persisted to localStorage
   - No auth context despite Better Auth integration

3. **Form State**: react-hook-form with Zod validation
   - Schemas in `src/lib/admin-schemas.ts` and inline in components
   - useActionState pattern for Server Action integration

### i18n (Internationalization)

- **Library**: next-intl 4.5.5
- **Locales**: French (fr) and English (en)
- **Messages**: `messages/fr.json` and `messages/en.json`
- **Routing**: `src/i18n/routing.ts` defines locale prefix and default
- **Request**: `src/i18n/request.ts` configures locale detection
- **Middleware**: next-intl middleware integrated in `src/proxy.ts`
- **Database**: i18n fields like `name`/`nameEN`, `description`/`descriptionEN`

## Development Patterns

### Form Handling with Server Actions

Standard pattern for forms with progressive enhancement:

```typescript
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { mySchema } from "@/lib/schemas";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function myAction(formData: FormData): Promise<ActionResponse> {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Not authenticated" };

  // 2. Role check (for admin actions)
  if (session.user.role !== "admin") return { success: false, error: "Forbidden" };

  // 3. Extract FormData
  const rawData = {
    field1: formData.get("field1"),
    field2: formData.get("field2"),
  };

  // 4. Validate with Zod
  const parsed = mySchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 5. Database operation
  try {
    const result = await prisma.model.create({ data: parsed.data });

    // 6. Revalidate cache
    revalidatePath("/path");

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}
```

### File Upload Flow

All uploads go to Vercel Blob via dedicated API routes:

1. **Images** (`/api/upload/image` or `/api/admin/products/upload`):
   - Accept multipart form data
   - Upload to Vercel Blob with `put()`
   - Return blob URL
   - Used for: product images, category images, scent icons

2. **Audio** (`/api/upload/audio`):
   - Accept audio file (for custom candle voice messages)
   - Upload to Blob
   - Return URL stored in OrderItem.audioUrl

3. **Avatars** (`/api/upload/avatar`):
   - Upload user profile pictures
   - Return URL stored in User.image

### QR Code & AR Flow

1. Order completed → QRCode generated for each OrderItem
2. Customer scans QR → redirects to `/ar/{code}`
3. AR page loads OrderItem data via `/api/qr` (code lookup)
4. Three.js scene renders 3D candle with custom:
   - Scent color
   - AR animation from Product.arAnimation
   - Audio playback if OrderItem.audioUrl exists
   - Text display if OrderItem.textMessage exists

### Return & Refund Flow

1. Customer requests return via `/api/returns` (POST)
   - Status: REQUESTED
2. Admin reviews in dashboard (`/admin/returns`)
3. Admin approves/rejects via `/api/admin/returns/{id}` (PATCH)
   - If approved → status: APPROVED → Admin sends return label → RETURN_SHIPPING_SENT
4. Admin updates tracking via `/api/admin/returns/{id}/tracking` (POST)
   - Status: RETURN_IN_TRANSIT → RETURN_DELIVERED → PROCESSING
5. Admin processes refund via `/api/admin/returns/{id}/refund` (POST)
   - Stripe refund created
   - Status: COMPLETED
   - Order.stripeRefundId and refundedAt updated

### Stripe Integration

- **Checkout**: `/api/create-checkout-session` creates Stripe Checkout session
- **Webhook**: `/api/webhooks/stripe` handles payment events:
  - `checkout.session.completed`: Create Order with items, address, QR codes
  - `payment_intent.succeeded`: Update Order status to PROCESSING
  - `charge.refunded`: Update Return status
- **Products**: Stripe not used for product catalog (local Prisma DB)
- **Refunds**: Admin triggers refund in return flow

### Email Templates

React Email templates in `src/emails/`:
- `reset-password.tsx`: Password reset link
- `email-verification.tsx`: Email verification link
- `newsletter-welcome.tsx`: Welcome email after verification
- Sent via Resend API in Better Auth callbacks

## Database Workflow

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Prisma Client auto-generates (postinstall hook)
4. Update TypeScript types in `src/types/` if needed for custom shapes
5. Update Server Actions and API routes using new schema

For schema push without migration (dev only):
```bash
npx prisma db push
```

## Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"  # or production URL
BETTER_AUTH_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# Resend
RESEND_API_KEY="re_..."
```

## Common Issues

### Middleware Not Working
- Ensure `middleware.ts` exists at project root and exports the proxy function from `src/proxy.ts`
- Check that matcher in config includes the route you're testing

### Prisma Client Out of Sync
```bash
npm run db:generate
```

### Type Errors After Schema Change
1. Run `npx prisma migrate dev`
2. Restart TypeScript server in IDE
3. Check `src/generated/` was regenerated

### i18n Route Not Found
- All routes must be nested under `[locale]` dynamic segment
- Use `Link` from `@/i18n/routing` not `next/link`
- Translations in `messages/{locale}.json` must match translation keys

### Server Actions Not Called
- Ensure "use server" directive at top of file
- FormData field names must match schema exactly
- Check ActionResponse type for errors

## Code Style

- **TypeScript**: Strict mode, no implicit any
- **Components**: Prefer RSC, use "use client" only when necessary (hooks, events)
- **Imports**: Use `@/` alias for all imports from `src/`
- **Forms**: react-hook-form + Zod + Server Actions pattern
- **Error Handling**: Try/catch with user-friendly messages, log server errors
- **Validation**: Always validate server-side with Zod, client validation is optional UX enhancement
- **Tailwind**: Use utility classes, CSS variables for theming in `globals.css`
- **shadcn/ui**: Import from `@/components/ui`, customize as needed

## Next.js 16 & React 19 Features

- **Server Components**: Default, faster initial loads
- **Server Actions**: "use server" for form mutations
- **Streaming**: Suspense boundaries with loading.tsx
- **Async Request APIs**: `await params`, `await headers()`, `await cookies()`
- **Enhanced Forms**: Progressive enhancement with next/form
- **authInterrupts**: Experimental flag enabled for auth redirects
- **Turbopack**: Used in dev mode (faster HMR)
