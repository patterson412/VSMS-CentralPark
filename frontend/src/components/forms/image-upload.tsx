'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import { imageUploadSchema } from '@/lib/validations';
import Grid from '@mui/material/Grid2';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Close,
} from '@mui/icons-material';
import Image from 'next/image';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  onExistingImagesChange?: (imageUrls: string[]) => void;
  selectedFiles?: File[];
  maxImages?: number;
  initialImages?: string[];
  disabled?: boolean;
  uploading?: boolean;
}

export function ImageUpload({
  onImagesChange,
  onExistingImagesChange,
  maxImages = 5,
  selectedFiles = [],
  initialImages = [],
  disabled = false,
  uploading = false,
}: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const totalFiles = selectedFiles.length + fileArray.length + initialImages.length;

    if (totalFiles > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You're trying to add ${fileArray.length} more files.`);
      return;
    }

    const validation = imageUploadSchema.safeParse({ files: fileArray });

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid files';
      setError(errorMessage);
      return;
    }

    setError('');

    const newPreviewUrls: string[] = [];
    fileArray.forEach(file => {
      const url = URL.createObjectURL(file);
      newPreviewUrls.push(url);
    });

    const updatedFiles = [...selectedFiles, ...fileArray];
    const updatedPreviews = [...previewUrls, ...newPreviewUrls];

    onImagesChange(updatedFiles);
    setPreviewUrls(updatedPreviews);
  }, [selectedFiles, previewUrls, initialImages.length, maxImages, onImagesChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index]);

    onImagesChange(newFiles);
    setPreviewUrls(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = initialImages.filter((_, i) => i !== index);
    onExistingImagesChange?.(newExistingImages);
  };

  const clearAll = () => {
    // Revoke all object URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    onImagesChange([]);
    setPreviewUrls([]);
    setError('');
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'primary.50' : disabled ? 'grey.50' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': !disabled ? {
            borderColor: 'primary.light',
            bgcolor: 'grey.50'
          } : {}
        }}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="image-upload-input"
          disabled={disabled}
        />

        <Box sx={{ textAlign: 'center' }}>
          <CloudUpload sx={{
            color: 'grey.400',
            fontSize: { xs: 32, sm: 40, md: 48 },
            mb: { xs: 1.5, sm: 2 }
          }} />
          <Typography variant="h6" sx={{
            mb: 1,
            color: 'text.primary',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            {dragActive ? 'Drop images here' : 'Upload Vehicle Images'}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'text.secondary',
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Drag and drop images here, or click to select files
          </Typography>
          <Typography variant="caption" sx={{
            color: 'text.disabled',
            display: 'block',
            mb: 2,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 0 }
          }}>
            Maximum {maxImages} images • Max 5MB each • JPEG, PNG, WebP
          </Typography>

          <Button
            variant="contained"
            component="label"
            htmlFor="image-upload-input"
            disabled={disabled || (selectedFiles.length + initialImages.length) >= maxImages}
            startIcon={<ImageIcon />}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Choose Images
          </Button>
        </Box>
      </Paper>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading images...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Image Previews */}
      {(selectedFiles.length > 0 || initialImages.length > 0) && (
        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            mb: 2
          }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Selected Images ({selectedFiles.length + initialImages.length}/{maxImages})
            </Typography>
            {selectedFiles.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={clearAll}
                startIcon={<Delete />}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 3 }
                }}
              >
                Clear New Images
              </Button>
            )}
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* Existing Images (from server) */}
            {initialImages.map((imageUrl, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`existing-${index}`}>
                <Paper
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    '&:hover .remove-btn': {
                      opacity: 1
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '1' }}>
                    <Image
                      src={imageUrl}
                      alt={`Existing vehicle image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                    <Box className="remove-btn" sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, zIndex: 10, transition: 'opacity 0.2s ease-in-out' }}>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                        onClick={() => removeExistingImage(index)}
                        disabled={disabled}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: { xs: 4, sm: 8 }, left: { xs: 4, sm: 8 } }}>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: (theme) => `${theme.palette.common.black}b3`, // 70% opacity
                          color: 'white',
                          px: { xs: 0.5, sm: 1 },
                          py: { xs: 0.25, sm: 0.5 },
                          borderRadius: 1,
                          fontSize: { xs: '0.6rem', sm: '0.75rem' }
                        }}
                      >
                        Existing
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}

            {/* New Selected Images */}
            {previewUrls.map((url, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`preview-${index}`}>
                <Paper
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    '&:hover .remove-btn': {
                      opacity: 1
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '1' }}>
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                    <Box className="remove-btn" sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, zIndex: 10, transition: 'opacity 0.2s ease-in-out' }}>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 4, sm: 8 },
                      left: { xs: 4, sm: 8 },
                      bgcolor: (theme) => `${theme.palette.common.black}b3`, // 70% opacity
                      color: 'white',
                      px: { xs: 0.5, sm: 1 },
                      py: { xs: 0.25, sm: 0.5 },
                      borderRadius: 1,
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      maxWidth: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {selectedFiles[index]?.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}