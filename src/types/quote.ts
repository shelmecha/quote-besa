export type CeilingHeight = 'standard' | 'high';
export type CoatCount = 1 | 2;
export type ServiceType = 'interior' | 'exterior';

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
  sqft: number;
  ceiling: CeilingHeight;
  doors: number;
  coats: CoatCount;
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
  sqft: number;
  ceiling: CeilingHeight;
  doors: number;
  coats: CoatCount;
  fullName: string;
  phone: string;
  email: string;
  exactCalculatedQuote: number;
  displayLow: number;
  displayHigh: number;
  inputPayload: QuoteInput;
  pricing_snapshot: PricingSnapshot;
  submissionSource?: 'calculate_click' | 'final_request_click';
  createdAt: string;
}
