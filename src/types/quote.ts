export type CeilingHeight = 'standard' | 'high';
export type CoatCount = 1 | 2;
export type ServiceType = 'interior' | 'exterior';
export type HomeStories = 1 | 2;
export type SidingType = 'wood' | 'stucco' | 'vinyl' | 'other';

export interface SidingOption {
  id: SidingType;
  label: string;
}

export const SIDING_OPTIONS: SidingOption[] = [
  { id: 'wood', label: 'Wood' },
  { id: 'stucco', label: 'Stucco' },
  { id: 'vinyl', label: 'Vinyl' },
  { id: 'other', label: 'Other' },
];

export interface PricingConfig {
  clientSlug: string;
  clientName: string;
  hourlyLaborRate: number;
  productionRate: number;
  paintCostPerGallon: number;
  paintCoverage: number;
  sundriesMarkup: number;
  fixedOverhead: number;
  profitMargin: number;
  doorLaborAllowance: number;
  standardCeilingMultiplier: number;
  highCeilingMultiplier: number;
  rangePercent: number;
  roundingIncrement: number;
  updatedAt?: string;
}

export interface QuoteInput {
  clientSlug: string;
  service: ServiceType;
  // Interior fields
  sqft?: number;
  ceiling?: CeilingHeight;
  doors?: number;
  coats?: CoatCount;
  // Exterior fields
  home_stories?: HomeStories;
  home_sqft?: number;
  siding_type?: SidingType;
  // Contact details
  fullName: string;
  phone: string;
  email: string;
}

export interface QuoteCalculationResult {
  clientSlug: string;
  service: ServiceType;
  gallons: number;
  materials: number;
  laborHours: number;
  laborCost: number;
  subtotal: number;
  ceilingMultiplier: number;
  adjusted: number;
  finalQuote: number;
  rawLow: number;
  rawHigh: number;
  quoteLow: number;
  quoteHigh: number;
  breakdown: {
    sqft: number;
    coats: CoatCount;
    doors: number;
    ceiling: CeilingHeight;
    gallons: number;
    laborHours: number;
  };
}

export interface PricingSnapshot {
  hourlyLaborRate: number;
  productionRate: number;
  paintCostPerGallon: number;
  paintCoverage: number;
  sundriesMarkup: number;
  fixedOverhead: number;
  profitMargin: number;
  doorLaborAllowance: number;
  standardCeilingMultiplier: number;
  highCeilingMultiplier: number;
  rangePercent: number;
  roundingIncrement: number;
  materialsCost?: number;
  laborCost?: number;
  laborHours?: number;
  gallons?: number;
  subtotal?: number;
  ceilingMultiplier?: number;
  adjusted?: number;
  finalQuote?: number;
  quoteLow?: number;
  quoteHigh?: number;
}

export interface QuoteSubmission {
  id: string;
  clientSlug: string;
  service: ServiceType;
  quote_type?: 'instant' | 'manual';
  pricing_mode?: 'instant_calculation' | 'manual_quote';

  // Interior fields
  sqft?: number;
  ceiling?: CeilingHeight;
  doors?: number;
  coats?: CoatCount;
  exactCalculatedQuote?: number | null;
  displayLow?: number | null;
  displayHigh?: number | null;
  pricing_snapshot?: PricingSnapshot | null;

  // Exterior fields
  home_stories?: HomeStories;
  home_sqft?: number;
  siding_type?: SidingType;

  fullName: string;
  phone: string;
  email: string;
  inputPayload?: QuoteInput | Record<string, unknown>;
  submissionSource?: string;
  createdAt: string;
}
