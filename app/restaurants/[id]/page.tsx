'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RESTAURANT_BY_ID } from '@/graphql/queries/restaurants';
import { GET_MENU_BY_RESTAURANT } from '@/graphql/queries/menu';
import { GET_REVIEWS_BY_RESTAURANT } from '@/graphql/queries/reviews';
import { ADD_FAVORITE_RESTAURANT, ADD_REVIEW } from '@/graphql/mutations/user';
import { useAuthStore } from '@/store/auth-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Restaurant, Menu, Review } from '@/types';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');

  const { data: restaurantData, loading: restaurantLoading } = useQuery<{ getRestaurantById: Restaurant }>(GET_RESTAURANT_BY_ID, {
    variables: { id: restaurantId },
  });

  const { data: menuData, loading: menuLoading } = useQuery<{ getMenuByRestaurant: Menu[] }>(GET_MENU_BY_RESTAURANT, {
    variables: { restaurantId },
  });

  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useQuery<{ getReviewsByRestaurant: Review[] }>(
    GET_REVIEWS_BY_RESTAURANT,
    {
      variables: { restaurantId, limit: 10 },
    }
  );

  const [addFavorite, { loading: favoriteLoading }] = useMutation(ADD_FAVORITE_RESTAURANT);
  const [addReview, { loading: reviewLoading }] = useMutation(ADD_REVIEW);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const restaurant = restaurantData?.getRestaurantById;
  const menuItems = menuData?.getMenuByRestaurant || [];
  const reviews = reviewsData?.getReviewsByRestaurant || [];

  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      await addFavorite({ variables: { restaurantId } });
      toast.success('Added to favorites!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add favorite');
    }
  };

  const onSubmitReview = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Please login to add reviews');
      return;
    }

    try {
      await addReview({
        variables: {
          input: {
            restaurantId,
            rating: data.rating,
            comment: data.comment,
          },
        },
      });
      toast.success('Review added!');
      reset();
      refetchReviews();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add review');
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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-600">Restaurant not found</p>
        </div>
      </div>
    );
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
                <p className="text-gray-600">{restaurant.cuisineType} • {restaurant.address}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {restaurant.rating.average.toFixed(1)} ⭐
                </div>
                <div className="text-sm text-gray-500">
                  {restaurant.rating.count} reviews
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{restaurant.description}</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${restaurant.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                  restaurant.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                {restaurant.crowdLevel} Crowd
              </span>
              {restaurant.crowdData && (
                <span className="text-sm text-gray-600">
                  {restaurant.crowdData.currentVisitors} visitors
                </span>
              )}
            </div>
            {isAuthenticated && (
              <Button
                variant="primary"
                onClick={handleAddFavorite}
                isLoading={favoriteLoading}
              >
                Add to Favorites
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <select
                        {...register('rating', { valueAsNumber: true })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
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
      </div>
    </div>
  );
}
