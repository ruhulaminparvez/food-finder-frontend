'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RESTAURANT_BY_ID } from '@/graphql/queries/restaurants';
import { GET_MENU_BY_RESTAURANT } from '@/graphql/queries/menu';
import { GET_REVIEWS_BY_RESTAURANT } from '@/graphql/queries/reviews';
import { ADD_FAVORITE_RESTAURANT, REMOVE_FAVORITE_RESTAURANT, ADD_REVIEW } from '@/graphql/mutations/user';
import { GET_USER_FAVORITES } from '@/graphql/queries/user';
import { useAuthStore } from '@/store/auth-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Restaurant, Menu, Review } from '@/types';
import {
  StarIcon,
  HeartIcon,
  MapPinIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import RestaurantMap from '@/components/map/RestaurantMap';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'map'>('menu');

  const { data: restaurantData, loading: restaurantLoading, error: restaurantError } = useQuery<{ getRestaurantById: Restaurant }>(
    GET_RESTAURANT_BY_ID,
    {
      variables: { id: restaurantId },
      skip: !restaurantId,
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: menuData, loading: menuLoading } = useQuery<{ getMenuByRestaurant: Menu[] }>(GET_MENU_BY_RESTAURANT, {
    variables: { restaurantId },
    skip: !restaurantId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useQuery<{ getReviewsByRestaurant: Review[] }>(
    GET_REVIEWS_BY_RESTAURANT,
    {
      variables: { restaurantId, limit: 10 },
      skip: !restaurantId,
      fetchPolicy: 'cache-and-network',
    }
  );

  const [addFavorite, { loading: favoriteLoading }] = useMutation(ADD_FAVORITE_RESTAURANT, {
    refetchQueries: [{ query: GET_USER_FAVORITES }],
    awaitRefetchQueries: true,
  });
  const [removeFavorite, { loading: removeFavoriteLoading }] = useMutation(REMOVE_FAVORITE_RESTAURANT, {
    refetchQueries: [{ query: GET_USER_FAVORITES }],
    awaitRefetchQueries: true,
  });
  const [addReview, { loading: reviewLoading }] = useMutation(ADD_REVIEW);

  // Check if restaurant is in favorites
  const { data: favoritesData } = useQuery<{ getUserFavorites: Restaurant[] }>(GET_USER_FAVORITES, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const restaurant = restaurantData?.getRestaurantById;
  const menuItems = menuData?.getMenuByRestaurant || [];
  const reviews = reviewsData?.getReviewsByRestaurant || [];
  const favorites = favoritesData?.getUserFavorites || [];
  const isFavorite = favorites.some((fav) => fav.id === restaurantId);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage favorites');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite({ variables: { restaurantId } });
        toast.success('Removed from favorites!');
      } else {
        await addFavorite({ variables: { restaurantId } });
        toast.success('Added to favorites!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update favorites');
    }
  };

  const onSubmitReview = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Please login to add reviews');
      return;
    }

    try {
      // Check if user already has a review for this restaurant
      const userReview = reviews.find((review) => review.user?.id === user?.id);
      const isUpdating = !!userReview;

      await addReview({
        variables: {
          input: {
            restaurantId,
            rating: data.rating,
            comment: data.comment,
          },
        },
      });
      toast.success(isUpdating ? 'Review updated!' : 'Review added!');
      reset();
      refetchReviews();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save review');
    }
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton variant="rectangular" className="h-64 w-full mb-6" />
          <Skeleton variant="text" className="h-8 w-3/4 mb-4" />
          <Skeleton variant="text" className="h-4 w-full mb-2" />
        </div>
      </div>
    );
  }

  if (restaurantError || (!restaurantLoading && !restaurant)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="mb-4">
            <BuildingStorefrontIcon className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">The restaurant you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/restaurants">
            <Button variant="primary">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Restaurant Header */}
        <Card className="mb-6">
          <div className="relative h-64 md:h-96 overflow-hidden">
            <Image
              src={restaurant.images[0] || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  {restaurant.cuisineType} • {restaurant.address}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-1 flex items-center justify-end gap-1">
                  <StarIcon className="h-6 w-6" />
                  {restaurant.rating.average.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {restaurant.rating.count} reviews
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{restaurant.description}</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                  restaurant.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                <UsersIcon className="h-4 w-4" />
                {restaurant.crowdLevel} Crowd
              </span>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                {restaurant.crowdData?.currentVisitors ?? 0} visitors
              </span>
            </div>
            {isAuthenticated && (
              <Button
                variant={isFavorite ? 'outline' : 'primary'}
                onClick={handleToggleFavorite}
                isLoading={favoriteLoading || removeFavoriteLoading}
              >
                {isFavorite ? (
                  <>
                    <HeartIcon className="h-5 w-5 mr-2 fill-red-500" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Add to Favorites
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-medium ${activeTab === 'menu'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium ${activeTab === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'map'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <MapPinIcon className="h-5 w-5" />
            Map
          </button>
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            {menuLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <div className="p-4">
                      <Skeleton variant="text" className="h-6 w-1/2 mb-2" />
                      <Skeleton variant="text" className="h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-gray-600">
                  No menu items available
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  menuItems.reduce((acc: Record<string, typeof menuItems>, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{category}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Card key={item.id}>
                          <div className="p-4 flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              )}
                              <p className="text-lg font-bold text-blue-600">${item.price.toFixed(2)}</p>
                            </div>
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="object-cover rounded ml-4"
                              />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {isAuthenticated && (
              <Card className="mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                    <Select
                      label="Rating"
                      value={watch('rating')?.toString() || ''}
                      onChange={(value) => setValue('rating', parseInt(value), { shouldValidate: true })}
                      options={[
                        { value: '5', label: '5 - Excellent' },
                        { value: '4', label: '4 - Very Good' },
                        { value: '3', label: '3 - Good' },
                        { value: '2', label: '2 - Fair' },
                        { value: '1', label: '1 - Poor' },
                      ]}
                      placeholder="Select rating"
                      error={errors.rating?.message}
                    />
                    <Input
                      label="Comment (optional)"
                      {...register('comment')}
                      error={errors.comment?.message}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={reviewLoading}
                    >
                      Submit Review
                    </Button>
                  </form>
                </div>
              </Card>
            )}

            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <div className="p-4">
                      <Skeleton variant="text" className="h-6 w-1/2 mb-2" />
                      <Skeleton variant="text" className="h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-gray-600">
                  No reviews yet. Be the first to review!
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user?.name || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-yellow-500">
                              {'⭐'.repeat(review.rating)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Location</h3>
                <div className="h-96 rounded-lg overflow-hidden">
                  <RestaurantMap
                    restaurants={[restaurant]}
                    center={restaurant.location}
                    height="100%"
                  />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-gray-900">Address:</span> {restaurant.address}
                  </p>
                  {restaurant.location && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Coordinates:</span>{' '}
                      {restaurant.location.lat.toFixed(6)}, {restaurant.location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
