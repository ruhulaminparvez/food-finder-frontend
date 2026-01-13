# FoodFinder - Interactive Restaurant Finder & Food Recommendation System

A modern, responsive web application built with Next.js, GraphQL, and TailwindCSS for discovering restaurants and getting personalized food recommendations.

## Features

- 🍽️ **Restaurant Discovery**: Browse restaurants with advanced filters (cuisine, rating, distance, crowd level)
- 🗺️ **Interactive Maps**: MapCN integration for visual restaurant locations
- 🤖 **Personalized Recommendations**: AI-powered restaurant suggestions based on user preferences
- ❤️ **Favorites**: Save and manage favorite restaurants
- 📊 **Admin Dashboard**: Comprehensive analytics and restaurant management
- 🔐 **Authentication**: Secure JWT-based authentication
- 📱 **Responsive Design**: Mobile-first, accessible UI

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: TailwindCSS + Headless UI
- **State Management**: Zustand
- **API Layer**: GraphQL (Apollo Client)
- **Forms**: React Hook Form + Zod
- **Maps**: MapCN
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running GraphQL backend server (see `food-finder-backend`)

### Installation

1. Clone the repository:
```bash
cd food-finder-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_MAPCN_API_KEY=your_mapcn_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
food-finder-frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/              # Admin dashboard
│   ├── restaurants/        # Restaurant pages
│   ├── dashboard/          # User recommendations
│   └── favorites/          # User favorites
├── components/             # React components
│   ├── common/            # Shared components
│   ├── restaurant/        # Restaurant-specific components
│   ├── map/               # Map components
│   └── ui/                # UI primitives
├── graphql/               # GraphQL queries & mutations
│   ├── queries/
│   └── mutations/
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── styles/                # Global styles
```

## Key Pages

- **Home** (`/`): Hero search, featured restaurants
- **Restaurants** (`/restaurants`): Restaurant listing with filters
- **Restaurant Detail** (`/restaurants/[id]`): Detailed restaurant view with menu and reviews
- **Map View** (`/restaurants/map`): Interactive map of restaurants
- **Dashboard** (`/dashboard`): Personalized recommendations
- **Favorites** (`/favorites`): Saved restaurants
- **Login/Register** (`/login`, `/register`): Authentication
- **Admin Dashboard** (`/admin`): Analytics and management

## GraphQL Integration

The app uses Apollo Client for GraphQL operations. All queries and mutations are organized in the `graphql/` directory.

### Example Query Usage

```typescript
import { useQuery } from '@apollo/client';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';

const { data, loading, error } = useQuery(GET_RESTAURANTS, {
  variables: { limit: 20 },
});
```

## Authentication

Authentication is handled via JWT tokens stored in localStorage. The auth state is managed with Zustand and persisted across sessions.

## Admin Features

Admin users can:
- View analytics and statistics
- Create, update, and delete restaurants
- Manage menu items
- Update crowd data

## Environment Variables

- `NEXT_PUBLIC_GRAPHQL_URL`: GraphQL API endpoint
- `NEXT_PUBLIC_MAPCN_API_KEY`: MapCN API key (if required)

## Building for Production

```bash
npm run build
npm start
```

## License

ISC

## Author

Ruhul Amin Parvez
