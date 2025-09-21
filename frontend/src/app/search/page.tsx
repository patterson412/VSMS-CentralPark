'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Search as SearchIcon,
  Clear,
  History,
} from '@mui/icons-material';
import { MainLayout } from '@/components/layout/main-layout';
import { useVehicles } from '@/hooks/use-vehicles';
import { VehicleCard } from '@/components/vehicle/vehicle-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { VehicleFilters } from '@/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { vehicleTypes, commonBrands, commonColors } from '@/lib/validations';
import { updateUrlParams } from '@/lib/utils';

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    }
    return [];
  });
  const [filters, setFilters] = useState<VehicleFilters>({
    search: initialQuery,
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const { data: vehiclesData, isLoading } = useVehicles({
    search: searchQuery,
    type: filters.type,
    brand: filters.brand,
    color: filters.color,
    year: filters.year,
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });


  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      setFilters(prev => ({
        ...prev,
        search: query,
        page: 1,
      }));

      // Save to recent searches
      const updatedRecent = [
        query,
        ...recentSearches.filter((item: string) => item !== query)
      ].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      setRecentSearches(updatedRecent);

      // Update URL with real-time sync
      updateUrlParams(
        {
          q: query,
          page: '1', // Reset to first page on new search
        },
        router,
        searchParams,
        pathname
      );
    }
  };

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

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const clearAllRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });

    // Clear all URL parameters
    updateUrlParams(
      {
        q: undefined,
        type: undefined,
        brand: undefined,
        color: undefined,
        year: undefined,
        page: undefined,
      },
      router,
      searchParams,
      pathname
    );
  };

  const hasSearched = Boolean(searchQuery || filters.type || filters.brand || filters.color || filters.year);
  const hasResults = vehiclesData?.data?.length || 0;

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 6, sm: 8 }, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
          <Typography variant="h3" sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
          }}>
            Search Vehicles
          </Typography>
          <Typography variant="h6" sx={{
            color: 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
          }}>
            Find your perfect vehicle from our inventory
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper sx={{ p: { xs: 3, sm: 4, md: 6 }, mb: { xs: 4, sm: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 4 } }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setFilters(prev => ({
                  ...prev,
                  search: value,
                  page: 1,
                }));
                updateUrlParams(
                  {
                    q: value || undefined,
                    page: '1',
                  },
                  router,
                  searchParams,
                  pathname
                );
              }}
              placeholder="Search by brand, model, or description..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              slotProps={{
                input: {
                startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: { xs: 1, sm: 2 } }} />,
                endAdornment: searchQuery && (
                  <Button
                    size="small"
                    onClick={clearSearch}
                    startIcon={<Clear />}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Clear
                  </Button>
                ),
                }
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Advanced Filters */}
          {hasSearched && (
            <Box
              sx={{
                opacity: hasSearched ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: { xs: 3, sm: 4 }, mt: { xs: 3, sm: 4 } }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Vehicle Type</InputLabel>
                      <Select
                        value={filters.type || ''}
                        label="Vehicle Type"
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {vehicleTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Autocomplete
                      value={filters.brand || ''}
                      onChange={(_, newValue) => handleFilterChange('brand', newValue)}
                      options={commonBrands}
                      size="small"
                      renderInput={(params) => (
                        <TextField {...params} label="Brand" />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Color</InputLabel>
                      <Select
                        value={filters.color || ''}
                        label="Color"
                        onChange={(e) => handleFilterChange('color', e.target.value)}
                      >
                        <MenuItem value="">All Colors</MenuItem>
                        {commonColors.map((color) => (
                          <MenuItem key={color} value={color}>
                            {color}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Year"
                      type="number"
                      size="small"
                      value={filters.year || ''}
                      onChange={(e) => handleFilterChange('year', parseInt(e.target.value) || undefined)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Recent Searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <Box sx={{ mb: { xs: 6, sm: 8 } }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
              mb: 3
            }}>
              <Typography variant="h6" sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                <History sx={{ mr: 2, fontSize: { xs: 20, sm: 24 } }} />
                Recent Searches
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={clearAllRecentSearches}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Clear All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
              {recentSearches.map((search: string) => (
                <Chip
                  key={search}
                  label={search}
                  onClick={() => handleRecentSearch(search)}
                  clickable
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Search Results */}
        {hasSearched && (
          <>
            {/* Results Header */}
            <Box sx={{ mb: { xs: 4, sm: 6 }, px: { xs: 2, sm: 0 } }}>
              <Typography variant="h6" sx={{
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                {isLoading ? (
                  'Searching...'
                ) : (
                  `${hasResults} result${hasResults !== 1 ? 's' : ''} for "${searchQuery}"`
                )}
              </Typography>
            </Box>

            {/* Results Grid */}
            {isLoading ? (
              <LoadingSpinner message="Searching vehicles..." />
            ) : hasResults > 0 ? (
              <Box
                sx={{
                  mb: { xs: 6, sm: 8 },
                  opacity: hasResults > 0 ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              >
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {vehiclesData?.data.map((vehicle) => (
                    <Grid
                      key={vehicle.id}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    >
                      <VehicleCard vehicle={vehicle} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <EmptyState
                title="No vehicles found"
                description={`No vehicles match your search for "${searchQuery}". Try different keywords or browse all vehicles.`}
                action={{
                  label: 'Browse All Vehicles',
                  onClick: () => router.push('/vehicles'),
                }}
              />
            )}
          </>
        )}

        {/* Browse All Vehicles CTA */}
        {!hasSearched && (
          <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 0 } }}>
            <Typography variant="body1" sx={{
              color: 'text.secondary',
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}>
              Or browse our complete vehicle inventory
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/vehicles')}
              sx={{
                px: { xs: 4, sm: 6 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Browse All Vehicles
            </Button>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}