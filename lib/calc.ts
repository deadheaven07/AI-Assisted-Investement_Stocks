import { SipCalculationInput, SipYearlyBreakdown } from './types';

/**
 * Calculates compound future value for lump sum + monthly SIP.
 * 
 * - Compounding: Monthly compounding (i = annualRate / 12)
 * - SIP Timing: Annuity due (beginning of each month, standard for SIP execution)
 * - Lump sum: Compounded monthly from month 0
 */
export function calculateFutureValue(
  lumpSum: number,
  monthlySip: number,
  months: number,
  annualRatePercent: number
): number {
  if (months <= 0) return Math.max(0, lumpSum);

  const safeLumpSum = Math.max(0, lumpSum);
  const safeSip = Math.max(0, monthlySip);
  const r = annualRatePercent / 100;
  const i = r / 12;

  if (i === 0) {
    return safeLumpSum + safeSip * months;
  }

  // Lump sum FV = P * (1 + i)^n
  const lumpFv = safeLumpSum * Math.pow(1 + i, months);

  // SIP FV (Annuity Due) = M * [((1 + i)^n - 1) / i] * (1 + i)
  const sipFv = safeSip * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);

  return Math.round((lumpFv + sipFv) * 100) / 100;
}

/**
 * Generates year-by-year projections for bad, normal, and good cases.
 * Includes Year 0 through Year horizonYears.
 */
export function generateSipProjection(input: SipCalculationInput): SipYearlyBreakdown[] {
  const {
    lumpSum,
    monthlySip,
    horizonYears,
    badRatePercent,
    normalRatePercent,
    goodRatePercent,
  } = input;

  const years = Math.max(1, Math.min(50, Math.round(horizonYears || 1)));
  const results: SipYearlyBreakdown[] = [];

  for (let year = 0; year <= years; year++) {
    const months = year * 12;
    const totalInvested = Math.round(Math.max(0, lumpSum) + Math.max(0, monthlySip) * months);

    const badCase = calculateFutureValue(lumpSum, monthlySip, months, badRatePercent);
    const normalCase = calculateFutureValue(lumpSum, monthlySip, months, normalRatePercent);
    const goodCase = calculateFutureValue(lumpSum, monthlySip, months, goodRatePercent);

    results.push({
      year,
      totalInvested,
      badCase: Math.round(badCase),
      normalCase: Math.round(normalCase),
      goodCase: Math.round(goodCase),
    });
  }

  return results;
}

/**
 * Helper to format Indian Rupee values with proper commas (e.g. ₹1,50,000)
 */
export function formatINR(val: number): string {
  if (isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}
