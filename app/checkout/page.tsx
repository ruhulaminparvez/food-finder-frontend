'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { GET_CART } from '@/graphql/queries/cart';
import { CREATE_ORDER } from '@/graphql/mutations/order';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Cart, CartItem, Order, CreateOrderInput } from '@/types';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  specialInstructions: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apolloClient = useApolloClient();
  const restaurantId = searchParams.get('restaurantId');
  const { isAuthenticated } = useAuthStore();
  const { setCart, clearCart: clearCartStore } = useCartStore();
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data, loading } = useQuery<{ getCart: Cart | null }>(GET_CART, {
    variables: { restaurantId: restaurantId || '' },
    skip: !isAuthenticated || !restaurantId,
    fetchPolicy: 'cache-and-network',
  });

  // Update cart store when data changes
  useEffect(() => {
    if (restaurantId) {
      // Update store with cart data (can be null if cart is empty)
      setCart(restaurantId, data?.getCart || null);
    }
  }, [data, restaurantId, setCart]);

  const [createOrder, { loading: creatingOrder }] = useMutation<{ createOrder: Order }>(CREATE_ORDER, {
    refetchQueries: [
      { query: GET_CART, variables: { restaurantId: restaurantId || '' } },
    ],
    awaitRefetchQueries: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const cart = data?.getCart;

  useEffect(() => {
    if (!restaurantId) {
      router.push('/restaurants');
      return;
    }

    if (cart && cart.items.length === 0) {
      toast.error('Your cart is empty');
      router.push(`/restaurants/${restaurantId}`);
      return;
    }
  }, [restaurantId, cart, router]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Location captured');
        },
        (error) => {
          toast.error('Failed to get location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!restaurantId || !cart || cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      // Only include deliveryLocation if it has both lat and lng
      const orderInput: CreateOrderInput = {
        restaurantId,
        deliveryAddress: data.deliveryAddress,
        specialInstructions: data.specialInstructions || undefined,
      };

      // Only add deliveryLocation if it's complete and valid
      if (
        deliveryLocation &&
        typeof deliveryLocation.lat === 'number' &&
        typeof deliveryLocation.lng === 'number' &&
        !isNaN(deliveryLocation.lat) &&
        !isNaN(deliveryLocation.lng)
      ) {
        orderInput.deliveryLocation = {
          lat: deliveryLocation.lat,
          lng: deliveryLocation.lng,
        };
      }

      const result = await createOrder({
        variables: {
          input: orderInput,
        },
      });

      if (result.data?.createOrder) {
        // Clear cart from Zustand store
        if (restaurantId) {
          clearCartStore(restaurantId);
          
          // Clear cart from Apollo cache
          apolloClient.writeQuery({
            query: GET_CART,
            variables: { restaurantId },
            data: { getCart: null },
          });
          
          // Refetch cart query to ensure all components see the update
          await apolloClient.refetchQueries({
            include: [GET_CART],
          });
        }
        
        toast.success('Order placed successfully!');
        router.push(`/orders/${result.data.createOrder.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    }
  };

  if (!restaurantId) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/restaurants/${restaurantId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Restaurant
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            </div>
            <p className="text-gray-600">Review your order and complete your purchase</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <Skeleton variant="text" className="h-6 w-1/4 mb-4" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton variant="rectangular" className="h-20 w-20 rounded" />
                        <div className="flex-1">
                          <Skeleton variant="text" className="h-5 w-3/4 mb-2" />
                          <Skeleton variant="text" className="h-4 w-full mb-2" />
                          <Skeleton variant="text" className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <ShoppingBagIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add items to your cart before checkout</p>
                <Link href={`/restaurants/${restaurantId}`}>
                  <Button variant="primary">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Summary */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                    </div>
                    <div className="space-y-4">
                      {cart.items.map((item: CartItem) => (
                        <div
                          key={item.menuItemId}
                          className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                        >
                          {item.menuItem?.image ? (
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <Image
                                src={item.menuItem.image}
                                alt={item.name}
                                fill
                                className="rounded-lg object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                            {item.menuItem?.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.menuItem.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Quantity: <span className="font-medium">{item.quantity}</span>
                              </span>
                              <span className="font-semibold text-blue-600 text-lg">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Delivery Information */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <TruckIcon className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Delivery Information</h2>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <Input
                        label="Delivery Address"
                        {...register('deliveryAddress')}
                        error={errors.deliveryAddress?.message}
                        placeholder="Enter your delivery address (e.g., 123 Main St, City, State)"
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Location (Optional)
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          className="w-full"
                        >
                          <MapPinIcon className="h-5 w-5 mr-2" />
                          {deliveryLocation ? 'Location Captured ✓' : 'Use Current Location'}
                        </Button>
                        {deliveryLocation && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                              <CheckCircleIcon className="h-4 w-4" />
                              Location captured successfully
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Lat: {deliveryLocation.lat.toFixed(6)}, Lng: {deliveryLocation.lng.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </div>

                      <Input
                        label="Special Instructions (Optional)"
                        {...register('specialInstructions')}
                        error={errors.specialInstructions?.message}
                        placeholder="Any special instructions for delivery (e.g., leave at door, call on arrival)"
                        multiline
                        rows={3}
                      />
                    </form>
                  </div>
                </Card>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCardIcon className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Order Total</h2>
                    </div>

                    {cart.restaurant && (
                      <div className="mb-6 pb-6 border-b">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{cart.restaurant.name}</p>
                            <p className="text-sm text-gray-600 flex items-start gap-1">
                              <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{cart.restaurant.address}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-medium">${cart.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Delivery Fee</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${cart.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={creatingOrder}
                        onClick={handleSubmit(onSubmit)}
                      >
                        <CreditCardIcon className="h-5 w-5 mr-2" />
                        Place Order
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-4">
                        By placing this order, you agree to our terms and conditions
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
