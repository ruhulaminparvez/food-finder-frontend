'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_RECOMMENDATIONS } from '@/graphql/queries/user';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { RecommendationResult } from '@/types';
import Button from '@/components/ui/Button';
import {
  SparklesIcon,
  ArrowPathIcon,
  StarIcon,
  UsersIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useQuery<{ getUserRecommendations: RecommendationResult[] }>(GET_USER_RECOMMENDATIONS, {
    variables: { limit: 10 },
  });

  const recommendations: RecommendationResult[] = data?.getUserRecommendations || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <SparklesIcon className="h-8 w-8 text-blue-600" />
                Personalized Recommendations
              </h1>
              <p className="text-gray-600">
                Restaurants tailored to your preferences
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>

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
              <p className="text-red-600">Error loading recommendations. Please try again.</p>
            </div>
          ) : recommendations.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <p className="text-gray-600 mb-4">
                  No recommendations available yet. Start exploring restaurants to get personalized suggestions!
                </p>
                <Link href="/restaurants">
                  <Button variant="primary">Explore Restaurants</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.restaurant.id} href={`/restaurants/${rec.restaurant.id}`}>
                  <Card hover>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={rec.restaurant.images[0] || '/placeholder-restaurant.jpg'}
                        alt={rec.restaurant.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold text-blue-600">
                        {rec.restaurant.rating.average.toFixed(1)} ⭐
                      </div>
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        Match: {(rec.score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {rec.restaurant.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {rec.restaurant.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rec.reasons.slice(0, 2).map((reason, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">{rec.restaurant.cuisineType}</span>
                        <span className={`text-xs px-2 py-1 rounded ${rec.restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                            rec.restaurant.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {rec.restaurant.crowdLevel} Crowd
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
