'use client';

import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DirectionsCar, Search, AdminPanelSettings } from '@mui/icons-material';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';

export default function HomePage() {
  return (
    <MainLayout>
      <Box sx={{ background: (theme) => `linear-gradient(to bottom right, ${theme.palette.primary[50]}, ${theme.palette.primary[200]})` }}>
        {/* Hero Section */}
        <Box sx={{ background: (theme) => `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, sm: 12, md: 20 } }}>
            <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 0 } }}>
              <Typography variant="h1" sx={{
                mb: { xs: 4, sm: 6 },
                fontWeight: 700,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
              }}>
                Your Vehicle Dream Starts Now!
              </Typography>
              <Typography variant="h5" sx={{
                mb: { xs: 6, sm: 8 },
                color: 'primary.light',
                maxWidth: '32rem',
                mx: 'auto',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                px: { xs: 2, sm: 0 }
              }}>
                Discover your perfect vehicle with AI-powered descriptions and comprehensive sorting
              </Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 2, sm: 4 },
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center'
              }}>
                <Button
                  component={Link}
                  href="/vehicles"
                  variant="contained"
                  size="large"
                  startIcon={<DirectionsCar />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    minWidth: { xs: '200px', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'grey.50',
                      boxShadow: 3
                    }
                  }}
                >
                  Browse Vehicles
                </Button>
                <Button
                  component={Link}
                  href="/search"
                  variant="outlined"
                  size="large"
                  startIcon={<Search />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    minWidth: { xs: '200px', sm: 'auto' },
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: (theme) => `${theme.palette.common.white}1a` // 10% opacity
                    }
                  }}
                >
                  Advanced Search
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, sm: 12, md: 16 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 8, sm: 12 }, px: { xs: 2, sm: 0 } }}>
            <Typography variant="h3" sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
            }}>
              Why Choose Our Platform?
            </Typography>
            <Typography variant="h6" sx={{
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}>
              Experience the ease of finding your desired Wheels!
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center', p: { xs: 4, sm: 5, md: 6 }, border: 'none', boxShadow: 1 }}>
                <CardContent sx={{ p: 0 }}>
                  <DirectionsCar sx={{ fontSize: { xs: 40, sm: 48 }, color: 'primary.main', mb: { xs: 3, sm: 4 } }} />
                  <Typography variant="h5" sx={{
                    fontWeight: 600,
                    mb: { xs: 3, sm: 4 },
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    Comprehensive Inventory
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.6
                  }}>
                    Browse through our extensive collection of vehicles with detailed specifications and high-quality images.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center', p: { xs: 4, sm: 5, md: 6 }, border: 'none', boxShadow: 1 }}>
                <CardContent sx={{ p: 0 }}>
                  <Search sx={{ fontSize: { xs: 40, sm: 48 }, color: 'primary.main', mb: { xs: 3, sm: 4 } }} />
                  <Typography variant="h5" sx={{
                    fontWeight: 600,
                    mb: { xs: 3, sm: 4 },
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    Smart Search
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.6
                  }}>
                    Find your perfect vehicle with our advanced filtering system by brand, type, price, and more.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center', p: { xs: 4, sm: 5, md: 6 }, border: 'none', boxShadow: 1 }}>
                <CardContent sx={{ p: 0 }}>
                  <AdminPanelSettings sx={{ fontSize: { xs: 40, sm: 48 }, color: 'primary.main', mb: { xs: 3, sm: 4 } }} />
                  <Typography variant="h5" sx={{
                    fontWeight: 600,
                    mb: { xs: 3, sm: 4 },
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    AI-Powered Descriptions
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.6
                  }}>
                    Every vehicle comes with professionally crafted, AI-generated descriptions that highlight key features.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* CTA Section */}
        <Box sx={{ bgcolor: 'white', py: { xs: 8, sm: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 0 } }}>
              <Typography variant="h4" sx={{
                fontWeight: 600,
                mb: { xs: 3, sm: 4 },
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}>
                Ready to Find Your Next Vehicle?
              </Typography>
              <Typography variant="body1" sx={{
                color: 'text.secondary',
                mb: { xs: 6, sm: 8 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}>
                Start exploring our inventory today and discover the perfect vehicle for your needs.
              </Typography>
              <Button
                component={Link}
                href="/vehicles"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'primary.main',
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 3
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </MainLayout>
  );
}