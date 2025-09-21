import { getSession } from 'next-auth/react';
import {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleFilters,
  PaginatedVehicles,
  VehicleStats,
  AuthResponse,
  LoginCredentials,
  UploadResponse,
} from '@/types';

const getApiBaseUrl = () => {
  const isServer = typeof window === 'undefined';
  const url = isServer
    ? process.env.BACKEND_URL // Server-side (SSR/API routes) using docker service name
    : process.env.NEXT_PUBLIC_API_URL // Client-side (browser)

  return url;
};

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeaders() {
  const session = await getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'An error occurred',
      statusCode: response.status,
    }));
    throw new ApiError(response.status, errorData.message || 'An error occurred');
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async (filters?: VehicleFilters): Promise<PaginatedVehicles> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${getApiBaseUrl()}/vehicles${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return handleResponse<PaginatedVehicles>(response);
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await fetch(`${getApiBaseUrl()}/vehicles/${id}`);
    return handleResponse<Vehicle>(response);
  },

  create: async (vehicleData: CreateVehicleDto): Promise<Vehicle> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/vehicles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(vehicleData),
    });
    return handleResponse<Vehicle>(response);
  },

  update: async (id: string, vehicleData: UpdateVehicleDto): Promise<Vehicle> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/vehicles/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(vehicleData),
    });
    return handleResponse<Vehicle>(response);
  },

  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/vehicles/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<void>(response);
  },

  bulkDelete: async (ids: string[]): Promise<{ deleted: number }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/vehicles/bulk/delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ ids }),
    });
    return handleResponse<{ deleted: number }>(response);
  },

  generateDescription: async (id: string): Promise<{ description: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getApiBaseUrl()}/vehicles/${id}/generate-description`, {
      method: 'POST',
      headers,
    });
    return handleResponse<{ description: string }>(response);
  },

  getStats: async (): Promise<VehicleStats> => {
    const response = await fetch(`${getApiBaseUrl()}/vehicles/stats`);
    return handleResponse<VehicleStats>(response);
  },
};

// AWS API
export const awsApi = {
  uploadImages: async (vehicleId: string, files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const session = await getSession();
    const headers: HeadersInit = {};
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(`${getApiBaseUrl()}/aws/upload/${vehicleId}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<UploadResponse>(response);
  },


  deleteImage: async (key: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const encodedKey = encodeURIComponent(key);
    const response = await fetch(`${getApiBaseUrl()}/aws/image/${encodedKey}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<void>(response);
  },
};

export { ApiError };