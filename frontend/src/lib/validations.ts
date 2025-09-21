import { z } from 'zod';

// Vehicle Form Validation Schema
export const vehicleFormSchema = z.object({
  type: z.string().min(1, 'Vehicle type is required'),
  brand: z.string().min(1, 'Brand is required').max(100, 'Brand must be less than 100 characters'),
  model: z.string().min(1, 'Model is required').max(100, 'Model must be less than 100 characters'),
  color: z.string().min(1, 'Color is required').max(50, 'Color must be less than 50 characters'),
  engineSize: z.string().min(1, 'Engine size is required').max(50, 'Engine size must be less than 50 characters'),
  year: z.number()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(10000000, 'Price must be reasonable'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

// Login Form Validation Schema
export const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Image Upload Validation
export const imageUploadSchema = z.object({
  files: z.array(z.instanceof(File))
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed')
    .refine(
      (files) => files.every(file => file.size <= 5 * 1024 * 1024),
      'Each file must be less than 5MB'
    )
    .refine(
      (files) => files.every(file =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
      ),
      'Only JPEG, PNG, and WebP files are allowed'
    ),
});

// Vehicle Type Options
export const vehicleTypes = [
  'Car',
  'SUV',
  'Truck',
  'Bike',
  'Van',
  'Motorcycle',
  'Electric Vehicle',
] as const;

// Common brand options for autocomplete
export const commonBrands = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Nissan',
  'Hyundai',
  'Kia',
  'Mazda',
  'Subaru',
  'Tesla',
  'Lexus',
  'Infiniti',
  'Acura',
  'Cadillac',
  'Buick',
  'GMC',
  'Jeep',
  'Ram',
  'Dodge',
  'Chrysler',
  'Volvo',
  'Jaguar',
  'Land Rover',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'Maserati',
  'Bentley',
  'Rolls-Royce',
] as const;

// Common colors for autocomplete
export const commonColors = [
  'White',
  'Black',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Brown',
  'Gold',
  'Beige',
  'Maroon',
  'Navy',
  'Pink',
] as const;