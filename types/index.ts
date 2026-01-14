// GraphQL Types
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum CrowdLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Location {
  lat: number;
  lng: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface UserPreferences {
  cuisine: string[];
  priceRange: PriceRange;
  maxDistance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferences: UserPreferences;
  favoriteRestaurants: Restaurant[];
  location: Location;
  createdAt: string;
}

export interface Rating {
  average: number;
  count: number;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  location: Location;
  address: string;
  rating: Rating;
  crowdLevel: CrowdLevel;
  openingHours: OpeningHours[];
  images: string[];
  ownerId: string;
  owner?: User;
  menuItems?: Menu[];
  reviews?: Review[];
  crowdData?: CrowdData;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: User;
  restaurantId: string;
  restaurant?: Restaurant;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrowdData {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  currentVisitors: number;
  crowdLevel: CrowdLevel;
  lastUpdated: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface RecommendationResult {
  restaurant: Restaurant;
  score: number;
  reasons: string[];
}

export interface RestaurantFilter {
  cuisine?: string;
  minRating?: number;
  maxDistance?: number;
  location?: Location;
  crowdLevel?: CrowdLevel;
  priceRange?: PriceRange;
}

export interface RestaurantStats {
  restaurant: Restaurant;
  visitCount: number;
  averageRating: number;
  reviewCount: number;
}

export interface CrowdTrend {
  restaurant: Restaurant;
  crowdLevel: CrowdLevel;
  currentVisitors: number;
  lastUpdated: string;
}

export interface Analytics {
  totalRestaurants: number;
  totalUsers: number;
  mostVisitedRestaurants: RestaurantStats[];
  averageRatings: number;
  crowdTrends: CrowdTrend[];
}

// Form Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface CreateRestaurantInput {
  name: string;
  description: string;
  cuisineType: string;
  location: Location;
  address: string;
  openingHours: OpeningHours[];
  images?: string[];
}

export interface CreateMenuInput {
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
}

export interface CreateReviewInput {
  restaurantId: string;
  rating: number;
  comment?: string;
}

export interface CartItem {
  menuItemId: string;
  menuItem?: Menu;
  quantity: number;
  price: number;
  name: string;
}

export interface Cart {
  id: string;
  userId: string;
  user?: User;
  restaurantId: string;
  restaurant?: Restaurant;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItem?: Menu;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  restaurantId: string;
  restaurant?: Restaurant;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress?: string;
  deliveryLocation?: Location;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  restaurantId: string;
  deliveryAddress?: string;
  deliveryLocation?: Location;
  specialInstructions?: string;
}
