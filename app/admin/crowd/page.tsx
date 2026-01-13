'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RESTAURANTS } from '@/graphql/queries/restaurants';
import { GET_LIVE_CROWD_DATA } from '@/graphql/queries/restaurants';
import { UPDATE_CROWD_DATA } from '@/graphql/mutations/crowd';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CrowdLevel, Restaurant, CrowdData } from '@/types';

const crowdSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant is required'),
  currentVisitors: z.number().min(0, 'Visitors must be positive'),
  crowdLevel: z.nativeEnum(CrowdLevel),
});

type CrowdFormData = z.infer<typeof crowdSchema>;

export default function AdminCrowdPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');

  const { data: restaurantsData } = useQuery<{ getRestaurants: Restaurant[] }>(GET_RESTAURANTS, {
    variables: { limit: 100 },
  });

  const { data: crowdData, refetch: refetchCrowd } = useQuery<{ getLiveCrowdData: CrowdData }>(GET_LIVE_CROWD_DATA, {
    variables: { restaurantId: selectedRestaurant },
    skip: !selectedRestaurant,
  });

  const [updateCrowdData, { loading }] = useMutation(UPDATE_CROWD_DATA);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CrowdFormData>({
    resolver: zodResolver(crowdSchema),
    defaultValues: {
      crowdLevel: CrowdLevel.MEDIUM,
    },
  });

  const restaurants = restaurantsData?.getRestaurants || [];
  const currentCrowd = crowdData?.getLiveCrowdData;

  const onSubmit = async (data: CrowdFormData) => {
    try {
      await updateCrowdData({
        variables: {
          input: {
            restaurantId: data.restaurantId,
            currentVisitors: data.currentVisitors,
            crowdLevel: data.crowdLevel,
          },
        },
      });
      toast.success('Crowd data updated!');
      reset();
      refetchCrowd();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update crowd data');
    }
  };

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Crowd Data</h1>

          {/* Restaurant Selector */}
          <Card className="mb-8">
            <div className="p-6">
              <Select
                label="Select Restaurant"
                value={selectedRestaurant}
                onChange={(value) => {
                  setSelectedRestaurant(value);
                  reset();
                }}
                options={[
                  { value: '', label: 'Select a restaurant...' },
                  ...restaurants.map((restaurant) => ({
                    value: restaurant.id,
                    label: restaurant.name,
                  })),
                ]}
                placeholder="Select a restaurant..."
              />
            </div>
          </Card>

          {selectedRestaurant && (
            <>
              {/* Current Crowd Data */}
              {currentCrowd && (
                <Card className="mb-8">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Current Crowd Data</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Visitors</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {currentCrowd.currentVisitors}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Crowd Level</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                          currentCrowd.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                          currentCrowd.crowdLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {currentCrowd.crowdLevel}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-gray-900">
                          {new Date(currentCrowd.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Update Crowd Data Form */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Update Crowd Data</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register('restaurantId')} value={selectedRestaurant} />
                    <Input
                      label="Current Visitors"
                      type="number"
                      {...register('currentVisitors', { valueAsNumber: true })}
                      error={errors.currentVisitors?.message}
                    />
                    <Select
                      label="Crowd Level"
                      value={watch('crowdLevel') || ''}
                      onChange={(value) => setValue('crowdLevel', value as CrowdLevel, { shouldValidate: true })}
                      options={[
                        { value: CrowdLevel.LOW, label: 'Low' },
                        { value: CrowdLevel.MEDIUM, label: 'Medium' },
                        { value: CrowdLevel.HIGH, label: 'High' },
                      ]}
                      placeholder="Select crowd level"
                      error={errors.crowdLevel?.message}
                    />
                    <Button type="submit" variant="primary" isLoading={loading}>
                      Update Crowd Data
                    </Button>
                  </form>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
