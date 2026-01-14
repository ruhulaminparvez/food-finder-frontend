'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ORDER_BY_ID } from '@/graphql/queries/order';
import { CANCEL_ORDER, UPDATE_ORDER_STATUS } from '@/graphql/mutations/order';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { OrderStatus, Order } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { generateOrderPDF } from '@/utils/pdf-generator';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAuthStore();

  const { data, loading, refetch } = useQuery<{ getOrderById: Order | null }>(GET_ORDER_BY_ID, {
    variables: { orderId },
    skip: !orderId,
    fetchPolicy: 'cache-and-network',
  });

  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER, {
    refetchQueries: [{ query: GET_ORDER_BY_ID, variables: { orderId } }],
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    refetchQueries: [{ query: GET_ORDER_BY_ID, variables: { orderId } }],
  });

  const order = data?.getOrderById;

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrder({ variables: { orderId } });
      toast.success('Order cancelled');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
    }
  };

  const handleDownloadPDF = () => {
    if (!order) return;
    try {
      generateOrderPDF(order);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.READY:
        return 'bg-green-100 text-green-800';
      case OrderStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5" />;
      case OrderStatus.CANCELLED:
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const canCancel = order && (order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED);
  const isOwner = order && order.userId === user?.id;
  const isRestaurantOwner = order && order.restaurant?.ownerId === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton variant="text" className="h-8 w-48 mb-4" />
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <Skeleton variant="text" className="h-6 w-1/4 mb-4" />
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton variant="rectangular" className="h-20 w-20 rounded-lg flex-shrink-0" />
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
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="p-16 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <ShoppingBagIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">The order you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/restaurants">
                <Button variant="primary">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Restaurants
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/restaurants">
              <Button variant="ghost" className="mb-4 cursor-pointer">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Restaurants
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4" />
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Restaurant Info */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Restaurant</h2>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900 mb-2">{order.restaurant?.name}</p>
                    <p className="text-sm text-gray-600 flex items-start gap-1 mb-1">
                      <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.restaurant?.address}</span>
                    </p>
                    <p className="text-sm text-gray-600">{order.restaurant?.cuisineType}</p>
                  </div>
                </div>
              </Card>

              {/* Order Items */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item) => (
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
              {order.deliveryAddress && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <TruckIcon className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Delivery Information</h2>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 flex items-start gap-2">
                        <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                      {order.deliveryLocation && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                          <p className="text-sm text-gray-700 font-mono">
                            {order.deliveryLocation.lat.toFixed(6)}, {order.deliveryLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Special Instructions */}
              {order.specialInstructions && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <SparklesIcon className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Special Instructions</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{order.specialInstructions}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Fee</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Download PDF Button - Show when order is CONFIRMED */}
                  {order.status === OrderStatus.CONFIRMED && (
                    <Button
                      variant="primary"
                      className="w-full mb-4 cursor-pointer"
                      onClick={handleDownloadPDF}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Download Receipt
                    </Button>
                  )}

                  {canCancel && isOwner && (
                    <Button
                      variant="danger"
                      className="w-full mb-4 cursor-pointer"
                      onClick={handleCancelOrder}
                      isLoading={cancelling}
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Cancel Order
                    </Button>
                  )}

                  {(isRestaurantOwner || isAdmin) && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Update Status:</p>
                      {order.status === OrderStatus.PENDING && (
                        <Button
                          variant="primary"
                          className="w-full cursor-pointer"
                          onClick={async () => {
                            try {
                              await updateOrderStatus({
                                variables: { orderId, status: OrderStatus.CONFIRMED },
                              });
                              toast.success('Order confirmed');
                            } catch {
                              toast.error('Failed to update order status');
                            }
                          }}
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Confirm Order
                        </Button>
                      )}
                      {order.status === OrderStatus.CONFIRMED && (
                        <Button
                          variant="primary"
                          className="w-full cursor-pointer"
                          onClick={async () => {
                            try {
                              await updateOrderStatus({
                                variables: { orderId, status: OrderStatus.PREPARING },
                              });
                              toast.success('Order status updated');
                            } catch {
                              toast.error('Failed to update order status');
                            }
                          }}
                        >
                          <ClockIcon className="h-5 w-5 mr-2" />
                          Start Preparing
                        </Button>
                      )}
                      {order.status === OrderStatus.PREPARING && (
                        <Button
                          variant="primary"
                          className="w-full cursor-pointer"
                          onClick={async () => {
                            try {
                              await updateOrderStatus({
                                variables: { orderId, status: OrderStatus.READY },
                              });
                              toast.success('Order is ready');
                            } catch {
                              toast.error('Failed to update order status');
                            }
                          }}
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Mark as Ready
                        </Button>
                      )}
                      {order.status === OrderStatus.READY && (
                        <Button
                          variant="primary"
                          className="w-full cursor-pointer"
                          onClick={async () => {
                            try {
                              await updateOrderStatus({
                                variables: { orderId, status: OrderStatus.COMPLETED },
                              });
                              toast.success('Order completed');
                            } catch {
                              toast.error('Failed to update order status');
                            }
                          }}
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Complete Order
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
