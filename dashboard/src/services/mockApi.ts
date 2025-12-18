import type { FiltersState } from '../store/types';

export type TimePoint = { date: string; value: number };

export type DashboardData = {
  kpis: {
    totalSales: number;
    activeUsers: number;
    engagementRate: number; // 0..1
  };
  series: {
    sales: TimePoint[];
    users: TimePoint[];
    engagement: TimePoint[];
  };
  tableRows: Array<{
    id: string;
    name: string;
    email: string;
    country: string;
    status: 'active' | 'inactive';
    sales: number;
  }>;
};

/**
 * Small deterministic RNG (LCG).
 * Same seed => same sequence across runs (no external libs).
 */
function createRng(seed: number) {
  let state = seed >>> 0;
  return {
    next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 2 ** 32;
    },
    int(min: number, max: number) {
      const r = this.next();
      return Math.floor(r * (max - min + 1)) + min;
    },
    float(min: number, max: number) {
      const r = this.next();
      return r * (max - min) + min;
    },
  };
}

function hashSeed(input: string) {
  // Simple, stable seed: weighted char codes (kept small and readable).
  let acc = 0;
  for (let i = 0; i < input.length; i += 1) {
    acc = (acc + input.charCodeAt(i) * (i + 1)) % 1_000_000_007;
  }
  return acc;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toIsoDateUTC(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function addDaysUTC(date: Date, days: number) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function makeDailyPoints(start: Date, count: number) {
  const dates: string[] = [];
  for (let i = 0; i < count; i += 1) {
    dates.push(toIsoDateUTC(addDaysUTC(start, i)));
  }
  return dates;
}

function makeStepDaysPoints(start: Date, count: number, stepDays: number) {
  const dates: string[] = [];
  for (let i = 0; i < count; i += 1) {
    dates.push(toIsoDateUTC(addDaysUTC(start, i * stepDays)));
  }
  return dates;
}

function makeMonthlyPoints(startYear: number, startMonth1Based: number, count: number) {
  const dates: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const month0 = startMonth1Based - 1 + i;
    const year = startYear + Math.floor(month0 / 12);
    const month = (month0 % 12) + 1;
    dates.push(`${year}-${pad2(month)}-01`);
  }
  return dates;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardData(filters: FiltersState): Promise<DashboardData> {
  const seed = hashSeed(`${filters.dateRange}|${filters.region}|${filters.dataset}`);
  const rng = createRng(seed);

  // Deterministic delay (250–350ms), depends on seed => stable for same filters.
  const ms = 250 + (seed % 101);
  await delay(ms);

  // Small multipliers so output changes with region/dataset while staying "reasonable".
  const regionMult =
    filters.region === 'us' ? 1.1 : filters.region === 'eu' ? 1.0 : filters.region === 'apac' ? 0.95 : 1.02;
  const datasetMult = filters.dataset === 'alt' ? 0.92 : 1.0;
  const mult = regionMult * datasetMult;

  // Keep dates stable (not dependent on "today") so same filters always => same data.
  const anchorStart = new Date(Date.UTC(2025, 0, 1)); // 2025-01-01 UTC

  let dates: string[] = [];
  if (filters.dateRange === '30d') {
    dates = makeDailyPoints(anchorStart, 30);
  } else if (filters.dateRange === '90d') {
    // 18 points every 5 days (consistent rule).
    dates = makeStepDaysPoints(anchorStart, 18, 5);
  } else {
    // 365d -> 12 monthly points
    dates = makeMonthlyPoints(2025, 1, 12);
  }

  const sales: TimePoint[] = [];
  const users: TimePoint[] = [];
  const engagement: TimePoint[] = [];

  for (let i = 0; i < dates.length; i += 1) {
    // Smooth-ish series with mild noise
    const t = i / Math.max(1, dates.length - 1);
    const wave = Math.sin(t * Math.PI * 2);

    const salesValue = Math.round((1200 + wave * 250 + rng.float(-120, 120)) * mult);
    const usersValue = Math.round((260 + wave * 40 + rng.float(-25, 25)) * (mult * 0.9 + 0.1));
    const engagementValue = clamp01(0.55 + wave * 0.08 + rng.float(-0.05, 0.05));

    sales.push({ date: dates[i], value: Math.max(0, salesValue) });
    users.push({ date: dates[i], value: Math.max(0, usersValue) });
    engagement.push({ date: dates[i], value: engagementValue });
  }

  const sumSales = sales.reduce((acc, p) => acc + p.value, 0);
  const avgUsers = users.reduce((acc, p) => acc + p.value, 0) / Math.max(1, users.length);
  const avgEng = engagement.reduce((acc, p) => acc + p.value, 0) / Math.max(1, engagement.length);

  const kpis = {
    totalSales: Math.round(sumSales * 1.7),
    activeUsers: Math.round(avgUsers * 12),
    engagementRate: clamp01(avgEng),
  };

  const firstNames = ['Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Ivy', 'Lucas', 'Leah', 'Mason'];
  const lastNames = ['Kim', 'Patel', 'Garcia', 'Smith', 'Chen', 'Johnson', 'Wong', 'Brown', 'Martin', 'Singh'];
  const countries = ['US', 'DE', 'FR', 'GB', 'NG', 'JP', 'AU', 'BR', 'CA', 'SG'];

  const rowCount = 18 + (seed % 13); // 18..30
  const tableRows: DashboardData['tableRows'] = [];
  for (let i = 0; i < rowCount; i += 1) {
    const fn = firstNames[rng.int(0, firstNames.length - 1)];
    const ln = lastNames[rng.int(0, lastNames.length - 1)];
    const name = `${fn} ${ln}`;
    const email = `${fn}.${ln}.${i}`.toLowerCase() + '@example.com';
    const country = countries[rng.int(0, countries.length - 1)];
    const status: 'active' | 'inactive' = rng.next() < 0.78 ? 'active' : 'inactive';
    const baseSales = rng.int(250, 9500);
    const salesAmount = Math.round(baseSales * mult);

    tableRows.push({
      id: `user_${seed}_${i}`,
      name,
      email,
      country,
      status,
      sales: salesAmount,
    });
  }

  return {
    kpis,
    series: { sales, users, engagement },
    tableRows,
  };
}


