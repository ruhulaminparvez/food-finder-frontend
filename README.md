# 🍽️ FoodFinder

> A modern, interactive restaurant discovery platform with AI-powered recommendations, real-time crowd data, and seamless ordering experience.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![GraphQL](https://img.shields.io/badge/GraphQL-Apollo-purple?logo=graphql)](https://www.apollographql.com/)

## ✨ Features

### 🎯 Core Features
- **🔍 Advanced Restaurant Discovery** - Filter by cuisine type, rating, distance, price range, and real-time crowd levels
- **🗺️ Interactive Maps** - Leaflet-powered map visualization with restaurant markers and location-based search
- **🤖 AI-Powered Recommendations** - Personalized restaurant suggestions based on user preferences and behavior
- **❤️ Favorites System** - Save and manage your favorite restaurants for quick access
- **🛒 Shopping Cart** - Add items to cart, manage quantities, and proceed to checkout
- **📦 Order Management** - Track orders, view order history, and generate PDF receipts
- **⭐ Reviews & Ratings** - Read and write reviews, view detailed ratings breakdown
- **📊 Analytics Dashboard** - Comprehensive admin dashboard with statistics and insights

### 🎨 User Experience
- **📱 Fully Responsive** - Mobile-first design that works seamlessly on all devices
- **⚡ Optimized Performance** - Server-side rendering, code splitting, and optimized images
- **🎭 Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **🔔 Real-time Notifications** - Toast notifications for user actions and feedback
- **♿ Accessible** - WCAG compliant with keyboard navigation and screen reader support

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 16.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.2](https://react.dev/)** - UI library
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type-safe development

### UI & Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Headless UI](https://headlessui.com/)** - Unstyled, accessible UI components
- **[Heroicons](https://heroicons.com/)** - Beautiful hand-crafted SVG icons
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready motion library

### State Management & Data Fetching
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Apollo Client](https://www.apollographql.com/docs/react/)** - GraphQL client with caching
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with easy validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Maps & Visualization
- **[Leaflet](https://leafletjs.com/)** - Open-source JavaScript library for mobile-friendly interactive maps
- **[React Leaflet](https://react-leaflet.js.org/)** - React components for Leaflet maps
- **[Recharts](https://recharts.org/)** - Composable charting library built on React components

### Utilities
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation for receipts and reports

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or yarn/pnpm)
- Running **GraphQL backend server** (see [`food-finder-backend`](../food-finder-backend))

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd food-finder-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # GraphQL API Endpoint
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 📁 Project Structure

```
food-finder-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication route group
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── admin/                   # Admin dashboard
│   │   ├── crowd/               # Crowd data management
│   │   ├── menus/               # Menu management
│   │   ├── restaurants/         # Restaurant management
│   │   └── page.tsx             # Admin dashboard home
│   ├── checkout/                # Checkout page
│   ├── dashboard/               # User recommendations dashboard
│   ├── favorites/               # User favorites page
│   ├── orders/                  # Order management
│   │   └── [id]/                # Order detail page
│   ├── restaurants/             # Restaurant pages
│   │   ├── [id]/                # Restaurant detail page
│   │   └── page.tsx             # Restaurant listing
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── components/                   # React components
│   ├── cart/                    # Shopping cart components
│   │   └── CartDrawer.tsx       # Cart drawer component
│   ├── common/                  # Shared components
│   │   ├── ApolloWrapper.tsx   # Apollo Client provider
│   │   ├── AuthInitializer.tsx # Auth state initialization
│   │   ├── Footer.tsx           # Footer component
│   │   ├── Navbar.tsx           # Navigation bar
│   │   └── ProtectedRoute.tsx   # Route protection HOC
│   ├── map/                     # Map components
│   │   └── RestaurantMap.tsx    # Leaflet map component
│   └── ui/                      # UI primitives
│       ├── Button.tsx           # Button component
│       ├── Card.tsx             # Card component
│       ├── Input.tsx            # Input component
│       ├── Select.tsx           # Select component
│       └── Skeleton.tsx         # Loading skeleton
│
├── graphql/                      # GraphQL operations
│   ├── mutations/               # GraphQL mutations
│   │   ├── auth.ts              # Authentication mutations
│   │   ├── cart.ts              # Cart mutations
│   │   ├── crowd.ts             # Crowd data mutations
│   │   ├── menu.ts              # Menu mutations
│   │   ├── order.ts             # Order mutations
│   │   ├── restaurant.ts        # Restaurant mutations
│   │   └── user.ts              # User mutations
│   └── queries/                 # GraphQL queries
│       ├── analytics.ts         # Analytics queries
│       ├── cart.ts              # Cart queries
│       ├── menu.ts              # Menu queries
│       ├── order.ts             # Order queries
│       ├── restaurants.ts       # Restaurant queries
│       ├── reviews.ts           # Review queries
│       └── user.ts              # User queries
│
├── lib/                          # Utilities & configurations
│   └── apollo-client.ts         # Apollo Client configuration
│
├── store/                        # Zustand stores
│   ├── auth-store.ts            # Authentication state
│   └── cart-store.ts            # Shopping cart state
│
├── types/                        # TypeScript type definitions
│   └── index.ts                 # Shared types
│
├── utils/                        # Utility functions
│   └── pdf-generator.ts         # PDF generation utilities
│
├── public/                       # Static assets
│   └── *.svg                    # SVG icons and images
│
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs            # ESLint configuration
├── postcss.config.mjs            # PostCSS configuration
└── package.json                  # Dependencies and scripts
```

## 🗺️ Key Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with hero search and featured restaurants |
| `/restaurants` | Restaurant listing with advanced filters and search |
| `/restaurants/[id]` | Detailed restaurant view with menu, reviews, and map |
| `/dashboard` | Personalized AI-powered restaurant recommendations |
| `/favorites` | User's saved favorite restaurants |
| `/checkout` | Shopping cart checkout and order placement |
| `/orders/[id]` | Order details and tracking |
| `/login` | User authentication (login) |
| `/register` | User registration |
| `/admin` | Admin dashboard with analytics |
| `/admin/restaurants` | Restaurant management (CRUD) |
| `/admin/menus` | Menu item management |
| `/admin/crowd` | Real-time crowd data management |

## 🔌 GraphQL Integration

The application uses **Apollo Client** for all GraphQL operations with automatic caching, error handling, and loading states.

### Example Query Usage

```typescript
import { useQuery } from '@apollo/client';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';

function RestaurantList() {
  const { data, loading, error } = useQuery(GET_RESTAURANTS, {
    variables: { 
      limit: 20,
      filters: {
        cuisineType: 'Italian',
        minRating: 4.0
      }
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.restaurants.map(restaurant => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
```

### Example Mutation Usage

```typescript
import { useMutation } from '@apollo/client';
import { ADD_TO_CART } from '@/graphql/mutations/cart';

function AddToCartButton({ menuItemId }: { menuItemId: string }) {
  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
    refetchQueries: ['GET_CART'],
  });

  const handleAdd = async () => {
    try {
      await addToCart({
        variables: { menuItemId, quantity: 1 },
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  return (
    <button onClick={handleAdd} disabled={loading}>
      Add to Cart
    </button>
  );
}
```

## 🔐 Authentication

Authentication is handled via **JWT tokens** stored in `localStorage`. The authentication state is managed with **Zustand** and automatically persisted across sessions.

### Protected Routes

Routes can be protected using the `ProtectedRoute` component:

```typescript
import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Auth Store Usage

```typescript
import { useAuthStore } from '@/store/auth-store';

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🗺️ Map Integration

The application uses **Leaflet** with **OpenStreetMap** tiles for interactive restaurant maps. The map component supports:

- Restaurant markers with custom icons
- Popup information on marker click
- Automatic bounds fitting for multiple restaurants
- Custom center and zoom levels
- Click handlers for navigation

### Map Component Usage

```typescript
import RestaurantMap from '@/components/map/RestaurantMap';

function RestaurantMapView({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <RestaurantMap
      restaurants={restaurants}
      center={{ lat: 39.9042, lng: 116.4074 }}
      height="600px"
      onMarkerClick={(restaurant) => {
        router.push(`/restaurants/${restaurant.id}`);
      }}
    />
  );
}
```

## 👨‍💼 Admin Features

Admin users have access to:

- **📊 Analytics Dashboard** - View statistics, user metrics, and revenue data
- **🏪 Restaurant Management** - Create, update, and delete restaurants
- **🍽️ Menu Management** - Add, edit, and remove menu items
- **👥 Crowd Data Management** - Update real-time crowd levels and wait times
- **📈 Reports** - Generate PDF reports and export data

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL API endpoint | `http://localhost:4000/graphql` |

Create a `.env.local` file in the root directory to override defaults.

## 🏗️ Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Or deploy to your preferred platform:**
   - [Vercel](https://vercel.com/) (recommended for Next.js)
   - [Netlify](https://www.netlify.com/)
   - [AWS Amplify](https://aws.amazon.com/amplify/)
   - Any Node.js hosting platform

## 🧪 Development

### Code Quality

- **TypeScript** - Full type safety across the application
- **ESLint** - Code linting with Next.js recommended rules
- **Strict Mode** - React Strict Mode enabled for development

### Best Practices

- ✅ Functional components with hooks
- ✅ TypeScript interfaces for all props and data
- ✅ Proper error boundaries and loading states
- ✅ Optimistic UI updates where appropriate
- ✅ Code splitting and lazy loading
- ✅ SEO-friendly metadata and structure

## 📝 License

ISC

## 👤 Author

**Ruhul Amin Parvez**

---

<div align="center">
  <p>Built with ❤️ using Next.js, React, and GraphQL</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
