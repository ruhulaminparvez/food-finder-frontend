'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RESTAURANT_BY_ID } from '@/graphql/queries/restaurants';
import { GET_MENU_BY_RESTAURANT } from '@/graphql/queries/menu';
import { GET_REVIEWS_BY_RESTAURANT } from '@/graphql/queries/reviews';
import { ADD_FAVORITE_RESTAURANT, REMOVE_FAVORITE_RESTAURANT, ADD_REVIEW } from '@/graphql/mutations/user';
import { GET_USER_FAVORITES } from '@/graphql/queries/user';
import { GET_CART } from '@/graphql/queries/cart';
import { ADD_TO_CART } from '@/graphql/mutations/cart';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import CartDrawer from '@/components/cart/CartDrawer';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Restaurant, Menu, Review, Cart } from '@/types';
import {
  StarIcon,
  HeartIcon,
  MapPinIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/solid';
import {
  ShoppingCartIcon,
  PlusIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon as MapPinOutlineIcon,
  UserCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
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
  const { setCart, getTotalItems } = useCartStore();
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'map'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const { data: cartData } = useQuery<{ getCart: Cart | null }>(GET_CART, {
    variables: { restaurantId },
    skip: !isAuthenticated || !restaurantId,
    fetchPolicy: 'cache-and-network',
  });

  // Update cart store when data changes
  useEffect(() => {
    if (restaurantId) {
      // Update store with cart data (can be null if cart is empty)
      setCart(restaurantId, cartData?.getCart || null);
    }
  }, [cartData, restaurantId, setCart]);

  const [addToCart, { loading: addingToCart }] = useMutation<{ addToCart: Cart }>(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART, variables: { restaurantId } }],
  });

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
  const cartItemCount = getTotalItems(restaurantId);

  const handleAddToCart = async (menuItemId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const result = await addToCart({
        variables: { restaurantId, menuItemId, quantity: 1 },
      });
      if (result.data?.addToCart) {
        setCart(restaurantId, result.data.addToCart);
        toast.success('Added to cart!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

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
        <Card className="mb-6 overflow-hidden shadow-lg border-0">
          <div className="relative h-64 md:h-96 overflow-hidden group">
            <Image
              src={restaurant.images[0] || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Rating Badge - Floating */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-gray-900">
                  {restaurant.rating.average.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {restaurant.rating.count} {restaurant.rating.count === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/restaurants"
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-900" />
            </Link>
          </div>

          <div className="p-6 md:p-8 bg-white">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{restaurant.cuisineType}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{restaurant.address}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {restaurant.description}
              </p>
            </div>

            {/* Stats & Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${restaurant.crowdLevel === 'LOW'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                  : restaurant.crowdLevel === 'MEDIUM'
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                }`}>
                <UsersIcon className={`h-4 w-4 ${restaurant.crowdLevel === 'LOW' ? 'text-green-600' :
                    restaurant.crowdLevel === 'MEDIUM' ? 'text-yellow-600' :
                      'text-red-600'
                  }`} />
                <span>{restaurant.crowdLevel} Crowd</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-semibold flex items-center gap-2 shadow-sm border border-blue-200">
                <UsersIcon className="h-4 w-4 text-blue-600" />
                <span>{restaurant.crowdData?.currentVisitors ?? 0} visitors now</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isAuthenticated && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={isFavorite ? 'outline' : 'primary'}
                  onClick={handleToggleFavorite}
                  isLoading={favoriteLoading || removeFavoriteLoading}
                  className="cursor-pointer transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {isFavorite ? (
                    <>
                      <HeartIcon className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
                      <span className="font-semibold">Remove from Favorites</span>
                    </>
                  ) : (
                    <>
                      <HeartIcon className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Add to Favorites</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsCartOpen(true)}
                  className="relative cursor-pointer transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">View Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-medium cursor-pointer ${activeTab === 'menu'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium cursor-pointer ${activeTab === 'reviews'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 font-medium flex items-center gap-2 cursor-pointer ${activeTab === 'map'
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
              <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton variant="text" className="h-7 w-32 mb-4" />
                    <div className="space-y-4">
                      {[...Array(2)].map((_, j) => (
                        <Card key={j}>
                          <div className="p-6">
                            <div className="flex gap-4">
                              <Skeleton variant="rectangular" className="h-24 w-24 rounded-lg flex-shrink-0" />
                              <div className="flex-1">
                                <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
                                <Skeleton variant="text" className="h-4 w-full mb-2" />
                                <Skeleton variant="text" className="h-4 w-2/3 mb-3" />
                                <div className="flex justify-between items-center">
                                  <Skeleton variant="text" className="h-6 w-20" />
                                  <Skeleton variant="rectangular" className="h-9 w-28 rounded" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <Card>
                <div className="p-16 text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <SparklesIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items Available</h3>
                  <p className="text-gray-600">Check back later for menu updates</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(
                  menuItems.reduce((acc: Record<string, typeof menuItems>, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category} className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">{category}</h3>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <Card
                          key={item.id}
                          hover
                          className="overflow-hidden group"
                        >
                          <div className="flex flex-col sm:flex-row">
                            {item.image ? (
                              <div className="relative w-full sm:w-32 h-48 sm:h-auto flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="w-full sm:w-32 h-48 sm:h-auto flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <SparklesIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 p-5 flex flex-col">
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                  {item.name}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                  <span className="text-2xl font-bold text-blue-600">
                                    ${item.price.toFixed(2)}
                                  </span>
                                </div>
                                {isAuthenticated && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleAddToCart(item.id)}
                                    isLoading={addingToCart}
                                    className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
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

        {/* Cart Drawer */}
        {isAuthenticated && (
          <CartDrawer
            restaurantId={restaurantId}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {isAuthenticated && (
              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                  </div>
                  <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-5">
                    <Select
                      label="Rating"
                      value={watch('rating')?.toString() || ''}
                      onChange={(value) => setValue('rating', parseInt(value), { shouldValidate: true })}
                      options={[
                        { value: '5', label: '5 - Excellent ⭐⭐⭐⭐⭐' },
                        { value: '4', label: '4 - Very Good ⭐⭐⭐⭐' },
                        { value: '3', label: '3 - Good ⭐⭐⭐' },
                        { value: '2', label: '2 - Fair ⭐⭐' },
                        { value: '1', label: '1 - Poor ⭐' },
                      ]}
                      placeholder="Select rating"
                      error={errors.rating?.message}
                    />
                    <Input
                      label="Comment (optional)"
                      {...register('comment')}
                      error={errors.comment?.message}
                      placeholder="Share your experience..."
                      multiline
                      rows={4}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={reviewLoading}
                      className="w-full sm:w-auto cursor-pointer"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Submit Review
                    </Button>
                  </form>
                </div>
              </Card>
            )}

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Reviews ({reviews.length})
                  </h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <div className="p-6">
                        <div className="flex gap-4">
                          <Skeleton variant="rectangular" className="h-12 w-12 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <Skeleton variant="text" className="h-5 w-1/3 mb-2" />
                            <Skeleton variant="text" className="h-4 w-1/4 mb-3" />
                            <Skeleton variant="text" className="h-4 w-full mb-1" />
                            <Skeleton variant="text" className="h-4 w-3/4" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <div className="p-16 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                    {!isAuthenticated && (
                      <Link href="/login">
                        <Button variant="primary">Login to Review</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} hover className="transition-all">
                      <div className="p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <UserCircleIcon className="h-8 w-8 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">
                                  {review.user?.name || 'Anonymous'}
                                </h4>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-gray-300'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mt-3 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="flex items-center gap-2">
                <MapPinOutlineIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Location</h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200 mb-6">
                  <RestaurantMap
                    restaurants={[restaurant]}
                    center={restaurant.location}
                    height="100%"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Address</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{restaurant.address}</p>
                  </div>
                  {restaurant.location && (
                    <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinOutlineIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Coordinates</span>
                      </div>
                      <p className="text-gray-700 font-mono text-sm">
                        {restaurant.location.lat.toFixed(6)}, {restaurant.location.lng.toFixed(6)}
                      </p>
                    </div>
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
