'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ANALYTICS } from '@/graphql/queries/analytics';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { RestaurantStats, Analytics, CrowdTrend, Order } from '@/types';
import {
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  StarIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const { data, loading, error } = useQuery<{ getAnalytics: Analytics }>(GET_ANALYTICS, {
    fetchPolicy: 'cache-and-network',
  });

  const analytics = data?.getAnalytics;

  // Prepare chart data
  const orderStatusData = analytics?.ordersByStatus
    ? [
      { name: 'Pending', value: analytics.ordersByStatus.pending, color: '#F59E0B' },
      { name: 'Confirmed', value: analytics.ordersByStatus.confirmed, color: '#3B82F6' },
      { name: 'Preparing', value: analytics.ordersByStatus.preparing, color: '#8B5CF6' },
      { name: 'Ready', value: analytics.ordersByStatus.ready, color: '#10B981' },
      { name: 'Completed', value: analytics.ordersByStatus.completed, color: '#059669' },
      { name: 'Cancelled', value: analytics.ordersByStatus.cancelled, color: '#EF4444' },
    ]
    : [];

  const ordersByDateData = analytics?.ordersByDate || [];

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>

          {loading ? (
            <div className="space-y-6">
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
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading analytics. Please try again.</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Total Restaurants</h3>
                      <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalRestaurants || 0}</p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Total Users</h3>
                      <UsersIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Average Rating</h3>
                      <StarIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.averageRatings?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Total Orders</h3>
                      <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalOrders || 0}</p>
                  </div>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Total Revenue</h3>
                      <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Most Visited</h3>
                      <ChartBarIcon className="h-6 w-6 text-pink-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.mostVisitedRestaurants?.length || 0}
                    </p>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Completed Orders</h3>
                      <ClockIcon className="h-6 w-6 text-cyan-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.ordersByStatus?.completed || 0}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Orders by Status Pie Chart */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Orders by Status</h2>
                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="45%"
                            labelLine={true}
                            label={({ name, percent, value }) => {
                              // Only show label if percent is significant (> 5%)
                              if ((percent ?? 0) < 0.05) return '';
                              return `${name ?? 'Unknown'}: ${value}`;
                            }}
                            outerRadius={100}
                            innerRadius={30}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | undefined) => {
                              if (value === undefined) return '';
                              return `${value} orders`;
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => {
                              const total = orderStatusData.reduce((sum, item) => sum + item.value, 0);
                              const entry = orderStatusData.find(item => item.name === value);
                              if (!entry) return value;
                              const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                              return `${value} (${percent}%)`;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-600 text-center py-12">No order data available</p>
                    )}
                  </div>
                </Card>

                {/* Orders by Date Line Chart */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Trend (Last 7 Days)</h2>
                    {ordersByDateData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={ordersByDateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              color: '#111827'
                            }}
                            labelStyle={{ color: '#111827' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Orders" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-600 text-center py-12">No order data available</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card className="mb-8">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
                  {ordersByDateData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ordersByDateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => `$${Number(value).toFixed(2)}`}
                            contentStyle={{ 
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              color: '#111827'
                            }}
                            labelStyle={{ color: '#111827' }}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-600 text-center py-12">No revenue data available</p>
                  )}
                </div>
              </Card>

              {/* Recent Orders */}
              <Card className="mb-8">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                  {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Restaurant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.recentOrders.map((order: Order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                #{order.id.slice(-8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {order.user?.name || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">{order.user?.email || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {order.restaurant?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">{order.restaurant?.address || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                ${order.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === 'CANCELLED'
                                        ? 'bg-red-100 text-red-800'
                                        : order.status === 'PENDING'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">No recent orders</p>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link href="/admin/restaurants">
                  <Card hover className="p-6 text-center">
                    <BuildingStorefrontIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Restaurants</h3>
                    <p className="text-gray-600">Create, update, or delete restaurants</p>
                  </Card>
                </Link>
                <Link href="/admin/menus">
                  <Card hover className="p-6 text-center">
                    <svg className="h-12 w-12 text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Menus</h3>
                    <p className="text-gray-600">Add or edit menu items</p>
                  </Card>
                </Link>
                <Link href="/admin/crowd">
                  <Card hover className="p-6 text-center">
                    <UsersIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
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
                                  {stat.restaurant.images?.[0] && (
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
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${trend.crowdLevel === 'LOW'
                                  ? 'bg-green-100 text-green-800'
                                  : trend.crowdLevel === 'MEDIUM'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {trend.crowdLevel}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">{trend.currentVisitors} visitors</p>
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
