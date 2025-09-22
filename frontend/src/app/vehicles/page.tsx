'use client';

import { useState, Suspense } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Button,
  Pagination,
  IconButton,
  Collapse,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Search,
  FilterList,
  ViewModule,
  ViewList,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { MainLayout } from '@/components/layout/main-layout';
import { useVehicles } from '@/hooks/use-vehicles';
import { VehicleCard } from '@/components/vehicle/vehicle-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { VehicleFilters } from '@/types';
import { vehicleTypes as vehicleTypeOptions } from '@/lib/validations';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { updateUrlParams, formatNumber } from '@/lib/utils';

const vehicleTypes = ['All', ...vehicleTypeOptions];
const sortOptions = [
  { value: 'createdAt_DESC', label: 'Newest First' },
  { value: 'createdAt_ASC', label: 'Oldest First' },
  { value: 'price_ASC', label: 'Price: Low to High' },
  { value: 'price_DESC', label: 'Price: High to Low' },
  { value: 'year_DESC', label: 'Year: Newest' },
  { value: 'year_ASC', label: 'Year: Oldest' },
  { value: 'brand_ASC', label: 'Brand: A to Z' },
  { value: 'brand_DESC', label: 'Brand: Z to A' },
];

function VehiclesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [filters, setFilters] = useState<VehicleFilters>({
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
    brand: searchParams.get('brand') || undefined,
    model: searchParams.get('model') || undefined,
    engineSize: searchParams.get('engineSize') || undefined,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 6,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
  });
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.minPrice || 0,
    filters.maxPrice || 100000
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: vehiclesData, isLoading, error } = useVehicles({
    search: filters.search,
    type: filters.type,
    brand: filters.brand,
    model: filters.model,
    engineSize: filters.engineSize,
    year: filters.year,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });


  const handleFilterChange = (key: keyof VehicleFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when changing filters
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
      sortBy: sortBy as any,
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

  const handlePriceRangeChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const applyPriceFilter = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      page: 1,
    }));

    // Update URL with price filter
    updateUrlParams(
      {
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        page: '1',
      },
      router,
      searchParams,
      pathname
    );
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    setPriceRange([0, 100000]);

    // Clear all URL parameters
    updateUrlParams(
      {
        search: undefined,
        type: undefined,
        brand: undefined,
        model: undefined,
        engineSize: undefined,
        year: undefined,
        minPrice: undefined,
        maxPrice: undefined,
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <EmptyState
          title="Error Loading Vehicles"
          description="There was an error loading the vehicle data. Please try again later."
          action={{
            label: 'Refresh Page',
            onClick: () => window.location.reload(),
          }}
        />
      </Container>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
          }}
        >
          Vehicle Inventory
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
        >
          Browse our comprehensive collection of vehicles
        </Typography>
      </Box>

      {/* Filters Bar */}
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4, md: 6 } }}>
        {/* Main Filter Row */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3, md: 4 },
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: { xs: 2, sm: 3, md: 4 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          {/* Search */}
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
            slotProps={{
              input: {
                startAdornment: <Search sx={{
                  color: 'text.secondary',
                  mr: 1,
                  fontSize: { xs: 18, sm: 20, md: 24 }
                }} />,
              },
            }}
            size="small"
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 200, md: 250 },
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />

          {/* Controls */}
          <Box sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            alignItems: 'center',
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            {/* Vehicle Type */}
            <FormControl size="small" sx={{
              minWidth: { xs: 100, sm: 120 },
              flex: { xs: 1, sm: 'none' }
            }}>
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

            {/* Sort */}
            <FormControl size="small" sx={{
              minWidth: { xs: 140, sm: 180 },
              flex: { xs: 1, sm: 'none' }
            }}>
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

            {/* View Mode and Filter Toggle */}
            <Box sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 1 },
              alignItems: 'center',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'center', sm: 'flex-start' },
              mt: { xs: 1, sm: 0 }
            }}>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                size="small"
                sx={{
                  p: { xs: 0.5, sm: 1 },
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                <ViewModule />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                size="small"
                sx={{
                  p: { xs: 0.5, sm: 1 },
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                <ViewList />
              </IconButton>
              <Button
                startIcon={<FilterList sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                endIcon={showFilters ? <ExpandLess sx={{ fontSize: { xs: 16, sm: 20 } }} /> : <ExpandMore sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={() => setShowFilters(!showFilters)}
                variant="outlined"
                size="small"
                sx={{
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 'auto', sm: 'auto' }
                }}
              >
                Filters
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{
            borderTop: 1,
            borderColor: 'divider',
            pt: { xs: 2, sm: 3 },
            mt: { xs: 2, sm: 3 }
          }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="flex-start">
              {/* Brand */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Brand"
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Model */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Model"
                  value={filters.model || ''}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Engine Size */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Engine Size"
                  value={filters.engineSize || ''}
                  onChange={(e) => handleFilterChange('engineSize', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Year */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  label="Year"
                  type="number"
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value) || undefined)}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Price Range */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Price Range: ${formatNumber(priceRange[0])} - ${formatNumber(priceRange[1])}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={200000}
                    step={1000}
                    sx={{
                      flex: 1,
                      mx: { xs: 0, sm: 1 },
                      minWidth: { xs: 150, sm: 200 }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={applyPriceFilter}
                    variant="outlined"
                    sx={{
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </Grid>

              {/* Clear Filters */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ pt: { xs: 1.5, sm: 2 } }}>
                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Results */}
      <Box sx={{ mb: { xs: 3, sm: 4, md: 6 } }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {vehiclesData ? (
            `Showing ${vehiclesData.data.length} of ${vehiclesData.total} vehicles`
          ) : (
            'Loading...'
          )}
        </Typography>
      </Box>

      {/* Vehicle Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading vehicles..." />
      ) : !vehiclesData?.data.length ? (
        <EmptyState
          title="No Vehicles Found"
          description="No vehicles match your current search criteria. Try adjusting your filters."
          action={{
            label: 'Clear Filters',
            onClick: clearFilters,
          }}
        />
      ) : (
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {vehiclesData.data.map((vehicle) => (
              <Grid
                key={vehicle.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: viewMode === 'grid' ? 4 : 12
                }}
              >
                <VehicleCard vehicle={vehicle} />
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
      </Container>
    </MainLayout>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VehiclesPageContent />
    </Suspense>
  );
}