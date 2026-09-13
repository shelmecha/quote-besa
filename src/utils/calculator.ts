import { QuoteInput, PricingConfig, QuoteCalculationResult } from '../types/quote';

export const DEFAULT_CLIENT_PRICING: PricingConfig = {
  clientSlug: 'test-painter',
  clientName: 'Test Painting Company',
  hourlyLaborRate: 40,
  productionRate: 125,
  paintCostPerGallon: 65,
  paintCoverage: 350,
  sundriesMarkup: 0.10,
  fixedOverhead: 100,
  profitMargin: 0.30,
  doorLaborAllowance: 0.5,
  standardCeilingMultiplier: 1.0,
  highCeilingMultiplier: 1.15,
  rangePercent: 0.20,
  roundingIncrement: 25,
  updatedAt: new Date().toISOString(),
};

export function calculateQuoteClient(input: QuoteInput, config: PricingConfig = DEFAULT_CLIENT_PRICING): QuoteCalculationResult {
  const sqft = input.sqft ?? 0;
  const doors = input.doors ?? 0;
  const coats = input.coats;
  const ceiling = input.ceiling;

  if (sqft <= 0) {
    throw new Error('Square footage must be greater than 0');
  }
  if (doors < 0) {
    throw new Error('Doors cannot be negative');
  }
  if (coats !== 1 && coats !== 2) {
    throw new Error('Coats must be either 1 or 2');
  }
  if (ceiling !== 'standard' && ceiling !== 'high') {
    throw new Error('Ceiling must be either standard or high');
  }

  // 1. Gallons: Math.ceil((sqft * coats) / paintCoverage)
  const gallons = Math.ceil((sqft * coats) / config.paintCoverage);

  // 2. Materials: (gallons * paintCostPerGallon) * (1 + sundriesMarkup)
  const materials = (gallons * config.paintCostPerGallon) * (1 + config.sundriesMarkup);

  // 3. Labor Hours: (sqft / productionRate) + (doors * doorLaborAllowance)
  const laborHours = (sqft / config.productionRate) + (doors * config.doorLaborAllowance);

  // 4. Labor Cost: laborHours * hourlyLaborRate
  const laborCost = laborHours * config.hourlyLaborRate;

  // 5. Subtotal: materials + laborCost + fixedOverhead
  const subtotal = materials + laborCost + config.fixedOverhead;

  // 6. Ceiling Multiplier
  const ceilingMultiplier = ceiling === 'high'
    ? config.highCeilingMultiplier
    : config.standardCeilingMultiplier;

  // 7. Adjusted: subtotal * ceilingMultiplier
  const adjusted = subtotal * ceilingMultiplier;

  // 8. Profit Margin: adjusted / (1 - profitMargin)
  const finalQuote = adjusted / (1 - config.profitMargin);

  // 9. Estimate Range
  const rawLow = finalQuote * (1 - config.rangePercent);
  const rawHigh = finalQuote * (1 + config.rangePercent);

  // 10. Round outward to nearest roundingIncrement
  const increment = config.roundingIncrement > 0 ? config.roundingIncrement : 25;
  const quoteLow = Math.floor(rawLow / increment) * increment;
  const quoteHigh = Math.ceil(rawHigh / increment) * increment;

  return {
    clientSlug: input.clientSlug,
    service: input.service,
    gallons,
    materials,
    laborHours,
    laborCost,
    subtotal,
    ceilingMultiplier,
    adjusted,
    finalQuote,
    rawLow,
    rawHigh,
    quoteLow,
    quoteHigh,
    breakdown: {
      sqft,
      coats,
      doors,
      ceiling,
      gallons,
      laborHours: Math.round(laborHours * 10) / 10,
    },
  };
}
