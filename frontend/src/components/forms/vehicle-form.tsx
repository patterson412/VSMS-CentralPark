'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Autocomplete,
  InputAdornment,
  Divider,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Save,
  AutoAwesome,
  Cancel,
  AttachMoney,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUpload } from './image-upload';
import { vehicleFormSchema, VehicleFormData, vehicleTypes, commonBrands, commonColors } from '@/lib/validations';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto } from '@/types';
import { useCreateVehicle, useUpdateVehicle, useGenerateDescription } from '@/hooks/use-vehicles';
import { awsApi, vehicleApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess?: (vehicle: Vehicle) => void;
  onCancel?: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1900 + 2 }, (_, i) => currentYear + 1 - i);

export function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(vehicle?.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const isEditing = Boolean(vehicle);

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const generateDescriptionMutation = useGenerateDescription();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      type: vehicle?.type || '',
      brand: vehicle?.brand || '',
      model: vehicle?.model || '',
      color: vehicle?.color || '',
      engineSize: vehicle?.engineSize || '',
      year: vehicle?.year || currentYear,
      price: Number(vehicle?.price) || 0,
      description: vehicle?.description || '',
    },
  });

  const watchedFields = watch(['type', 'brand', 'model', 'color', 'engineSize', 'year', 'price']);

  useEffect(() => {
    if (vehicle) {
      reset({
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        engineSize: vehicle.engineSize,
        year: vehicle.year,
        price: Number(vehicle.price),
        description: vehicle.description,
      });
      setExistingImages(vehicle.images || []);
      setImagesToDelete([]);
    }
  }, [vehicle, reset]);

  const handleExistingImagesChange = (newImages: string[]) => {
    const currentImages = existingImages;
    const deletedImages = currentImages.filter(img => !newImages.includes(img));

    setExistingImages(newImages);
    setImagesToDelete(prev => [...prev, ...deletedImages]);
  };

  const handleGenerateDescription = async () => {
    const [type, brand, model, color, engineSize, year, price] = watchedFields;

    if (!type || !brand || !model || !color || !engineSize || !year || !price) {
      toast.error('Please fill in all vehicle details before generating description');
      return;
    }

    if (isEditing && vehicle) {
      // For existing vehicles, use the backend API
      try {
        setGeneratingDescription(true);
        await generateDescriptionMutation.mutateAsync(vehicle.id);
        toast.success('Description generated successfully');
      } catch (error) {
        console.error('Generate description error:', error);
      } finally {
        setGeneratingDescription(false);
      }
    } else {
      // For new vehicles, use the AI API with current form data
      setGeneratingDescription(true);
      try {
        const vehicleData = {
          type,
          brand,
          model,
          color,
          engineSize,
          year,
          price,
          description: '', // Will be replaced by AI
          images: [],
        };

        const result = await vehicleApi.generateDescriptionPreview(vehicleData);
        setValue('description', result.description);
        toast.success('AI description generated successfully');
      } catch (error) {
        console.error('Generate description error:', error);
        toast.error('Failed to generate AI description');
      } finally {
        setGeneratingDescription(false);
      }
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      let finalImageUrls: string[] = [...existingImages];

      // Delete removed images first (only for editing)
      if (isEditing && imagesToDelete.length > 0) {
        setUploadingImages(true);
        try {
          // Extract S3 keys from CloudFront URLs and delete them
          const deletePromises = imagesToDelete.map(async (imageUrl) => {
            try {
              // Extract S3 key from CloudFront URL
              const url = new URL(imageUrl);
              const key = url.pathname.substring(1); // Remove leading slash
              await awsApi.deleteImage(key);
            } catch (deleteError) {
              console.error('Failed to delete image:', imageUrl, deleteError);
              // Don't throw - allow other deletions to continue
            }
          });

          await Promise.allSettled(deletePromises);
          toast.success(`Deleted ${imagesToDelete.length} image(s)`);
        } catch (error) {
          console.error('Error during image deletion:', error);
          toast.error('Some images could not be deleted');
        } finally {
          setUploadingImages(false);
        }
      }

      // Upload new images if any are selected
      if (selectedImages.length > 0) {
        setUploadingImages(true);

        if (isEditing && vehicle) {
          // For editing, upload new images to existing vehicle
          try {
            const uploadResult = await awsApi.uploadImages(vehicle.id, selectedImages);
            finalImageUrls = [...finalImageUrls, ...uploadResult.imageUrls];
          } catch (uploadError) {
            console.error('Image upload failed during editing:', uploadError);
            toast.error('Failed to upload images. Please try again.');
            return; // Exit early if image upload fails
          } finally {
            setUploadingImages(false);
          }
        } else {
          // For new vehicles, upload after creating the vehicle
          // Just proceed with vehicle creation first
          setUploadingImages(false);
        }
      }

      const vehicleData: CreateVehicleDto | UpdateVehicleDto = {
        ...data,
        images: finalImageUrls,
      };

      let result: Vehicle;

      if (isEditing && vehicle) {
        result = await updateVehicleMutation.mutateAsync({
          id: vehicle.id,
          data: vehicleData as UpdateVehicleDto,
        });
      } else {
        result = await createVehicleMutation.mutateAsync(vehicleData as CreateVehicleDto);

        // Upload images for new vehicle
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          try {
            const uploadResult = await awsApi.uploadImages(result.id, selectedImages);
            // Update the vehicle with image URLs
            await updateVehicleMutation.mutateAsync({
              id: result.id,
              data: { images: uploadResult.imageUrls },
            });
          } catch (uploadError) {
            console.error('Image upload failed for new vehicle:', uploadError);
            toast.error('Vehicle created but image upload failed');
          } finally {
            setUploadingImages(false);
          }
        }
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(isEditing ? 'Failed to update vehicle' : 'Failed to create vehicle');
      // Ensure loading states are reset on any error
      setUploadingImages(false);
    }
  };

  const isLoading = isSubmitting || uploadingImages || createVehicleMutation.isPending || updateVehicleMutation.isPending;

  return (
    <Box>
        <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
          }}
        >
          {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Basic Information
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Vehicle Type */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Vehicle Type *</InputLabel>
                      <Select {...field} label="Vehicle Type *">
                        {vehicleTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.type && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {errors.type.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Brand */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={commonBrands}
                      freeSolo
                      onChange={(_, value) => field.onChange(value || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Brand *"
                          error={!!errors.brand}
                          helperText={errors.brand?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Model */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Model *"
                      fullWidth
                      error={!!errors.model}
                      helperText={errors.model?.message}
                    />
                  )}
                />
              </Grid>

              {/* Year */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.year}>
                      <InputLabel>Year *</InputLabel>
                      <Select {...field} label="Year *">
                        {yearOptions.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.year && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {errors.year.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Color */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={commonColors}
                      freeSolo
                      onChange={(_, value) => field.onChange(value || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Color *"
                          error={!!errors.color}
                          helperText={errors.color?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Engine Size */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="engineSize"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Engine Size *"
                      fullWidth
                      placeholder="e.g., 2.5L, 1.6L Turbo"
                      error={!!errors.engineSize}
                      helperText={errors.engineSize?.message}
                    />
                  )}
                />
              </Grid>

              {/* Price */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price *"
                      type="number"
                      fullWidth
                      slotProps={{ input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      } }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Description */}
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: { xs: 1.5, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 0 }
            }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Description
              </Typography>
              <Button
                variant="outlined"
                startIcon={generatingDescription ? <CircularProgress size={16} /> : <AutoAwesome />}
                onClick={handleGenerateDescription}
                disabled={generatingDescription || isLoading}
                size="small"
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  whiteSpace: { xs: 'nowrap', sm: 'normal' }
                }}
              >
                {generatingDescription ? 'Generating...' : 'Generate AI Description'}
              </Button>
            </Box>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Vehicle Description"
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Enter a detailed description of the vehicle..."
                  error={!!errors.description}
                  helperText={errors.description?.message || "Describe the vehicle's features, condition, and selling points"}
                />
              )}
            />
          </Box>

          <Divider />

          {/* Images */}
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Vehicle Images
            </Typography>
            <ImageUpload
              onImagesChange={setSelectedImages}
              onExistingImagesChange={handleExistingImagesChange}
              selectedFiles={selectedImages}
              maxImages={5}
              initialImages={existingImages}
              disabled={isLoading}
              uploading={uploadingImages}
            />
          </Box>

          {/* Form Actions */}
          <Box sx={{
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            gap: { xs: 1.5, sm: 2 },
            pt: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
              startIcon={<Cancel />}
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                order: { xs: 2, sm: 1 }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <Save />}
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                order: { xs: 1, sm: 2 }
              }}
            >
              {isLoading
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                ? 'Update Vehicle'
                : 'Create Vehicle'}
            </Button>
          </Box>
        </form>
        </Paper>
      </Box>
  );
}