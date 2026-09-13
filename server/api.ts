import express, { Request, Response, Router } from 'express';
import { calculateQuote } from './calculator.js';
import { getPricingConfig, updatePricingConfig, resetPricingConfig, saveSubmission, getSubmissions } from './db.js';
import { QuoteInput } from '../src/types/quote.js';

export const apiRouter: Router = express.Router();

apiRouter.use(express.json());

// Helper for validating email format
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Helper for reasonable phone validation
function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

// 1. Calculate Quote Endpoint (POST /api/quote)
apiRouter.post('/quote', async (req: Request, res: Response) => {
  try {
    const {
      clientSlug = 'test-painter',
      service = 'interior',
      sqft,
      ceiling = 'standard',
      doors = 0,
      coats = 2,
      home_stories,
      home_sqft,
      siding_type,
      fullName = '',
      phone = '',
      email = '',
    } = req.body;

    const errors: Record<string, string> = {};

    if (service !== 'interior' && service !== 'exterior') {
      errors.service = 'Service must be either interior or exterior.';
      res.status(400).json({ success: false, errors });
      return;
    }

    // Contact details validation (required for both services)
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }

    if (!email || !isValidEmail(email)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!phone || !isValidPhone(phone)) {
      errors.phone = 'Please provide a valid contact phone number (at least 7 digits).';
    }

    // BRANCH 1 — INTERIOR PAINTING
    if (service === 'interior') {
      const numSqft = Number(sqft);
      if (!sqft || isNaN(numSqft) || numSqft <= 0) {
        errors.sqft = 'Wall square footage must be greater than 0.';
      }

      const numDoors = Number(doors);
      if (doors === undefined || isNaN(numDoors) || numDoors < 0) {
        errors.doors = 'Doors count cannot be negative.';
      }

      const numCoats = Number(coats);
      if (numCoats !== 1 && numCoats !== 2) {
        errors.coats = 'Number of coats must be either 1 or 2.';
      }

      if (ceiling !== 'standard' && ceiling !== 'high') {
        errors.ceiling = 'Ceiling height must be either "Standard 8-9 ft" or "High / Vaulted".';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      // Load pricing config from database (source of truth)
      const config = await getPricingConfig(clientSlug);
      if (!config) {
        res.status(404).json({
          success: false,
          error: `Pricing configuration not found for client "${clientSlug}".`,
        });
        return;
      }

      const inputPayload: QuoteInput = {
        clientSlug,
        service: 'interior',
        sqft: numSqft,
        ceiling,
        doors: numDoors,
        coats: numCoats as 1 | 2,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      // Calculate quote authoritative on server
      const quoteResult = calculateQuote(inputPayload, config);

      // Save lead automatically into submissions collection with full pricing snapshot
      const pricingSnapshot = {
        hourlyLaborRate: config.hourlyLaborRate,
        productionRate: config.productionRate,
        paintCostPerGallon: config.paintCostPerGallon,
        paintCoverage: config.paintCoverage,
        sundriesMarkup: config.sundriesMarkup,
        fixedOverhead: config.fixedOverhead,
        profitMargin: config.profitMargin,
        doorLaborAllowance: config.doorLaborAllowance,
        standardCeilingMultiplier: config.standardCeilingMultiplier,
        highCeilingMultiplier: config.highCeilingMultiplier,
        rangePercent: config.rangePercent,
        roundingIncrement: config.roundingIncrement,
        materialsCost: Math.round(quoteResult.materials * 100) / 100,
        laborCost: Math.round(quoteResult.laborCost * 100) / 100,
        laborHours: Math.round(quoteResult.laborHours * 10) / 10,
        gallons: quoteResult.gallons,
        subtotal: Math.round(quoteResult.subtotal * 100) / 100,
        ceilingMultiplier: quoteResult.ceilingMultiplier,
        adjusted: Math.round(quoteResult.adjusted * 100) / 100,
        finalQuote: Math.round(quoteResult.finalQuote * 100) / 100,
        quoteLow: quoteResult.quoteLow,
        quoteHigh: quoteResult.quoteHigh,
      };

      const savedLead = await saveSubmission({
        clientSlug,
        service: 'interior',
        quote_type: 'instant',
        pricing_mode: 'instant_calculation',
        sqft: numSqft,
        ceiling,
        doors: numDoors,
        coats: numCoats as 1 | 2,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        exactCalculatedQuote: Math.round(quoteResult.finalQuote * 100) / 100,
        displayLow: quoteResult.quoteLow,
        displayHigh: quoteResult.quoteHigh,
        inputPayload,
        pricing_snapshot: pricingSnapshot,
        submissionSource: 'calculate_click',
      });

      res.json({
        success: true,
        data: quoteResult,
        leadSubmissionId: savedLead.id,
        leadSubmission: savedLead,
        source: {
          database: 'firestore_store',
          clientSlug: config.clientSlug,
          hourlyLaborRate: config.hourlyLaborRate,
        },
      });
      return;
    }

    // BRANCH 2 — EXTERIOR PAINTING (LEAD CAPTURE ONLY - NO PRICING CALCULATION)
    if (service === 'exterior') {
      const numHomeStories = Number(home_stories);
      if (!home_stories || (numHomeStories !== 1 && numHomeStories !== 2)) {
        errors.home_stories = 'Home stories is required (must be 1 or 2).';
      }

      const numHomeSqft = Number(home_sqft);
      if (!home_sqft || isNaN(numHomeSqft) || numHomeSqft <= 0) {
        errors.home_sqft = 'Approximate home size must be greater than 0 sq ft.';
      }

      const validSiding = ['wood', 'stucco', 'vinyl', 'other'];
      const normalizedSiding = typeof siding_type === 'string' ? siding_type.trim().toLowerCase() : '';
      if (!normalizedSiding || !validSiding.includes(normalizedSiding)) {
        errors.siding_type = 'Siding type is required (Wood, Stucco, Vinyl, or Other).';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      // DO NOT call calculateQuote or calculate any price
      const inputPayload: QuoteInput = {
        clientSlug,
        service: 'exterior',
        home_stories: numHomeStories as 1 | 2,
        home_sqft: numHomeSqft,
        siding_type: normalizedSiding as 'wood' | 'stucco' | 'vinyl' | 'other',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      const savedLead = await saveSubmission({
        clientSlug,
        service: 'exterior',
        quote_type: 'manual',
        pricing_mode: 'manual_quote',
        home_stories: numHomeStories as 1 | 2,
        home_sqft: numHomeSqft,
        siding_type: normalizedSiding as 'wood' | 'stucco' | 'vinyl' | 'other',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        inputPayload,
        submissionSource: 'request_custom_estimate_click',
      });

      res.json({
        success: true,
        manualQuote: true,
        service: 'exterior',
        leadSubmissionId: savedLead.id,
        leadSubmission: savedLead,
        message: "Thanks — we'll follow up with a custom estimate.",
      });
      return;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred processing the request';
    console.error('Error in /api/quote:', err);
    res.status(500).json({ success: false, error: message });
  }
});

// 2. Submit Inquiry Endpoint (POST /api/submissions)
apiRouter.post('/submissions', async (req: Request, res: Response) => {
  try {
    const {
      clientSlug = 'test-painter',
      service = 'interior',
      sqft,
      ceiling = 'standard',
      doors = 0,
      coats = 2,
      home_stories,
      home_sqft,
      siding_type,
      fullName,
      phone,
      email,
    } = req.body;

    const errors: Record<string, string> = {};

    if (service !== 'interior' && service !== 'exterior') {
      errors.service = 'Service must be either interior or exterior.';
      res.status(400).json({ success: false, errors });
      return;
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }

    if (!email || !isValidEmail(email)) {
      errors.email = 'Valid email is required.';
    }

    if (!phone || !isValidPhone(phone)) {
      errors.phone = 'Valid phone is required.';
    }

    if (service === 'interior') {
      const numSqft = Number(sqft);
      if (!sqft || isNaN(numSqft) || numSqft <= 0) {
        errors.sqft = 'Wall square footage must be greater than 0.';
      }

      const numDoors = Number(doors);
      if (doors === undefined || isNaN(numDoors) || numDoors < 0) {
        errors.doors = 'Doors count cannot be negative.';
      }

      const numCoats = Number(coats);
      if (numCoats !== 1 && numCoats !== 2) {
        errors.coats = 'Number of coats must be either 1 or 2.';
      }

      if (ceiling !== 'standard' && ceiling !== 'high') {
        errors.ceiling = 'Invalid ceiling height.';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      // Fetch authoritative pricing from DB and recalculate server-side (do not trust client)
      const config = await getPricingConfig(clientSlug);
      if (!config) {
        res.status(404).json({ success: false, error: 'Client pricing configuration not found' });
        return;
      }

      const inputPayload: QuoteInput = {
        clientSlug,
        service: 'interior',
        sqft: numSqft,
        ceiling,
        doors: numDoors,
        coats: numCoats as 1 | 2,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      const calculation = calculateQuote(inputPayload, config);

      const pricingSnapshot = {
        hourlyLaborRate: config.hourlyLaborRate,
        productionRate: config.productionRate,
        paintCostPerGallon: config.paintCostPerGallon,
        paintCoverage: config.paintCoverage,
        sundriesMarkup: config.sundriesMarkup,
        fixedOverhead: config.fixedOverhead,
        profitMargin: config.profitMargin,
        doorLaborAllowance: config.doorLaborAllowance,
        standardCeilingMultiplier: config.standardCeilingMultiplier,
        highCeilingMultiplier: config.highCeilingMultiplier,
        rangePercent: config.rangePercent,
        roundingIncrement: config.roundingIncrement,
        materialsCost: Math.round(calculation.materials * 100) / 100,
        laborCost: Math.round(calculation.laborCost * 100) / 100,
        laborHours: Math.round(calculation.laborHours * 10) / 10,
        gallons: calculation.gallons,
        subtotal: Math.round(calculation.subtotal * 100) / 100,
        ceilingMultiplier: calculation.ceilingMultiplier,
        adjusted: Math.round(calculation.adjusted * 100) / 100,
        finalQuote: Math.round(calculation.finalQuote * 100) / 100,
        quoteLow: calculation.quoteLow,
        quoteHigh: calculation.quoteHigh,
      };

      // Save submission to database
      const saved = await saveSubmission({
        clientSlug,
        service: 'interior',
        quote_type: 'instant',
        pricing_mode: 'instant_calculation',
        sqft: numSqft,
        ceiling,
        doors: numDoors,
        coats: numCoats as 1 | 2,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        exactCalculatedQuote: Math.round(calculation.finalQuote * 100) / 100,
        displayLow: calculation.quoteLow,
        displayHigh: calculation.quoteHigh,
        inputPayload,
        pricing_snapshot: pricingSnapshot,
        submissionSource: 'final_request_click',
      });

      res.status(201).json({
        success: true,
        submissionId: saved.id,
        data: saved,
        message: 'Your inquiry has been submitted and securely recorded.',
      });
      return;
    }

    if (service === 'exterior') {
      const numHomeStories = Number(home_stories);
      if (!home_stories || (numHomeStories !== 1 && numHomeStories !== 2)) {
        errors.home_stories = 'Home stories is required (must be 1 or 2).';
      }

      const numHomeSqft = Number(home_sqft);
      if (!home_sqft || isNaN(numHomeSqft) || numHomeSqft <= 0) {
        errors.home_sqft = 'Approximate home size must be greater than 0 sq ft.';
      }

      const validSiding = ['wood', 'stucco', 'vinyl', 'other'];
      const normalizedSiding = typeof siding_type === 'string' ? siding_type.trim().toLowerCase() : '';
      if (!normalizedSiding || !validSiding.includes(normalizedSiding)) {
        errors.siding_type = 'Siding type is required (Wood, Stucco, Vinyl, or Other).';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      // DO NOT calculate price for exterior
      const inputPayload: QuoteInput = {
        clientSlug,
        service: 'exterior',
        home_stories: numHomeStories as 1 | 2,
        home_sqft: numHomeSqft,
        siding_type: normalizedSiding as 'wood' | 'stucco' | 'vinyl' | 'other',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      const saved = await saveSubmission({
        clientSlug,
        service: 'exterior',
        quote_type: 'manual',
        pricing_mode: 'manual_quote',
        home_stories: numHomeStories as 1 | 2,
        home_sqft: numHomeSqft,
        siding_type: normalizedSiding as 'wood' | 'stucco' | 'vinyl' | 'other',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        inputPayload,
        submissionSource: 'final_request_click',
      });

      res.status(201).json({
        success: true,
        submissionId: saved.id,
        data: saved,
        message: "We've received your exterior project details and will contact you to discuss the project and pricing.",
      });
      return;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save quote submission';
    console.error('Error in /api/submissions:', err);
    res.status(500).json({ success: false, error: message });
  }
});

// 3. Get Pricing Config (GET /api/pricing/:clientSlug)
apiRouter.get('/pricing/:clientSlug', async (req: Request, res: Response) => {
  try {
    const { clientSlug } = req.params;
    const config = await getPricingConfig(clientSlug);
    if (!config) {
      res.status(404).json({ success: false, error: 'Pricing config not found' });
      return;
    }
    res.json({ success: true, config });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 4. Update Pricing Config in Database (PUT /api/pricing/:clientSlug)
// Enables testing: "Temporarily change hourly labor rate 40 -> 50 in the database"
apiRouter.put('/pricing/:clientSlug', async (req: Request, res: Response) => {
  try {
    const { clientSlug } = req.params;
    const updates = req.body;
    const updated = await updatePricingConfig(clientSlug, updates);
    res.json({ success: true, config: updated });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 5. Reset Pricing Config (POST /api/pricing/:clientSlug/reset)
apiRouter.post('/pricing/:clientSlug/reset', async (req: Request, res: Response) => {
  try {
    const { clientSlug } = req.params;
    const restored = await resetPricingConfig(clientSlug);
    res.json({ success: true, config: restored });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 6. List Submissions (GET /api/submissions/:clientSlug)
apiRouter.get('/submissions/:clientSlug', async (req: Request, res: Response) => {
  try {
    const { clientSlug } = req.params;
    const list = await getSubmissions(clientSlug);
    res.json({ success: true, submissions: list });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: String(err) });
  }
});
