'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  TrendingUp,
  DirectionsCar,
  AttachMoney,
  Assessment,
  DateRange,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useVehicleStats } from '@/hooks/use-vehicles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

function StatCard({ title, value, icon, description, trend, color = 'primary' }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: { xs: 1.5, sm: 2 }
        }}>
          <Box>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 0.5,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box sx={{
            p: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            bgcolor: `${color}.50`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            '& > svg': {
              fontSize: { xs: 20, sm: 24 }
            }
          }}>
            {icon}
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {description}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={trend.value}
              size="small"
              color={trend.isPositive ? 'success' : 'error'}
              variant="outlined"
              sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                ml: 1,
                fontSize: { xs: '0.6rem', sm: '0.75rem' }
              }}
            >
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading, error } = useVehicleStats();

  // Debug logging
  console.log('Analytics Debug:', { stats, isLoading, error });

  if (isLoading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
          <LoadingSpinner message="Loading analytics..." />
        </Container>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}
            color="text.secondary"
          >
            Unable to load analytics data
          </Typography>
        </Container>
      </AdminLayout>
    );
  }

  const totalValue = stats.totalValue || 0;
  const averagePrice = stats.averagePrice || 0;

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
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
            Analytics Dashboard
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
          >
            Track your vehicle inventory performance and insights
          </Typography>
        </Box>

        {/* Key Stats Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Total Vehicles"
              value={stats.totalVehicles}
              icon={<DirectionsCar />}
              description="Vehicles in inventory"
              color="primary"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Total Inventory Value"
              value={formatCurrency(totalValue)}
              icon={<AttachMoney />}
              description="Combined value of all vehicles"
              color="success"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Average Price"
              value={formatCurrency(averagePrice)}
              icon={<TrendingUp />}
              description="Average vehicle price"
              color="warning"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Recently Added"
              value={stats.recentlyAdded || 0}
              icon={<DateRange />}
              description="Vehicles added in last 30 days"
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Vehicle Type Breakdown */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <Assessment sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                  Vehicle Types Breakdown
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  {stats.vehicleTypes?.map((type) => (
                    <Box
                      key={type.type}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          alignSelf: { xs: 'flex-start', sm: 'center' }
                        }}
                      >
                        {type.type}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: { xs: 80, sm: 96 },
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          height: { xs: 6, sm: 8 }
                        }}>
                          <Box
                            sx={{
                              bgcolor: 'primary.main',
                              height: { xs: 6, sm: 8 },
                              borderRadius: 1,
                              width: `${(type.count / stats.totalVehicles) * 100}%`,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            minWidth: { xs: 24, sm: 32 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {type.count}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <DateRange sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                  Recent Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
                  {stats.recentlyAdded > 0 ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: { xs: 0.75, sm: 1 },
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 0.5, sm: 0 }
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          alignSelf: { xs: 'flex-start', sm: 'center' }
                        }}
                      >
                        {stats.recentlyAdded} vehicles added
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.6rem', sm: '0.75rem' },
                          alignSelf: { xs: 'flex-end', sm: 'center' }
                        }}
                      >
                        Last 30 days
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: { xs: 1.5, sm: 2 }
                    }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        No recent activity
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: { xs: 0.75, sm: 1 },
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 0.5, sm: 0 }
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        alignSelf: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      Total inventory: {stats.totalVehicles} vehicles
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        alignSelf: { xs: 'flex-end', sm: 'center' }
                      }}
                    >
                      Current
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: { xs: 0.75, sm: 1 },
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 0.5, sm: 0 }
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        alignSelf: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      Vehicle types: {stats.vehicleTypes?.length || 0} categories
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        alignSelf: { xs: 'flex-end', sm: 'center' }
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance Insights */}
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Performance Insights
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'info.50',
                borderRadius: 2
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'info.main',
                    mb: 1,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                  }}
                >
                  {formatCurrency(totalValue)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total Inventory Value
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'success.50',
                borderRadius: 2
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'success.main',
                    mb: 1,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                  }}
                >
                  {stats.vehicleTypes?.length || 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Vehicle Categories
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'success.50',
                borderRadius: 2
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'success.main',
                    mb: 1,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                  }}
                >
                  {stats.recentlyAdded || 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Recent Additions
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </AdminLayout>
  );
}