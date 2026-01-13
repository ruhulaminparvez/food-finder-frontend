'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';
import { CREATE_RESTAURANT, UPDATE_RESTAURANT, DELETE_RESTAURANT } from '@/graphql/mutations/restaurant';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateRestaurantInput, Restaurant } from '@/types';

const CUISINE_TYPES = ['Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'American', 'Thai', 'French'];

const restaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  cuisineType: z.string().min(1, 'Cuisine type is required'),
  address: z.string().min(5, 'Address is required'),
  lat: z.number(),
  lng: z.number(),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

export default function AdminRestaurantsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<{ getRestaurants: Restaurant[] }>(GET_RESTAURANTS, {
    variables: { limit: 50 },
  });

  const [createRestaurant] = useMutation(CREATE_RESTAURANT);
  const [updateRestaurant] = useMutation(UPDATE_RESTAURANT);
  const [deleteRestaurant] = useMutation(DELETE_RESTAURANT);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      lat: 0,
      lng: 0,
    },
  });

  const restaurants = data?.getRestaurants || [];

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      const input: CreateRestaurantInput = {
        name: data.name,
        description: data.description,
        cuisineType: data.cuisineType,
        address: data.address,
        location: { lat: data.lat, lng: data.lng },
        openingHours: [
          { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
          { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
          { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
          { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
          { day: 'Friday', open: '09:00', close: '22:00', isClosed: false },
          { day: 'Saturday', open: '09:00', close: '22:00', isClosed: false },
          { day: 'Sunday', open: '09:00', close: '22:00', isClosed: false },
        ],
        images: data.imageUrl && data.imageUrl.trim() ? [data.imageUrl.trim()] : [],
      };

      if (editingId) {
        await updateRestaurant({
          variables: {
            id: editingId,
            input: {
              name: input.name,
              description: input.description,
              cuisineType: input.cuisineType,
              address: input.address,
              location: input.location,
              images: input.images,
            },
          },
        });
        toast.success('Restaurant updated!');
      } else {
        await createRestaurant({ variables: { input } });
        toast.success('Restaurant created!');
      }

      reset();
      setIsCreating(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save restaurant');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await deleteRestaurant({ variables: { id } });
      toast.success('Restaurant deleted!');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete restaurant');
    }
  };

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Restaurants</h1>
            <Button
              variant="primary"
              onClick={() => {
                setIsCreating(true);
                setEditingId(null);
                reset();
              }}
            >
              Add Restaurant
            </Button>
          </div>

          {(isCreating || editingId) && (
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {editingId ? 'Edit Restaurant' : 'Create Restaurant'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="e.g., The Italian Bistro"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Description"
                    placeholder="Enter a detailed description of the restaurant..."
                    {...register('description')}
                    error={errors.description?.message}
                  />
                  <Select
                    label="Cuisine Type"
                    value={watch('cuisineType') || ''}
                    onChange={(value) => setValue('cuisineType', value, { shouldValidate: true })}
                    options={CUISINE_TYPES.map((cuisine) => ({
                      value: cuisine,
                      label: cuisine,
                    }))}
                    placeholder="Select cuisine type"
                    error={errors.cuisineType?.message}
                  />
                  <Input
                    label="Address"
                    placeholder="e.g., 123 Main Street, City, State"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                  <div>
                    <Input
                      label="Image URL"
                      type="url"
                      placeholder="https://example.com/restaurant-image.jpg"
                      {...register('imageUrl')}
                      error={errors.imageUrl?.message}
                    />
                    {watch('imageUrl') && watch('imageUrl')?.trim() && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                        <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={watch('imageUrl') || ''}
                            alt="Restaurant preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 40.7128"
                      {...register('lat', { valueAsNumber: true })}
                      error={errors.lat?.message}
                    />
                    <Input
                      label="Longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., -74.0060"
                      {...register('lng', { valueAsNumber: true })}
                      error={errors.lng?.message}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" variant="primary">
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
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
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id}>
                  <div className="p-6 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {restaurant.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{restaurant.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{restaurant.cuisineType}</span>
                        <span>•</span>
                        <span>{restaurant.address}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(restaurant.id);
                          setIsCreating(false);
                          reset({
                            name: restaurant.name,
                            description: restaurant.description,
                            cuisineType: restaurant.cuisineType,
                            address: restaurant.address,
                            lat: restaurant.location.lat,
                            lng: restaurant.location.lng,
                            imageUrl: restaurant.images && restaurant.images.length > 0 ? restaurant.images[0] : '',
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(restaurant.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
