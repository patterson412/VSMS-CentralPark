'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  DirectionsCar,
  Add,
  Analytics,
  ExitToApp,
  AccountCircle,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProtectedRoute } from '@/components/auth/protected-route';

const drawerWidth = 240;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    href: '/admin/dashboard',
  },
  {
    text: 'All Vehicles',
    icon: <DirectionsCar />,
    href: '/admin/vehicles',
  },
  {
    text: 'Add Vehicle',
    icon: <Add />,
    href: '/admin/vehicles/new',
  },
  {
    text: 'Analytics',
    icon: <Analytics />,
    href: '/admin/analytics',
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleProfileMenuClose();
    await signOut({ callbackUrl: '/' });
  };


  const drawer = (
    <div>
      {/* Logo/Brand */}
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          VSMS Admin
        </Typography>
      </Toolbar>

      {/* Navigation */}
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  color: 'primary.dark',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ '& > svg': { fontSize: { xs: 20, sm: 24 } } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: { xs: 'none', md: 'block' }
            }}
          >
            Vehicle Sales Management
          </Typography>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: '1rem',
              display: { xs: 'block', md: 'none' }
            }}
          >
            VSMS
          </Typography>

          {/* User Menu */}
          <Button
            color="inherit"
            onClick={handleProfileMenuOpen}
            startIcon={<AccountCircle />}
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {session?.user?.username || 'Admin'}
            </Box>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem
              onClick={() => router.push('/')}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              <Dashboard sx={{ mr: { xs: 1, sm: 2 }, fontSize: { xs: 18, sm: 20 } }} />
              View Site
            </MenuItem>
            <MenuItem
              onClick={handleSignOut}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              <ExitToApp sx={{ mr: { xs: 1, sm: 2 }, fontSize: { xs: 18, sm: 20 } }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'grey.50',
        }}
      >
        <Toolbar />
        {children}
      </Box>
      </Box>
    </ProtectedRoute>
  );
}