export const financeProviders = ["binance", "bit"] as const;
export const financeCategories = ["us_stocks", "nasdaq", "cash", "other"] as const;
export type FinanceProvider = (typeof financeProviders)[number];
export type FinanceCategory = (typeof financeCategories)[number];

export type DisciplineRule = { id: string; text: string; enabled: boolean };
export type Discipline = { enabled: boolean; revision: number; rules: DisciplineRule[] };

export type FinanceAccount = {
  provider: FinanceProvider;
  connected: boolean;
  totalUsd: number | null;
  maskedKey: string | null;
  scope: string | null;
  lastSyncedAt: string | null;
  warnings: string[];
  lastError: string | null;
};

export type FinanceHolding = {
  id: string;
  provider: FinanceProvider;
  symbol: string;
  name: string;
  quantity: string;
  valueUsd: number | null;
  averageCostUsd: number | null;
  category: FinanceCategory;
};

export type FinanceTransaction = {
  id: string;
  provider: FinanceProvider;
  symbol: string;
  status: string;
  side: string;
  quantity: string;
  priceUsd: number | null;
  amountUsd: number | null;
  occurredAt: string;
};

export type FinanceSnapshot = { day: string; totalUsd: number; providers: FinanceProvider[] };
export type FinanceWeights = { us_stocks: number; nasdaq: number; cash: number };
export type FinanceTargets = { revision: number; weights: FinanceWeights | null };

export type FinanceOverview = {
  totalUsd: number | null;
  accounts: FinanceAccount[];
  holdings: FinanceHolding[];
  transactions: FinanceTransaction[];
  snapshots: FinanceSnapshot[];
  targets: FinanceTargets;
};

export const providerLabels: Record<FinanceProvider, string> = { binance: "币安", bit: "BIT.com" };
export const categoryLabels: Record<FinanceCategory, string> = {
  us_stocks: "美股个股",
  nasdaq: "纳斯达克",
  cash: "现金",
  other: "其他资产",
};
