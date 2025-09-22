'use client';

import { useState, Suspense } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Tooltip,
  Pagination,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add,
  Search,
  FilterList,
  ViewModule,
  ViewList,
  Delete as DeleteIcon,
  AutoAwesome,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useVehicles, useDeleteVehicle, useBulkDeleteVehicles, useGenerateDescription } from '@/hooks/use-vehicles';
import { VehicleCard } from '@/components/vehicle/vehicle-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { VehicleFilters, Vehicle } from '@/types';
import { vehicleTypes as vehicleTypeOptions } from '@/lib/validations';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { updateUrlParams } from '@/lib/utils';

const vehicleTypes = ['All', ...vehicleTypeOptions];
const sortOptions = [
  { value: 'createdAt_DESC', label: 'Newest First' },
  { value: 'createdAt_ASC', label: 'Oldest First' },
  { value: 'price_ASC', label: 'Price: Low to High' },
  { value: 'price_DESC', label: 'Price: High to Low' },
  { value: 'year_DESC', label: 'Year: Newest' },
  { value: 'brand_ASC', label: 'Brand: A to Z' },
];

function AdminVehiclesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [filters, setFilters] = useState<VehicleFilters>({
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 6,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const { data: vehiclesData, isLoading, error } = useVehicles({
    search: filters.search,
    type: filters.type,
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });
  const deleteVehicleMutation = useDeleteVehicle();
  const bulkDeleteMutation = useBulkDeleteVehicles();
  const generateDescriptionMutation = useGenerateDescription();


  const handleFilterChange = (key: keyof VehicleFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    }));

    // Update URL with filter changes
    updateUrlParams(
      {
        [key]: value || undefined, // Remove empty values from URL
        page: key !== 'page' ? '1' : value?.toString(), // Reset to page 1 unless changing page
      },
      router,
      searchParams,
      pathname
    );
  };


  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split('_');
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      page: 1,
    }));

    // Update URL with sort changes
    updateUrlParams(
      {
        sortBy,
        sortOrder,
        page: '1',
      },
      router,
      searchParams,
      pathname
    );
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVehicles.length === vehiclesData?.data.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(vehiclesData?.data.map(v => v.id) || []);
    }
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicleMutation.mutateAsync(vehicleToDelete.id);
        setDeleteDialogOpen(false);
        setVehicleToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVehicles.length === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(selectedVehicles);
      setSelectedVehicles([]);
      toast.success(`${selectedVehicles.length} vehicles deleted successfully`);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleGenerateDescription = async (vehicle: Vehicle) => {
    try {
      await generateDescriptionMutation.mutateAsync(vehicle.id);
    } catch (error) {
      console.error('Generate description failed:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });

    // Clear all URL parameters
    updateUrlParams(
      {
        search: undefined,
        type: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        page: undefined,
        limit: undefined,
      },
      router,
      searchParams,
      pathname
    );
  };

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          mb: { xs: 4, sm: 6 }
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: { xs: 1, sm: 2 },
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              Vehicle Management
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Manage your vehicle inventory
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            href="/admin/vehicles/new"
            size="large"
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Add Vehicle
          </Button>
        </Box>

        {/* Filters Bar */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            {/* Search */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                placeholder="Search vehicles..."
                value={filters.search || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({ ...prev, search: value }));
                  updateUrlParams(
                    {
                      search: value || undefined,
                      page: '1',
                    },
                    router,
                    searchParams,
                    pathname
                  );
                }}
                slotProps={{ input: {
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                } }}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Type Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type || 'All'}
                  label="Type"
                  onChange={(e) =>
                    handleFilterChange('type', e.target.value === 'All' ? undefined : e.target.value)
                  }
                >
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  label="Sort By"
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* View Controls */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-end' },
                gap: { xs: 1, sm: 2 }
              }}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <ViewModule />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewList />
                </IconButton>
                <Button
                  onClick={clearFilters}
                  size="small"
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Bulk Actions */}
        {selectedVehicles.length > 0 && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedVehicles.length} vehicle(s) selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  Delete Selected
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedVehicles([])}
                >
                  Clear Selection
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Results Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {vehiclesData ? (
              <>
                Showing {vehiclesData.data.length} of {vehiclesData.total} vehicles
                {vehiclesData.totalPages > 1 && (
                  <> • Page {vehiclesData.page} of {vehiclesData.totalPages}</>
                )}
              </>
            ) : (
              'Loading...'
            )}
          </Typography>

          {vehiclesData && vehiclesData.data.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={selectedVehicles.length === vehiclesData.data.length}
                indeterminate={selectedVehicles.length > 0 && selectedVehicles.length < vehiclesData.data.length}
                onChange={handleSelectAll}
              />
              <Typography variant="body2" color="text.secondary">
                Select All
              </Typography>
            </Box>
          )}
        </Box>

        {/* Vehicle Grid/List */}
        {isLoading ? (
          <LoadingSpinner message="Loading vehicles..." />
        ) : error ? (
          <EmptyState
            title="Error Loading Vehicles"
            description="There was an error loading the vehicle data. Please try again later."
            action={{
              label: 'Refresh',
              onClick: () => window.location.reload(),
            }}
          />
        ) : !vehiclesData?.data.length ? (
          <EmptyState
            title="No Vehicles Found"
            description="No vehicles match your current search criteria. Try adjusting your filters or add your first vehicle."
            action={{
              label: 'Add Vehicle',
              onClick: () => window.location.href = '/admin/vehicles/new',
            }}
          />
        ) : (
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={3}>
              {vehiclesData.data.map((vehicle) => (
                <Grid
                  key={vehicle.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: viewMode === 'grid' ? 4 : 12
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    {/* Selection Checkbox */}
                    <Checkbox
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleVehicleSelect(vehicle.id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        bgcolor: (theme) => `${theme.palette.background.paper}cc`, // 80% opacity
                        borderRadius: 1,
                        '&:hover': { bgcolor: (theme) => `${theme.palette.background.paper}e6` } // 90% opacity
                      }}
                    />

                    <VehicleCard
                      vehicle={vehicle}
                      showActions={true}
                      onEdit={(vehicle) => window.location.href = `/admin/vehicles/${vehicle.id}/edit`}
                      onDelete={handleDeleteClick}
                      onGenerateDescription={handleGenerateDescription}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Pagination */}
        {vehiclesData && vehiclesData.totalPages > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 3, sm: 4 }
          }}>
            <Pagination
              count={vehiclesData.totalPages}
              page={vehiclesData.page}
              onChange={(_e, page) => handleFilterChange('page', page)}
              color="primary"
              size="medium"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {vehicleToDelete?.brand} {vehicleToDelete?.model}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              disabled={deleteVehicleMutation.isPending}
            >
              {deleteVehicleMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default function AdminVehiclesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminVehiclesPageContent />
    </Suspense>
  );
}