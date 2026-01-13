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

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const { data, loading, error } = useQuery<{ getRestaurants: Restaurant[] }>(GET_RESTAURANTS, {
    variables: { limit: 6 },
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
            <input
              type="text"
              placeholder="Search for cuisine, restaurant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto">
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
                        <span className={`text-xs px-2 py-1 rounded ${
                          restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
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
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get Personalized Recommendations</h2>
          <p className="text-xl mb-8 text-blue-100">
            Sign up to receive restaurant recommendations based on your preferences
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
