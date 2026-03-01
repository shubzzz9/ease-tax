export type BusinessTaxationType = 'regular' | 'presumptive44AD' | 'presumptive44ADA' | 'presumptive44AE';

export interface BusinessInputs {
  taxationType: BusinessTaxationType;
  // Regular business
  netProfit: number;
  additions: number;       // Disallowances u/s 40, 40A, 43B
  deductions: number;      // Allowable expenses not debited
  bfBusinessLoss: number;  // Brought forward u/s 72
  // Presumptive 44AD
  turnoverDigital: number;
  turnoverCash: number;
  declaredIncome44AD: number; // User can declare higher
  // Presumptive 44ADA
  grossReceipts: number;
  declaredIncome44ADA: number;
  // Presumptive 44AE
  heavyVehicles: number;
  otherVehicles: number;
  monthsOperated: number;
  declaredIncome44AE: number;
}

export interface BusinessResult {
  taxationType: BusinessTaxationType;
  taxationLabel: string;
  grossIncome: number;
  deemedIncome: number;       // For presumptive
  declaredIncome: number;     // If user declares higher
  additions: number;
  deductionsAllowed: number;
  bfLossSetOff: number;
  taxableBusinessIncome: number;
  warnings: string[];
}

export const DEFAULT_BUSINESS_INPUTS: BusinessInputs = {
  taxationType: 'regular',
  netProfit: 0,
  additions: 0,
  deductions: 0,
  bfBusinessLoss: 0,
  turnoverDigital: 0,
  turnoverCash: 0,
  declaredIncome44AD: 0,
  grossReceipts: 0,
  declaredIncome44ADA: 0,
  heavyVehicles: 0,
  otherVehicles: 0,
  monthsOperated: 12,
  declaredIncome44AE: 0,
};

// AY 2026-27 statutory limits
export const LIMITS_44AD = {
  turnoverLimit: 30000000,        // ₹3 Cr (if digital > 95%)
  turnoverLimitCash: 20000000,    // ₹2 Cr (if cash > 5%)
  rateDigital: 0.06,
  rateCash: 0.08,
};

export const LIMITS_44ADA = {
  grossReceiptsLimit: 7500000,    // ₹75 Lakh
  deemedRate: 0.50,
};

export const LIMITS_44AE = {
  perHeavyVehiclePerMonth: 7500,  // ₹7,500/month per heavy goods vehicle
  perOtherVehiclePerMonth: 7500,  // ₹7,500/month per other vehicle
};
