import type { Hub, Load } from '@/domain/types';

/** Flat management fee charged by the platform on every validated load (USD). */
export const ADMIN_FEE_USD = 170;
/** Insurance premium as a share of the declared cargo value. */
export const INSURANCE_RATE = 0.008;
/** Indicative transport rate per kilometre for a full truck (USD). */
const RATE_PER_KM = 2.1;
const HANDLING_USD = 150;

const KM: Record<string, number> = {
  'Banana-Boma': 100,
  'Boma-Matadi': 120,
  'Banana-Matadi': 210,
  'Matadi-Kinshasa': 350,
  'Boma-Kinshasa': 470,
  'Banana-Kinshasa': 560,
  'Kinshasa-Lubumbashi': 2300,
  'Matadi-Lubumbashi': 2650,
  'Lubumbashi-Kolwezi': 310,
  'Lubumbashi-Kasumbalesa': 95,
  'Kolwezi-Kasumbalesa': 400,
  'Kinshasa-Kolwezi': 2100,
  'Kinshasa-Goma': 2600,
  'Lubumbashi-Goma': 1900,
  'Kolwezi-Goma': 2150,
  'Dundo-Kinshasa': 1300,
  'Dundo-Lubumbashi': 1500,
  'Dundo-Kolwezi': 1350,
  'Dundo-Matadi': 1650,
};

export function distanceKm(origin: Hub, destination: Hub): number {
  if (origin === destination) return 0;
  return KM[`${origin}-${destination}`] ?? KM[`${destination}-${origin}`] ?? 1200;
}

export function estimateTruckPrice(origin: Hub, destination: Hub, weightT: number): number {
  const km = distanceKm(origin, destination);
  const weightFactor = weightT > 25 ? 1.15 : 1;
  const raw = km * RATE_PER_KM * weightFactor + HANDLING_USD;
  return Math.round(raw / 10) * 10;
}

export function insurancePremium(estimatedValue: number, insured: boolean): number {
  if (!insured) return 0;
  return Math.round(estimatedValue * INSURANCE_RATE);
}

export function quoteTotal(load: Pick<Load, 'truckPrice' | 'adminFee' | 'insurancePremium'>): number {
  return load.truckPrice + load.adminFee + load.insurancePremium;
}

export function yearlyProjection(loadsPerMonth: number): number {
  return loadsPerMonth * ADMIN_FEE_USD * 12;
}
