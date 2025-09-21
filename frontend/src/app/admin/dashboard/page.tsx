'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  DirectionsCar,
  Add,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useVehicles, useVehicleStats } from '@/hooks/use-vehicles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useVehicleStats();
  const { data: recentVehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const isLoading = statsLoading || vehiclesLoading;

  const statCards = [
    {
      title: 'Total Vehicles',
      value: statsData?.totalVehicles || 0,
      icon: <DirectionsCar />,
      color: 'primary',
      trend: `${statsData?.vehicleTypes?.length || 0} categories`,
    },
    {
      title: 'Total Value',
      value: formatCurrency(statsData?.totalValue || 0),
      icon: <AttachMoney />,
      color: 'success',
      trend: `Avg: ${formatCurrency(statsData?.averagePrice || 0)}`,
    },
    {
      title: 'Recently Added',
      value: statsData?.recentlyAdded || 0,
      icon: <TrendingUp />,
      color: 'info',
      trend: 'Last 30 days',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'car':
        return 'primary';
      case 'suv':
        return 'secondary';
      case 'truck':
        return 'error';
      case 'bike':
        return 'warning';
      case 'van':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Welcome back! Here's what's happening with your vehicle inventory.
          </Typography>
        </Box>

        {isLoading ? (
          <LoadingSpinner message="Loading dashboard..." />
        ) : statsError || vehiclesError ? (
          <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h6"
              color="error"
              sx={{
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Error loading dashboard data
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {statsError?.message || vehiclesError?.message || 'Please check your backend connection'}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                display: 'block',
                mt: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Make sure your backend is running on port 3001
            </Typography>
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
              {statCards.map((stat) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.title}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: { xs: 1.5, sm: 2 }
                      }}>
                        <Box sx={{
                          p: { xs: 0.75, sm: 1 },
                          borderRadius: 2,
                          bgcolor: `${stat.color}.50`,
                          color: `${stat.color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          '& > svg': {
                            fontSize: { xs: 20, sm: 24 }
                          }
                        }}>
                          {stat.icon}
                        </Box>
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {stat.trend}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Actions */}
            <Card sx={{ mb: { xs: 3, sm: 4 } }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Quick Actions
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: 'wrap',
                  gap: { xs: 1.5, sm: 1 }
                }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    href="/admin/vehicles/new"
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Add New Vehicle
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/admin/vehicles"
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Manage Vehicles
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/vehicles"
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    View Public Site
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Vehicle Types Distribution */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      Vehicle Types
                    </Typography>
                    {statsData?.vehicleTypes && statsData.vehicleTypes.length > 0 ? (
                      statsData.vehicleTypes.map((type) => (
                        <Box
                          key={type.type}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: { xs: 1.5, sm: 2 }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={type.type}
                              size="small"
                              color={getTypeColor(type.type) as any}
                              sx={{
                                mr: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {type.count} vehicles
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          No vehicle data available
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statsData?.totalVehicles === 0 ? 'Add some vehicles to see statistics' : 'An error occurred'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Vehicles */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: { xs: 1.5, sm: 2 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                      >
                        Recent Vehicles
                      </Typography>
                      <Button
                        size="small"
                        component={Link}
                        href="/admin/vehicles"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        View All
                      </Button>
                    </Box>

                    {recentVehicles?.data.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Vehicle</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Price</TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Added</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentVehicles.data.map((vehicle) => (
                              <TableRow key={vehicle.id}>
                                <TableCell>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 500,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                      }}
                                    >
                                      {vehicle.brand} {vehicle.model}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                                    >
                                      {vehicle.year} • {vehicle.type}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                  >
                                    {formatCurrency(vehicle.price)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                                  >
                                    {format(new Date(vehicle.createdAt), 'MMM dd')}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textAlign: 'center',
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        No vehicles added yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}