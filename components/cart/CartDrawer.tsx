'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CART } from '@/graphql/queries/cart';
import { UPDATE_CART_ITEM, REMOVE_FROM_CART, CLEAR_CART } from '@/graphql/mutations/cart';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import {
  XMarkIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { Cart, CartItem } from '@/types';
import Skeleton from '@/components/ui/Skeleton';

interface CartDrawerProps {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ restaurantId, isOpen, onClose }: CartDrawerProps) {
  const { isAuthenticated } = useAuthStore();
  const { setCart, clearCart: clearCartStore } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Set mounted state - using setTimeout to avoid synchronous setState in effect
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const { data, loading, refetch } = useQuery<{ getCart: Cart | null }>(GET_CART, {
    variables: { restaurantId },
    skip: !isAuthenticated || !isOpen,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // Refetch cart when drawer opens to ensure fresh data
  useEffect(() => {
    if (isOpen && isAuthenticated && restaurantId) {
      refetch();
    }
  }, [isOpen, isAuthenticated, restaurantId, refetch]);

  // Update cart store when data changes
  useEffect(() => {
    // Update store with cart data (can be null if cart is empty)
    setCart(restaurantId, data?.getCart || null);
  }, [data, restaurantId, setCart]);

  const [updateCartItem, { loading: updatingCart }] = useMutation<{ updateCartItem: Cart }>(UPDATE_CART_ITEM, {
    refetchQueries: [{ query: GET_CART, variables: { restaurantId } }],
    awaitRefetchQueries: true,
  });

  const [removeFromCart, { loading: removingItem }] = useMutation<{ removeFromCart: Cart }>(REMOVE_FROM_CART, {
    refetchQueries: [{ query: GET_CART, variables: { restaurantId } }],
    awaitRefetchQueries: true,
  });

  const [clearCartMutation, { loading: clearingCart }] = useMutation(CLEAR_CART, {
    refetchQueries: [{ query: GET_CART, variables: { restaurantId } }],
    awaitRefetchQueries: true,
  });

  const cart = data?.getCart;

  const handleUpdateQuantity = async (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(menuItemId);
      return;
    }

    // Prevent multiple simultaneous updates for the same item
    if (updatingItems.has(menuItemId)) {
      return;
    }

    // Check if item exists in current cart before updating
    if (!cart || !cart.items.find(item => item.menuItemId === menuItemId)) {
      toast.error('Item no longer in cart. Refreshing...');
      await refetch();
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(menuItemId));

    try {
      const result = await updateCartItem({
        variables: { restaurantId, menuItemId, quantity: newQuantity },
      });
      
      if (result.data?.updateCartItem) {
        // Update cart store immediately
        setCart(restaurantId, result.data.updateCartItem);
        // The refetchQueries will update the query cache automatically
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart';
      
      // If item not found, refetch cart to get latest state
      if (errorMessage.includes('Item not found in cart') || errorMessage.includes('Cart not found')) {
        toast.error('Cart was updated. Refreshing...');
        await refetch();
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(menuItemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (menuItemId: string) => {
    // Prevent multiple simultaneous removals for the same item
    if (updatingItems.has(menuItemId)) {
      return;
    }

    // Check if item exists in current cart before removing
    if (!cart || !cart.items.find(item => item.menuItemId === menuItemId)) {
      toast.error('Item no longer in cart. Refreshing...');
      await refetch();
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(menuItemId));

    try {
      const result = await removeFromCart({
        variables: { restaurantId, menuItemId },
      });
      
      if (result.data?.removeFromCart) {
        // Update cart store immediately
        setCart(restaurantId, result.data.removeFromCart);
        // The refetchQueries will update the query cache automatically
        toast.success('Item removed from cart');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      
      // If item not found, refetch cart to get latest state
      if (errorMessage.includes('Item not found in cart') || errorMessage.includes('Cart not found')) {
        toast.error('Cart was updated. Refreshing...');
        await refetch();
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(menuItemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation({ variables: { restaurantId } });
      clearCartStore(restaurantId);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  };

  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              {cart && cart.restaurant && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                  <MapPinIcon className="h-3 w-3" />
                  {cart.restaurant.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
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
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Add delicious items to your cart to get started
              </p>
              <Button variant="primary" onClick={onClose} className="w-full max-w-xs">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item: CartItem) => (
                <div
                  key={item.menuItemId}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
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
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                      {item.menuItem?.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.menuItem.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                            disabled={updatingItems.has(item.menuItemId) || updatingCart}
                            className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-4 w-4 text-gray-700" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {updatingItems.has(item.menuItemId) ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                            disabled={updatingItems.has(item.menuItemId) || updatingCart}
                            className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.menuItemId)}
                          disabled={updatingItems.has(item.menuItemId) || removingItem}
                          className="ml-auto p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remove item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t bg-gray-50 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>$0.00</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${cart.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearCart}
                isLoading={clearingCart}
                disabled={clearingCart || updatingCart || removingItem}
                className="flex-1 cursor-pointer"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Link href={`/checkout?restaurantId=${restaurantId}`} className="flex-1">
                <Button 
                  variant="primary" 
                  className="w-full cursor-pointer" 
                  onClick={onClose}
                  disabled={updatingCart || removingItem || clearingCart}
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Checkout
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
        )}
      </div>
    </>
  );

  // Render using portal to ensure it's above all content
  return createPortal(drawerContent, document.body);
}
