import { type ClassValue, clsx } from 'clsx';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ReadonlyURLSearchParams } from 'next/navigation';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Updates URL parameters in real-time while preserving existing parameters
 * @param params - Object containing parameter updates
 * @param router - Next.js router instance
 * @param searchParams - Current search parameters
 * @param pathname - Current pathname
 */
export const updateUrlParams = (params: Record<string, string | undefined>, router: AppRouterInstance, searchParams: ReadonlyURLSearchParams, pathname: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Update or add new parameters
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
    });

    // Create the new URL
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
};

/**
 * Formats currency values with proper commas and decimal places
 * @param value - Number to format as currency
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats numbers with commas for better readability
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}


/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gets the appropriate color for vehicle type chips
 * @param type - Vehicle type
 * @returns MUI chip color
 */
export function getVehicleTypeColor(type: string) {
  switch (type.toLowerCase()) {
    case 'car':
      return 'primary';
    case 'suv':
      return 'success';
    case 'truck':
      return 'warning';
    case 'bike':
      return 'error';
    case 'van':
      return 'info';
    case 'motorcycle':
      return 'error';
    case 'electric vehicle':
      return 'success';
    default:
      return 'default';
  }
}