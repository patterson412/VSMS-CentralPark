'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  DirectionsCar,
  Search,
  Login,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Browse Vehicles', href: '/vehicles', icon: <DirectionsCar /> },
  { label: 'Search', href: '/search', icon: <Search /> },
];

export function MainNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAdminLogin = () => {
    router.push('/admin/login');
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          VSMS
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.label}
            component={Link}
            href={item.href}
            onClick={handleDrawerToggle}
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                bgcolor: (theme) => theme.palette.primary[50],
                color: 'primary.main',
                '& .nav-icon': {
                  color: 'primary.main'
                }
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {item.icon && (
              <Box sx={{ mr: 1.5, color: 'text.secondary' }} className="nav-icon">
                {item.icon}
              </Box>
            )}
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem
          onClick={() => {
            handleAdminLogin();
            handleDrawerToggle();
          }}
          sx={{
            '&:hover': {
              bgcolor: (theme) => theme.palette.primary[50],
              color: 'primary.main',
              '& .nav-icon': {
                color: 'primary.main'
              }
            },
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Box sx={{ mr: 1.5, color: 'text.secondary' }} className="nav-icon">
            <Login />
          </Box>
          <ListItemText primary="Admin Login" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar>
            {/* Logo */}
            <Typography
              variant="h5"
              component={Link}
              href="/"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
                mr: 4,
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
            >
              Central Park Vehicles
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.label}
                      component={Link}
                      href={item.href}
                      startIcon={item.icon}
                      sx={{
                        color: 'text.primary',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.75, sm: 1 },
                        borderRadius: 2,
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'primary.50',
                          transform: 'translateY(-1px)',
                          boxShadow: 1
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<Login />}
                  onClick={handleAdminLogin}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.75, sm: 1 },
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Admin Login
                </Button>
              )}

              {/* Mobile menu button */}
              {isMobile && (
                <IconButton
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.50',
                      color: 'primary.main'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        slotProps={{
          paper: {
            sx: { width: 250 }
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}