export type AssetType = 'listedEquity' | 'equityMF' | 'immovableProperty' | 'unlistedShare' | 'debtMF' | 'otherAsset';

export type ExemptionType = 'none' | '54' | '54F' | '54EC' | '54B' | '54GB';

export interface CapitalGainTransaction {
  id: string;
  assetType: AssetType;
  dateOfAcquisition: string;
  dateOfTransfer: string;
  saleConsideration: number;
  transferExpenses: number;
  costOfAcquisition: number;
  costOfImprovement: number;
  exemptionType: ExemptionType;
  exemptionAmount: number;
  capitalGainsAccountScheme: boolean;
}

export interface ComputedTransaction {
  transaction: CapitalGainTransaction;
  holdingMonths: number;
  isLongTerm: boolean;
  netConsideration: number;
  indexedCostOfAcquisition: number;
  indexedCostOfImprovement: number;
  grossGain: number;
  exemption: number;
  taxableGain: number;
  taxSection: '111A' | '112A' | '112' | 'slab';
  taxRate: number;
  taxRateLabel: string;
  isGrandfathered: boolean;
  grandfatheredOption?: 'indexed' | 'nonIndexed';
}

export interface CapitalGainsAggregated {
  stcg111A: number;
  stcgSlab: number;
  ltcg112AGross: number;
  ltcg112ANet: number;
  ltcg112: number;
  ltcg112Indexed: number;
  stcg111ATax: number;
  ltcg112ATax: number;
  ltcg112Tax: number;
  totalExemptions: number;
  capitalGainsSpecial: number;
  capitalGainsNormal: number;
  computed: ComputedTransaction[];
}

export const ASSET_LABELS: Record<AssetType, string> = {
  listedEquity: 'Listed Equity Shares',
  equityMF: 'Equity Mutual Fund',
  immovableProperty: 'Land / Building',
  unlistedShare: 'Unlisted Shares',
  debtMF: 'Debt Mutual Fund',
  otherAsset: 'Other Capital Asset',
};

export const EXEMPTION_LABELS: Record<ExemptionType, string> = {
  none: 'No Exemption',
  '54': 'Section 54 – Residential House',
  '54F': 'Section 54F – Other Assets',
  '54EC': 'Section 54EC – Capital Gain Bonds',
  '54B': 'Section 54B – Agricultural Land',
  '54GB': 'Section 54GB – Startup Investment',
};

// Cost Inflation Index: key = FY start year (e.g. 2001 = FY 2001-02)
export const CII: Record<number, number> = {
  2001: 100, 2002: 105, 2003: 109, 2004: 113, 2005: 117,
  2006: 122, 2007: 129, 2008: 137, 2009: 148, 2010: 167,
  2011: 184, 2012: 200, 2013: 220, 2014: 240, 2015: 254,
  2016: 264, 2017: 272, 2018: 280, 2019: 289, 2020: 301,
  2021: 317, 2022: 331, 2023: 348, 2024: 363,
};

// Holding period thresholds (months) for long-term classification – AY 2026-27
export const HOLDING_THRESHOLDS: Record<AssetType, number> = {
  listedEquity: 12,
  equityMF: 12,
  immovableProperty: 24,
  unlistedShare: 24,
  debtMF: 24,
  otherAsset: 24,
};

// Post this date indexation removed (Finance Act 2024)
export const GRANDFATHERING_DATE = '2024-07-23';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
