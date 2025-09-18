import { ParkingLotSearchDTO } from '@/types';
import { rateApi } from './api';

// Cache for rates to avoid repeated API calls
const rateCache = new Map<number, { rate: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear any existing cache to ensure fresh data
rateCache.clear();

/**
 * Fetches the highest priority rate for a parking lot
 * @param lotId - The parking lot ID
 * @returns The hourly rate in dollars, or null if no rate found
 */
export async function getHighestPriorityRate(lotId: number): Promise<number | null> {
  try {
    // Check cache first
    const cached = rateCache.get(lotId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.rate;
    }

    // Fetch rate assignments sorted by priority (highest first)
    const response = await rateApi.getLotRateAssignmentsByLotId(lotId, 0, 1, 'priority,desc');
    
    if (response.content && response.content.length > 0) {
      const highestPriorityAssignment = response.content[0];
      
      // For now, we'll use a mock calculation based on priority
      // In a real implementation, you'd fetch the actual rate plan details
      const baseRate = 2.0; // Base rate in dollars
      const priorityMultiplier = Math.max(0.5, 1.0 - (highestPriorityAssignment.priority * 0.1));
      const hourlyRate = baseRate * priorityMultiplier;
      
      // Cache the result
      rateCache.set(lotId, { rate: hourlyRate, timestamp: Date.now() });
      
      return hourlyRate;
    }
    
    // If no rate assignments found, return null (no mock fallback)
    console.log(`No rate assignments found for lot ${lotId}`);
    return null;
  } catch (error) {
    console.error(`Failed to fetch rate for lot ${lotId}:`, error);
    return null;
  }
}

/**
 * Formats a rate value for display
 * @param rate - The rate value
 * @returns Formatted rate string
 */
export function formatRate(rate: number | null): string {
  if (rate === null) {
    return 'Rate N/A';
  }
  return `$${rate.toFixed(2)}/hr`;
}

/**
 * Fetches rates for multiple parking lots
 * @param lots - Array of parking lots
 * @returns Promise that resolves to lots with rates
 */
export async function fetchRatesForLots(lots: ParkingLotSearchDTO[]): Promise<Array<ParkingLotSearchDTO & { hourlyRate: number | null }>> {
  try {
    const lotsWithRates = await Promise.all(
      lots.map(async (lot) => {
        try {
          const rate = await getHighestPriorityRate(lot.id);
          return { ...lot, hourlyRate: rate };
        } catch (error) {
          console.error(`Failed to fetch rate for lot ${lot.id}:`, error);
          return { ...lot, hourlyRate: null };
        }
      })
    );
    
    return lotsWithRates;
  } catch (error) {
    console.error('Failed to fetch rates for lots:', error);
    // Return lots with null rates if fetching fails
    return lots.map(lot => ({ ...lot, hourlyRate: null }));
  }
}

/**
 * Clears the rate cache
 */
export function clearRateCache(): void {
  rateCache.clear();
}
