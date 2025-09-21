'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/lib/api';
import { VehicleFilters, CreateVehicleDto, UpdateVehicleDto } from '@/types';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for vehicle data management using TanStack Query
 * @param {VehicleFilters} filters - Optional filters to apply
 * @returns {UseQueryResult<Vehicle[]>} Query result with vehicles data
 */
export const useVehicles = (filters?: VehicleFilters) => {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehicleApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleApi.getById(id),
    enabled: !!id,
  });
};

export const useVehicleStats = () => {
  return useQuery({
    queryKey: ['vehicle-stats'],
    queryFn: () => vehicleApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleDto) => vehicleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      toast.success('Vehicle created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create vehicle');
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleDto }) =>
      vehicleApi.update(id, data),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', updatedVehicle.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update vehicle');
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete vehicle');
    },
  });
};

export const useBulkDeleteVehicles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => vehicleApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      toast.success(`${result.deleted} vehicles deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete vehicles');
    },
  });
};

export const useGenerateDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleApi.generateDescription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      toast.success('Description generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate description');
    },
  });
};