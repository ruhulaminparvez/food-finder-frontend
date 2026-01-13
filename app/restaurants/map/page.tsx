'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';
import RestaurantMap from '@/components/map/RestaurantMap';
import { useRouter } from 'next/navigation';
import { Restaurant } from '@/types';
import Card from '@/components/ui/Card';

export default function MapViewPage() {
  const router = useRouter();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const { data, loading } = useQuery<{ getRestaurants: Restaurant[] }>(GET_RESTAURANTS, {
    variables: { limit: 50 },
  });

  const restaurants: Restaurant[] = data?.getRestaurants || [];

  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading map...</p>
          </div>
        ) : (
          <>
            <RestaurantMap
              restaurants={restaurants}
              onMarkerClick={handleMarkerClick}
              height="100%"
            />
            {selectedRestaurant && (
              <div className="absolute top-4 right-4 max-w-sm z-10">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedRestaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedRestaurant.cuisineType} • {selectedRestaurant.address}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-blue-600 font-semibold">
                        {selectedRestaurant.rating.average.toFixed(1)} ⭐
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${selectedRestaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                          selectedRestaurant.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {selectedRestaurant.crowdLevel} Crowd
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/restaurants/${selectedRestaurant.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
