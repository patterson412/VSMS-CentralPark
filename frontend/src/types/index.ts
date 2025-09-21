export interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  engineSize: string;
  year: number;
  price: number;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  type: string;
  brand: string;
  model: string;
  color: string;
  engineSize: string;
  year: number;
  price: number;
  description?: string;
  images?: string[];
}

export interface UpdateVehicleDto {
  type?: string;
  brand?: string;
  model?: string;
  color?: string;
  engineSize?: string;
  year?: number;
  price?: number;
  description?: string;
  images?: string[];
}

export interface VehicleFilters {
  type?: string;
  brand?: string;
  model?: string;
  color?: string;
  engineSize?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleStats {
  totalVehicles: number;
  vehicleTypes: Array<{ type: string; count: number }>;
  averagePrice: number;
  totalValue: number;
  recentlyAdded: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    createdAt: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface UploadResponse {
  imageUrls: string[];
  uploadedCount: number;
}
