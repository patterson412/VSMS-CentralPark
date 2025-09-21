'use client';

import { useParams, useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { VehicleForm } from '@/components/forms/vehicle-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useVehicle } from '@/hooks/use-vehicles';
import { Vehicle } from '@/types';
import { toast } from 'react-hot-toast';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);

  const handleSuccess = (updatedVehicle: Vehicle) => {
    toast.success('Vehicle updated successfully!');
    router.push('/admin/vehicles');
  };

  const handleCancel = () => {
    router.push('/admin/vehicles');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Loading vehicle details..." />
      </AdminLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <AdminLayout>
        <EmptyState
          title="Vehicle Not Found"
          description="The vehicle you're trying to edit doesn't exist or has been removed."
          action={{
            label: 'Back to Vehicles',
            onClick: () => router.push('/admin/vehicles'),
          }}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 0 } }}>
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Edit Vehicle
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Update details for {vehicle.brand} {vehicle.model}
            </Typography>
          </Box>

          <VehicleForm
            vehicle={vehicle}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Box>
    </AdminLayout>
  );
}