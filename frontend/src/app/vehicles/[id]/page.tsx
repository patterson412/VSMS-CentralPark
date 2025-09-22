'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MainLayout } from '@/components/layout/main-layout';
import {
  ArrowBack,
  Share,
  DirectionsCar,
  DateRange,
  Palette,
  Speed,
  ContactPhone,
} from '@mui/icons-material';
import { useVehicle } from '@/hooks/use-vehicles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';
import { formatCurrency, getVehicleTypeColor } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };


  if (isLoading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <LoadingSpinner message="Loading vehicle details..." />
        </Container>
      </MainLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <EmptyState
            title="Vehicle Not Found"
            description="The vehicle you're looking for doesn't exist or has been removed."
            action={{
              label: 'Back to Vehicles',
              onClick: () => router.push('/vehicles'),
            }}
          />
        </Container>
      </MainLayout>
    );
  }

  const images = vehicle.images?.length ? vehicle.images : [];
  const currentImage = images[currentImageIndex];

  const specifications = [
    { label: 'Type', value: vehicle.type, icon: <DirectionsCar /> },
    { label: 'Year', value: vehicle.year.toString(), icon: <DateRange /> },
    { label: 'Color', value: vehicle.color, icon: <Palette /> },
    { label: 'Engine Size', value: vehicle.engineSize, icon: <Speed /> },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, sm: 6 }, px: { xs: 2, sm: 0 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          Back
        </Button>

        <Box sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 3, sm: 0 }
        }}>
          <Box>
            <Typography variant="h3" sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
            }}>
              {vehicle.brand} {vehicle.model}
            </Typography>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Chip
                label={vehicle.type}
                color={getVehicleTypeColor(vehicle.type)}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
              <Typography variant="body2" sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Added {format(new Date(vehicle.createdAt), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleShare}
              sx={{ p: { xs: 1, sm: 1.5 } }}
              aria-label="Share vehicle"
            >
              <Share sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Image Gallery */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Box sx={{ position: 'relative' }}>
              {/* Main Image */}
              <Box sx={{
                position: 'relative',
                height: { xs: 250, sm: 300, md: 384 },
                bgcolor: 'grey.100',
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                overflow: 'hidden'
              }}>
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                    <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 0 } }}>
                      <DirectionsCar sx={{
                        color: 'text.disabled',
                        fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                        mb: { xs: 2, sm: 4 }
                      }} />
                      <Typography variant="h6" sx={{
                        color: 'text.secondary',
                        mb: 2,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}>
                        No Images Available
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'text.disabled',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}>
                        Images can be uploaded through the admin panel
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: 'white' }}>
                  <Grid container spacing={{ xs: 0.5, sm: 1 }}>
                    {images.map((image, index) => (
                      <Grid key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: { xs: 48, sm: 56, md: 64 },
                              height: { xs: 48, sm: 56, md: 64 },
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: 2,
                              borderColor: currentImageIndex === index ? 'primary.main' : 'grey.300',
                              '&:hover': {
                                borderColor: currentImageIndex === index ? 'primary.main' : 'grey.400',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                            onClick={() => handleImageClick(index)}
                          >
                            <Image
                              src={image}
                              alt={`${vehicle.brand} ${vehicle.model} - ${index + 1}`}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="64px"
                            />
                          </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Card>

          {/* Description */}
          <Card sx={{ mt: { xs: 3, sm: 4 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" sx={{
                fontWeight: 600,
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{
                color: 'text.primary',
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                {vehicle.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle Details Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Price & Contact */}
          <Card sx={{ mb: { xs: 3, sm: 4 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}>
                {formatCurrency(vehicle.price)}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ContactPhone />}
                sx={{
                  mb: 2,
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
                onClick={() => {
                  // Placeholder for contact functionality
                  alert('Contact functionality coming soon!');
                }}
              >
                Contact Dealer
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
                onClick={() => {
                  // Placeholder for inquiry functionality
                  alert('Inquiry form coming soon!');
                }}
              >
                Request Info
              </Button>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Specifications
              </Typography>

              <Box sx={{ '& > *': { mb: { xs: 2, sm: 3 } } }}>
                {specifications.map((spec, index) => (
                  <Box key={spec.label}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: { xs: 1.5, sm: 2 },
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                          color: 'text.disabled',
                          mr: { xs: 2, sm: 3 },
                          '& > svg': { fontSize: { xs: 18, sm: 24 } }
                        }}>
                          {spec.icon}
                        </Box>
                        <Typography variant="body2" sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}>
                          {spec.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}>
                        {spec.value}
                      </Typography>
                    </Box>
                    {index < specifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Additional Details */}
              <Box sx={{ '& > *': { mb: 2 } }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 0.5, sm: 0 }
                }}>
                  <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    Brand
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    {vehicle.brand}
                  </Typography>
                </Box>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 0.5, sm: 0 }
                }}>
                  <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    Model
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    {vehicle.model}
                  </Typography>
                </Box>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 0.5, sm: 0 }
                }}>
                  <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    Images
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    {images.length} photos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      </Container>
    </MainLayout>
  );
}