import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PricingConfig, QuoteSubmission } from '../src/types/quote.js';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const DATA_DIR = isServerless ? path.resolve('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'firestore_store.json');

export const DEFAULT_TEST_PAINTER_CONFIG: PricingConfig = {
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

interface DatabaseSchema {
  pricingConfigs: Record<string, PricingConfig>;
  submissions: QuoteSubmission[];
}

let inMemoryDb: DatabaseSchema | null = null;

function getInitialDb(): DatabaseSchema {
  return {
    pricingConfigs: {
      'test-painter': { ...DEFAULT_TEST_PAINTER_CONFIG },
    },
    submissions: [],
  };
}

function ensureDb(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialDb();
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch {
        // Read-only filesystem fallback
      }
      inMemoryDb = initialData;
      return initialData;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.pricingConfigs['test-painter']) {
      parsed.pricingConfigs['test-painter'] = { ...DEFAULT_TEST_PAINTER_CONFIG };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch {
        // Read-only filesystem fallback
      }
    }
    inMemoryDb = parsed;
    return parsed;
  } catch (err) {
    console.warn('Filesystem access limited, operating with in-memory database:', err);
    if (!inMemoryDb) {
      inMemoryDb = getInitialDb();
    }
    return inMemoryDb;
  }
}

function saveDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to disk, retained in memory:', err);
  }
}

export async function getPricingConfig(clientSlug: string): Promise<PricingConfig | null> {
  const db = ensureDb();
  return db.pricingConfigs[clientSlug] || null;
}

export async function updatePricingConfig(
  clientSlug: string,
  updates: Partial<PricingConfig>
): Promise<PricingConfig> {
  const db = ensureDb();
  const current = db.pricingConfigs[clientSlug] || { ...DEFAULT_TEST_PAINTER_CONFIG, clientSlug };

  const updated: PricingConfig = {
    ...current,
    ...updates,
    clientSlug,
    updatedAt: new Date().toISOString(),
  };

  db.pricingConfigs[clientSlug] = updated;
  saveDb(db);
  return updated;
}

export async function resetPricingConfig(clientSlug: string): Promise<PricingConfig> {
  const db = ensureDb();
  if (clientSlug === 'test-painter') {
    db.pricingConfigs[clientSlug] = {
      ...DEFAULT_TEST_PAINTER_CONFIG,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);
    return db.pricingConfigs[clientSlug];
  }
  throw new Error(`Unknown client slug: ${clientSlug}`);
}

export async function saveSubmission(
  submission: Omit<QuoteSubmission, 'id' | 'createdAt'>
): Promise<QuoteSubmission> {
  const db = ensureDb();
  const id = 'sub_' + crypto.randomBytes(8).toString('hex');
  const record: QuoteSubmission = {
    ...submission,
    id,
    createdAt: new Date().toISOString(),
  };

  db.submissions.unshift(record);
  saveDb(db);
  return record;
}

export async function getSubmissions(clientSlug?: string): Promise<QuoteSubmission[]> {
  const db = ensureDb();
  if (clientSlug) {
    return db.submissions.filter((s) => s.clientSlug === clientSlug);
  }
  return db.submissions;
}
