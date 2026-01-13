'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ANALYTICS } from '@/graphql/queries/analytics';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { RestaurantStats, Analytics, CrowdTrend } from '@/types';

export default function AdminDashboardPage() {
  const { data, loading, error } = useQuery<{ getAnalytics: Analytics }>(GET_ANALYTICS);

  const analytics = data?.getAnalytics;

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <div className="p-6">
                    <Skeleton variant="text" className="h-6 w-1/2 mb-2" />
                    <Skeleton variant="text" className="h-8 w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading analytics. Please try again.</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <div className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Restaurants</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalRestaurants || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Average Rating</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.averageRatings?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Most Visited</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.mostVisitedRestaurants?.length || 0}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link href="/admin/restaurants">
                  <Card hover className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Restaurants</h3>
                    <p className="text-gray-600">Create, update, or delete restaurants</p>
                  </Card>
                </Link>
                <Link href="/admin/menus">
                  <Card hover className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Menus</h3>
                    <p className="text-gray-600">Add or edit menu items</p>
                  </Card>
                </Link>
                <Link href="/admin/crowd">
                  <Card hover className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Crowd Management</h3>
                    <p className="text-gray-600">Update crowd data</p>
                  </Card>
                </Link>
              </div>

              {/* Most Visited Restaurants */}
              <Card className="mb-8">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Most Visited Restaurants</h2>
                  {analytics?.mostVisitedRestaurants?.length === 0 ? (
                    <p className="text-gray-600">No data available</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Restaurant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Visits
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reviews
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics?.mostVisitedRestaurants?.map((stat: RestaurantStats) => (
                            <tr key={stat.restaurant.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {stat.restaurant.images[0] && (
                                    <Image
                                      src={stat.restaurant.images[0]}
                                      alt={stat.restaurant.name}
                                      width={40}
                                      height={40}
                                      className="rounded-full mr-3 object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {stat.restaurant.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {stat.restaurant.cuisineType}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stat.visitCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stat.averageRating.toFixed(1)} ⭐
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stat.reviewCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>

              {/* Crowd Trends */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Crowd Trends</h2>
                  {analytics?.crowdTrends?.length === 0 ? (
                    <p className="text-gray-600">No data available</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics?.crowdTrends?.map((trend: CrowdTrend) => (
                        <div
                          key={trend.restaurant.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-semibold text-gray-900">{trend.restaurant.name}</h4>
                            <p className="text-sm text-gray-600">{trend.restaurant.cuisineType}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${trend.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                              trend.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {trend.crowdLevel}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {trend.currentVisitors} visitors
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
