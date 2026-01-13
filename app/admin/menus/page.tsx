'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';
import { GET_MENU_BY_RESTAURANT } from '@/graphql/queries/menu';
import { ADD_MENU_ITEM, UPDATE_MENU_ITEM, DELETE_MENU_ITEM } from '@/graphql/mutations/menu';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Restaurant, Menu } from '@/types';

const menuSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url().optional().or(z.literal('')),
});

type MenuFormData = z.infer<typeof menuSchema>;

export default function AdminMenusPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: restaurantsData, loading: restaurantsLoading, error: restaurantsError, refetch: refetchRestaurants } = useQuery<{ getRestaurants: Restaurant[] }>(
    GET_RESTAURANTS,
    {
      variables: { limit: 100, offset: 0 },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: menuData, loading: menuLoading, refetch: refetchMenu } = useQuery<{ getMenuByRestaurant: Menu[] }>(
    GET_MENU_BY_RESTAURANT,
    {
      variables: { restaurantId: selectedRestaurant },
      skip: !selectedRestaurant,
      fetchPolicy: 'cache-and-network',
    }
  );

  const [addMenuItem] = useMutation(ADD_MENU_ITEM, {
    refetchQueries: [{ query: GET_RESTAURANTS, variables: { limit: 100, offset: 0 } }],
  });
  const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM, {
    refetchQueries: [{ query: GET_RESTAURANTS, variables: { limit: 100, offset: 0 } }],
  });
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM, {
    refetchQueries: [{ query: GET_RESTAURANTS, variables: { limit: 100, offset: 0 } }],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
  });

  const restaurants = restaurantsData?.getRestaurants || [];
  const menuItems = menuData?.getMenuByRestaurant || [];

  const onSubmit = async (data: MenuFormData) => {
    try {
      if (editingId) {
        await updateMenuItem({
          variables: {
            id: editingId,
            input: {
              name: data.name,
              description: data.description,
              price: data.price,
              category: data.category,
              image: data.image,
            },
          },
        });
        toast.success('Menu item updated!');
      } else {
        await addMenuItem({
          variables: {
            input: {
              restaurantId: data.restaurantId,
              name: data.name,
              description: data.description,
              price: data.price,
              category: data.category,
              image: data.image,
            },
          },
        });
        toast.success('Menu item added!');
      }

      reset();
      setEditingId(null);
      refetchMenu();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save menu item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await deleteMenuItem({ variables: { id } });
      toast.success('Menu item deleted!');
      refetchMenu();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete menu item');
    }
  };

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Menu Items</h1>

          {/* Restaurant Selector */}
          <Card className="mb-8">
            <div className="p-6">
              {restaurantsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm mb-2">
                    Error loading restaurants: {restaurantsError.message}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchRestaurants()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
              {restaurantsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading restaurants...</p>
                </div>
              ) : restaurants.length > 0 ? (
                <Select
                  label="Select Restaurant"
                  value={selectedRestaurant}
                  onChange={(value) => {
                    setSelectedRestaurant(value);
                    reset();
                    setEditingId(null);
                  }}
                  options={[
                    { value: '', label: 'Select a restaurant...' },
                    ...restaurants
                      .filter((restaurant) => restaurant.id && restaurant.name)
                      .map((restaurant) => ({
                        value: restaurant.id,
                        label: restaurant.name,
                      })),
                  ]}
                  placeholder="Select a restaurant..."
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No restaurants available. Please add restaurants first.</p>
                  <Button
                    variant="primary"
                    onClick={() => refetchRestaurants()}
                  >
                    Refresh List
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {selectedRestaurant && (
            <>
              {/* Menu Item Form */}
              <Card className="mb-8">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {editingId ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register('restaurantId')} value={selectedRestaurant} />
                    <Input
                      label="Name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                    <Input
                      label="Description (optional)"
                      {...register('description')}
                      error={errors.description?.message}
                    />
                    <Input
                      label="Price"
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message}
                    />
                    <Input
                      label="Category"
                      {...register('category')}
                      error={errors.category?.message}
                    />
                    <Input
                      label="Image URL (optional)"
                      type="url"
                      {...register('image')}
                      error={errors.image?.message}
                    />
                    <div className="flex gap-4">
                      <Button type="submit" variant="primary">
                        {editingId ? 'Update' : 'Add'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>

              {/* Menu Items List */}
              {menuLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading menu items...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {menuItems.length === 0 ? (
                    <Card>
                      <div className="p-8 text-center text-gray-600">
                        No menu items yet. Add your first item above.
                      </div>
                    </Card>
                  ) : (
                    menuItems.map((item) => (
                      <Card key={item.id}>
                        <div className="p-6 flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-gray-600 mb-2">{item.description}</p>
                            )}
                            <div className="flex gap-4 text-sm">
                              <span className="text-blue-600 font-semibold">
                                ${item.price.toFixed(2)}
                              </span>
                              <span className="text-gray-500">{item.category}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(item.id);
                                reset({
                                  restaurantId: selectedRestaurant,
                                  name: item.name,
                                  description: item.description || '',
                                  price: item.price,
                                  category: item.category,
                                  image: item.image || '',
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
