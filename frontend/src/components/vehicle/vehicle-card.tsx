'use client';

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  AutoAwesome,
  DirectionsCar,
} from '@mui/icons-material';
import { useState } from 'react';
import { Vehicle } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, getVehicleTypeColor } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  showActions?: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onGenerateDescription?: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  showActions = false,
  onEdit,
  onDelete,
  onGenerateDescription,
}: VehicleCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: () => void) => {
    handleMenuClose();
    action();
  };


  const primaryImage = vehicle.images?.[0];

  return (
    <Link href={`/vehicles/${vehicle.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
      >
      {/* Vehicle Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{
            height: { xs: 160, sm: 180, md: 192 },
            bgcolor: 'grey.100',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <DirectionsCar sx={{
                  color: 'grey.400',
                  fontSize: { xs: 32, sm: 40, md: 48 },
                  mb: 1
                }} />
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}>
                  No Image Available
                </Typography>
              </Box>
            </Box>
          )}
        </CardMedia>

        {/* Actions Menu */}
        {showActions && (
          <Box sx={{ position: 'absolute', top: { xs: 4, sm: 8 }, right: { xs: 4, sm: 8 } }}>
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(6px)',
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 4px 12px',
                }
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem onClick={() => handleMenuAction(() => window.open(`/vehicles/${vehicle.id}`, '_blank'))}>
                <Visibility sx={{ mr: 1 }} fontSize="small" />
                View Details
              </MenuItem>
              {onEdit && (
                <MenuItem onClick={() => handleMenuAction(() => onEdit(vehicle))}>
                  <Edit sx={{ mr: 1 }} fontSize="small" />
                  Edit
                </MenuItem>
              )}
              {onGenerateDescription && (
                <MenuItem onClick={() => handleMenuAction(() => onGenerateDescription(vehicle))}>
                  <AutoAwesome sx={{ mr: 1 }} fontSize="small" />
                  Generate Description
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem
                  onClick={() => handleMenuAction(() => onDelete(vehicle))}
                  sx={{ color: 'error.main' }}
                >
                  <Delete sx={{ mr: 1 }} fontSize="small" />
                  Delete
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}

        {/* Vehicle Type Chip */}
        <Box sx={{ position: 'absolute', top: { xs: 4, sm: 8 }, left: { xs: 4, sm: 8 } }}>
          <Chip
            label={vehicle.type}
            size="small"
            color={getVehicleTypeColor(vehicle.type)}
            sx={{
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
              height: { xs: 20, sm: 24 }
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        {/* Vehicle Title */}
        <Typography variant="h6" sx={{
          fontWeight: 600,
          mb: 0.5,
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }} noWrap>
          {vehicle.brand} {vehicle.model}
        </Typography>

        {/* Vehicle Details */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          color: 'text.secondary',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 0.5, sm: 0 }
        }}>
          <Typography component="span" variant="body2" sx={{ fontSize: 'inherit' }}>{vehicle.year}</Typography>
          <Typography component="span" variant="body2" sx={{ fontSize: 'inherit' }}>{vehicle.engineSize}</Typography>
          <Typography component="span" variant="body2" sx={{ textTransform: 'capitalize', fontSize: 'inherit' }}>{vehicle.color}</Typography>
        </Box>

        {/* Price */}
        <Typography variant="h6" sx={{
          fontWeight: 700,
          color: 'primary.main',
          mb: 1,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          {formatCurrency(vehicle.price)}
        </Typography>

        {/* Description Preview */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: { xs: 1.5, sm: 2 },
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: { xs: 2, sm: 3 },
            overflow: 'hidden',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            lineHeight: 1.4
          }}
        >
          {vehicle.description}
        </Typography>

        {/* Additional Info */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 0.5, sm: 0 }
        }}>
          <Typography variant="caption" color="text.disabled" sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}>
            Added {format(new Date(vehicle.createdAt), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}>
            {vehicle.images?.length || 0} photos
          </Typography>
        </Box>
      </CardContent>
    </Card>
    </Link>
  );
}