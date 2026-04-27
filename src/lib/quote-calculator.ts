
import type { QuoteRequest } from '@/lib/types';

// Define constants for fees
export const DELIVERY_FEE = 30;
export const STAKIT_SHIELD_FEE = 20;

interface QuoteCalculationResult {
  subtotal: number;
  extensionFee: number;
  extraWeeks: number;
  deliveryFee: number;
  stakitShieldFee: number;
  total: number;
}

/**
 * Calculates the number of extra weeks beyond the initial 7-day period.
 * @param startDate - The start date of the rental.
 * @param endDate - The end date of the rental.
 * @returns The number of full or partial weeks beyond the first week.
 */
function calculateExtraWeeks(startDate: Date | string, endDate: Date | string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return 0;

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return 0;

    const totalWeeks = Math.ceil(diffDays / 7);
    return totalWeeks - 1;
}

/**
 * Calculates the cost of an extension based on a new end date.
 * @param items - The array of items from the quote.
 * @param originalStartDate - The original start date of the rental.
 * @param originalEndDate - The original end date of the rental.
 * @param newEndDate - The proposed new end date.
 * @returns The calculated cost for the additional weeks.
 */
export function calculateExtensionCost(
    items: QuoteRequest['items'],
    originalStartDate: Date | string,
    originalEndDate: Date | string,
    newEndDate: Date | string
): { cost: number, additionalWeeks: number } {
    if (!Array.isArray(items) || items.length === 0 || !newEndDate) {
        return { cost: 0, additionalWeeks: 0 };
    }

    const originalExtraWeeks = calculateExtraWeeks(originalStartDate, originalEndDate);
    const newExtraWeeks = calculateExtraWeeks(originalStartDate, newEndDate);
    
    const additionalWeeks = newExtraWeeks - originalExtraWeeks;

    if (additionalWeeks <= 0) {
        return { cost: 0, additionalWeeks: 0 };
    }

    const extensionCost = items.reduce((acc, item) => {
        if (item.followOnPrice) {
            return acc + (item.quantity * item.followOnPrice * additionalWeeks);
        }
        return acc;
    }, 0);

    return { cost: extensionCost, additionalWeeks };
}


/**
 * Calculates the complete price breakdown for a quote request.
 * This is the single source of truth for all quote calculations.
 *
 * @param items - The array of items from the quote.
 * @param rentalStartDate - The start date of the rental.
 * @param rentalEndDate - The end date of the rental.
 * @param stakitShield - Whether the protection plan is included.
 * @returns A QuoteCalculationResult object with the full price breakdown.
 */
export function calculateQuoteTotal(
  items: QuoteRequest['items'],
  rentalStartDate: Date | string,
  rentalEndDate: Date | string,
  stakitShield?: boolean
): QuoteCalculationResult {
  // Ensure items is an array and has content
  if (!Array.isArray(items) || items.length === 0) {
    return { subtotal: 0, extensionFee: 0, extraWeeks: 0, deliveryFee: 0, stakitShieldFee: 0, total: 0 };
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const extraWeeks = calculateExtraWeeks(rentalStartDate, rentalEndDate);

  const extensionFee = items.reduce((acc, item) => {
    if (item.followOnPrice) {
      return acc + (item.quantity * item.followOnPrice * extraWeeks);
    }
    return acc;
  }, 0);
  
  const deliveryFee = DELIVERY_FEE;
  const stakitShieldFee = stakitShield ? STAKIT_SHIELD_FEE : 0;

  const total = subtotal + deliveryFee + extensionFee + stakitShieldFee;

  return {
    subtotal,
    extensionFee,
    extraWeeks,
    deliveryFee,
    stakitShieldFee,
    total,
  };
}
