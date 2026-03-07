import { BusinessInputs, DEFAULT_BUSINESS_INPUTS } from './business-types';

export interface TaxInputs {
  ageGroup: 'below60' | '60to79' | '80plus';
  employmentType: 'salaried' | 'business' | 'both';
  basicSalary: number;
  da: number;
  hra: number;
  rentPaid: number;
  cityType: 'metro' | 'nonmetro';
  otherAllowances: number;
  professionalTax: number;
  employerNps: number;
  propertyType: 'none' | 'rented';
  rentReceived: number;
  municipalTaxes: number;
  homeLoanInterest: number;
  // Legacy fields kept for backward compat
  netProfit: number;
  businessAdjustments: number;
  bfBusinessLoss: number;
  // New PGBP engine
  businessInputs: BusinessInputs;
  stcgEquity: number;
  ltcgEquity: number;
  stcgProperty: number;
  ltcgProperty: number;
  fdInterest: number;
  savingsInterest: number;
  dividend: number;
  familyPension: number;
  agriculturalIncome: number;
  otherIncome: number;
  sec80C: number;
  sec80D: number;
  sec80CCD1B: number;
  sec80E: number;
  sec80G: number;
  sec80GType: '100' | '50' | '100_restricted' | '50_restricted';
  sec80GCashDonation: number;
  sec80DPreventive: number;
  sec80TTA: number;
  sec80U: number;
  otherDeductions: number;
  tds: number;
  advanceTax: number;
  selfAssessmentTax: number;
  clientName: string;
  pan: string;
}

export interface TaxResult {
  grossSalaryIncome: number;
  hraExemption: number;
  standardDeduction: number;
  netSalaryIncome: number;
  housePropertyIncome: number;
  businessIncome: number;
  capitalGainsNormal: number;
  capitalGainsSpecial: number;
  stcg111ATax: number;
  ltcg112ATax: number;
  ltcg112Tax: number;
  otherIncome: number;
  grossTotalIncome: number;
  totalDeductions: number;
  totalTaxableIncome: number;
  normalIncome: number;
  taxOnNormalIncome: number;
  taxOnSpecialIncome: number;
  rebate87A: number;
  totalTaxBeforeSurcharge: number;
  surcharge: number;
  marginalRelief: number;
  cess: number;
  totalTaxLiability: number;
  taxPaid: number;
  netPayable: number;
  totalAmountPayable: number;
  warnings: string[];
}

export const DEFAULT_INPUTS: TaxInputs = {
  ageGroup: 'below60',
  employmentType: 'salaried',
  basicSalary: 0, da: 0, hra: 0, rentPaid: 0, cityType: 'metro',
  otherAllowances: 0, professionalTax: 0, employerNps: 0,
  propertyType: 'rented', rentReceived: 0, municipalTaxes: 0, homeLoanInterest: 0,
  netProfit: 0, businessAdjustments: 0, bfBusinessLoss: 0,
  businessInputs: { ...DEFAULT_BUSINESS_INPUTS },
  stcgEquity: 0, ltcgEquity: 0, stcgProperty: 0, ltcgProperty: 0,
  fdInterest: 0, savingsInterest: 0, dividend: 0, familyPension: 0,
  agriculturalIncome: 0, otherIncome: 0,
  sec80C: 0, sec80D: 0, sec80DPreventive: 0, sec80CCD1B: 0, sec80E: 0, sec80G: 0,
  sec80GType: '100' as const, sec80GCashDonation: 0,
  sec80TTA: 0, sec80U: 0, otherDeductions: 0,
  tds: 0, advanceTax: 0, selfAssessmentTax: 0,
  clientName: '',
  pan: '',
};

export const DEMO_INPUTS: TaxInputs = {
  ...DEFAULT_INPUTS,
  basicSalary: 1200000,
  homeLoanInterest: 200000,
  propertyType: 'rented',
  rentReceived: 300000,
  sec80C: 150000,
  stcgEquity: 50000,
  ltcgEquity: 200000,
  tds: 80000,
};
