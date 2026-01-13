'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_FAVORITES } from '@/graphql/queries/user';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Restaurant } from '@/types';
import {
  HeartIcon,
  StarIcon,
  UsersIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/solid';

export default function FavoritesPage() {
  const { data, loading, error } = useQuery<{ getUserFavorites: Restaurant[] }>(GET_USER_FAVORITES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const favorites: Restaurant[] = data?.getUserFavorites || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <HeartIcon className="h-8 w-8 text-red-500" />
            My Favorites
          </h1>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton variant="rectangular" className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
                    <Skeleton variant="text" className="h-4 w-full mb-2" />
                    <Skeleton variant="text" className="h-4 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading favorites. Please try again.</p>
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <p className="text-gray-600 mb-4">
                  You haven&apos;t added any favorites yet.
                </p>
                <Link href="/restaurants">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Explore Restaurants
                  </button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                  <Card hover>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={restaurant.images[0] || '/placeholder-restaurant.jpg'}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold text-blue-600">
                        {restaurant.rating.average.toFixed(1)} ⭐
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {restaurant.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {restaurant.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">{restaurant.cuisineType}</span>
                        <span className={`text-xs px-2 py-1 rounded ${restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                            restaurant.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {restaurant.crowdLevel} Crowd
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
