'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant } from '@/types';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const { data, loading, error } = useQuery<{ getRestaurants: Restaurant[] }>(GET_RESTAURANTS, {
    variables: { limit: 6 },
    fetchPolicy: 'cache-and-network',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    router.push(`/restaurants?${params.toString()}`);
  };

  const restaurants: Restaurant[] = data?.getRestaurants || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Discover Amazing
            <span className="text-blue-600"> Restaurants</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Find the perfect dining experience with personalized recommendations
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearch}
            className="bg-white rounded-lg shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for cuisine, restaurant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Restaurants</h2>
            <Link href="/restaurants">
              <Button variant="outline">View All</Button>
            </Link>
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
              <p className="text-red-600">Error loading restaurants. Please try again.</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No restaurants found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                  <Card hover>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={restaurant.images[0] || '/placeholder-restaurant.jpg'}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold text-blue-600 flex items-center gap-1">
                        <StarIcon className="h-4 w-4" />
                        {restaurant.rating.average.toFixed(1)}
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
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <BuildingStorefrontIcon className="h-4 w-4" />
                          {restaurant.cuisineType}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                            restaurant.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          <UsersIcon className="h-3 w-3" />
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
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
              <SparklesIcon className="h-10 w-10 text-white" />
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Personalized Recommendations
            </h2>

            {/* Description */}
            <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Sign up to receive restaurant recommendations tailored to your taste preferences and location
            </p>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  className="group shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  <span className="flex items-center gap-2">
                    Get Started
                    <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
            </motion.div>

            {/* Additional Features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <StarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">Top Rated</h3>
                  <p className="text-gray-600 text-sm">Discover the highest rated restaurants</p>
                </div>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <MapPinIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">Near You</h3>
                  <p className="text-gray-600 text-sm">Find restaurants close to your location</p>
                </div>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <UsersIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">Crowd Levels</h3>
                  <p className="text-gray-600 text-sm">Check real-time crowd information</p>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
