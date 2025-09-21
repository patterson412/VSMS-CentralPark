'use client';

import { useRouter } from 'next/navigation';

import { Box, Typography, Paper } from '@mui/material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { VehicleForm } from '@/components/forms/vehicle-form';
import { Vehicle } from '@/types';
import { toast } from 'react-hot-toast';

export default function NewVehiclePage() {
  const router = useRouter();

  const handleSuccess = (vehicle: Vehicle) => {
    toast.success('Vehicle created successfully!');
    router.push('/admin/vehicles');
  };

  const handleCancel = () => {
    router.push('/admin/vehicles');
  };

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
            Add New Vehicle
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Create a new vehicle listing in your inventory
          </Typography>
        </Box>

          <VehicleForm
            vehicle={null}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
      </Box>
    </AdminLayout>
  );
}