'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_RESTAURANTS, SEARCH_RESTAURANTS } from '@/graphql/queries/restaurants';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant, RestaurantFilter, CrowdLevel } from '@/types';
import {
  MagnifyingGlassIcon,
  StarIcon,
  UsersIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';

const CUISINE_TYPES = ['Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'American', 'Thai', 'French'];

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<RestaurantFilter>({
    cuisine: searchParams.get('cuisine') || undefined,
  });
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');

  const { data, loading, error, refetch } = useQuery<{ getRestaurants: Restaurant[] } | { searchRestaurants: Restaurant[] }>(
    searchKeyword ? SEARCH_RESTAURANTS : GET_RESTAURANTS,
    {
      variables: searchKeyword
        ? { keyword: searchKeyword, limit: 20 }
        : { filter: filters, limit: 20 },
    }
  );

  const restaurants: Restaurant[] = searchKeyword
    ? (data && 'searchRestaurants' in data ? data.searchRestaurants : [])
    : (data && 'getRestaurants' in data ? data.getRestaurants : []);

  const handleFilterChange = (key: keyof RestaurantFilter, value: string | number | CrowdLevel | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setSearchKeyword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurants</h1>
          
          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => refetch()}
              variant="primary"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              value={filters.cuisine || ''}
              onChange={(value) => handleFilterChange('cuisine', value || undefined)}
              options={[
                { value: '', label: 'All Cuisines' },
                ...CUISINE_TYPES.map((cuisine) => ({ value: cuisine, label: cuisine })),
              ]}
              placeholder="All Cuisines"
              className="min-w-[180px]"
            />

            <Select
              value={filters.crowdLevel || ''}
              onChange={(value) => handleFilterChange('crowdLevel', value || undefined)}
              options={[
                { value: '', label: 'All Crowd Levels' },
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
              ]}
              placeholder="All Crowd Levels"
              className="min-w-[180px]"
            />

            <div className="relative">
              <StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                placeholder="Min Rating"
                value={filters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Squares2X2Icon className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListBulletIcon className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
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
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <Card hover className={viewMode === 'list' ? 'flex' : ''}>
                  <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 shrink-0' : 'h-48'} overflow-hidden`}>
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
                  <div className="p-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {restaurant.name}
                    </h3>
                    <p className={`text-gray-600 text-sm mb-2 ${viewMode === 'list' ? '' : 'line-clamp-2'}`}>
                      {restaurant.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {restaurant.cuisineType}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
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
    </div>
  );
}
