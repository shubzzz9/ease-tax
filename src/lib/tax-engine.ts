import { TaxInputs, TaxResult } from './tax-types';
import { computeAggregatedCapitalGains } from './capital-gains-engine';

interface Slab { limit: number; rate: number }

const NEW_REGIME_SLABS: Slab[] = [
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 0.05 },
  { limit: 1200000, rate: 0.10 },
  { limit: 1600000, rate: 0.15 },
  { limit: 2000000, rate: 0.20 },
  { limit: 2400000, rate: 0.25 },
  { limit: Infinity, rate: 0.30 },
];

const OLD_SLABS_BELOW60: Slab[] = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
];
const OLD_SLABS_60TO79: Slab[] = [
  { limit: 300000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
];
const OLD_SLABS_80PLUS: Slab[] = [
  { limit: 500000, rate: 0 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
];

function slabTax(income: number, slabs: Slab[]): number {
  if (income <= 0) return 0;
  let tax = 0, prev = 0;
  for (const s of slabs) {
    const chunk = Math.min(income, s.limit) - prev;
    if (chunk <= 0) break;
    tax += chunk * s.rate;
    prev = s.limit;
    if (income <= s.limit) break;
  }
  return tax;
}

function getSlabs(regime: 'old' | 'new', age: string): Slab[] {
  if (regime === 'new') return NEW_REGIME_SLABS;
  if (age === '80plus') return OLD_SLABS_80PLUS;
  if (age === '60to79') return OLD_SLABS_60TO79;
  return OLD_SLABS_BELOW60;
}

function computeSurcharge(
  tax: number, totalIncome: number, regime: 'old' | 'new',
  specialTax: number
): { surcharge: number; marginalRelief: number } {
  if (totalIncome <= 5000000 || tax <= 0) return { surcharge: 0, marginalRelief: 0 };

  const brackets = regime === 'new'
    ? [
        { threshold: 5000000, prevRate: 0, rate: 0.10 },
        { threshold: 10000000, prevRate: 0.10, rate: 0.15 },
        { threshold: 20000000, prevRate: 0.15, rate: 0.25 },
      ]
    : [
        { threshold: 5000000, prevRate: 0, rate: 0.10 },
        { threshold: 10000000, prevRate: 0.10, rate: 0.15 },
        { threshold: 20000000, prevRate: 0.15, rate: 0.25 },
        { threshold: 50000000, prevRate: 0.25, rate: 0.37 },
      ];

  let applicableRate = 0, prevRate = 0, threshold = 0;
  for (const b of brackets) {
    if (totalIncome > b.threshold) {
      prevRate = b.rate;
      continue;
    }
    applicableRate = b.rate;
    prevRate = b.prevRate;
    threshold = b.threshold;
    break;
  }
  // If beyond all brackets
  if (applicableRate === 0) {
    const last = brackets[brackets.length - 1];
    if (totalIncome > last.threshold) {
      applicableRate = regime === 'new' ? 0.25 : 0.37;
      prevRate = last.prevRate;
      threshold = last.threshold;
    }
  }
  if (applicableRate === 0) return { surcharge: 0, marginalRelief: 0 };

  // Surcharge on special rate income capped at 15%
  const normalTax = tax - specialTax;
  const scNormal = normalTax * applicableRate;
  const scSpecial = specialTax * Math.min(applicableRate, 0.15);
  let surcharge = scNormal + scSpecial;

  // Marginal relief
  const prevScNormal = normalTax * prevRate;
  const prevScSpecial = specialTax * Math.min(prevRate, 0.15);
  const prevSurcharge = prevScNormal + prevScSpecial;

  const taxWithSc = tax + surcharge;
  const prevTaxWithSc = tax + prevSurcharge;
  const marginalCap = prevTaxWithSc + (totalIncome - threshold);

  let marginalRelief = 0;
  if (taxWithSc > marginalCap) {
    marginalRelief = taxWithSc - marginalCap;
    surcharge = Math.max(0, surcharge - marginalRelief);
  }

  return { surcharge, marginalRelief };
}

export function computeTax(inputs: TaxInputs, regime: 'old' | 'new'): TaxResult {
  const warnings: string[] = [];
  const isSalaried = inputs.employmentType !== 'business';

  // 1. SALARY
  const grossSalary = inputs.basicSalary + inputs.da + inputs.hra + inputs.otherAllowances;

  let hraExemption = 0;
  if (regime === 'old' && inputs.hra > 0 && inputs.rentPaid > 0) {
    const salary = inputs.basicSalary + inputs.da;
    hraExemption = Math.min(
      inputs.hra,
      Math.max(0, inputs.rentPaid - 0.1 * salary),
      (inputs.cityType === 'metro' ? 0.5 : 0.4) * salary
    );
  }

  const standardDeduction = isSalaried ? (regime === 'new' ? 75000 : 50000) : 0;
  const profTax = regime === 'old' ? inputs.professionalTax : 0;
  const employerNps = inputs.employerNps; // Allowed in both

  const netSalaryIncome = Math.max(0, grossSalary - hraExemption - standardDeduction - profTax - employerNps);

  // 2. HOUSE PROPERTY
  let housePropertyIncome = 0;
  if (inputs.propertyType === 'selfOccupied') {
    housePropertyIncome = -Math.min(inputs.homeLoanInterest, 200000);
  } else if (inputs.propertyType === 'rented') {
    const nav = Math.max(0, inputs.rentReceived - inputs.municipalTaxes);
    housePropertyIncome = nav - nav * 0.3 - inputs.homeLoanInterest;
  }

  if (regime === 'new' && housePropertyIncome < 0) {
    warnings.push('Loss from House Property cannot be set off under New Regime.');
    housePropertyIncome = 0;
  }
  if (regime === 'old' && housePropertyIncome < -200000) {
    warnings.push('House Property loss set-off capped at ₹2,00,000. Excess carried forward.');
    housePropertyIncome = -200000;
  }

  // 3. BUSINESS
  const businessIncome = Math.max(0, inputs.netProfit + inputs.businessAdjustments - inputs.bfBusinessLoss);

  // 4. CAPITAL GAINS (computed from transactions)
  const cgResult = computeAggregatedCapitalGains(
    inputs.capitalGainTransactions, inputs.bfCapitalLossSTCG, inputs.bfCapitalLossLTCG
  );
  const capitalGainsNormal = cgResult.capitalGainsNormal;
  const capitalGainsSpecial = cgResult.capitalGainsSpecial;
  const stcg111ATax = cgResult.stcg111ATax;
  const ltcg112ATax = cgResult.ltcg112ATax;
  const ltcg112TaxAmt = cgResult.ltcg112Tax;

  // 5. OTHER INCOME
  const fpDeduction = inputs.familyPension > 0 ? Math.min(inputs.familyPension / 3, 15000) : 0;
  const totalOther = inputs.fdInterest + inputs.savingsInterest + inputs.dividend
    + (inputs.familyPension - fpDeduction) + inputs.otherIncome;

  // 6. GROSS TOTAL INCOME
  const grossTotalIncome = netSalaryIncome + housePropertyIncome + businessIncome
    + capitalGainsNormal + capitalGainsSpecial + totalOther;

  // 7. DEDUCTIONS
  let totalDeductions = 0;
  if (regime === 'old') {
    const d80C = Math.min(inputs.sec80C, 150000);
    const d80CCD1B = Math.min(inputs.sec80CCD1B, 50000);
    const isSenior = inputs.ageGroup !== 'below60';
    const d80TTA = isSenior ? Math.min(inputs.sec80TTA, 50000) : Math.min(inputs.sec80TTA, 10000);
    totalDeductions = d80C + inputs.sec80D + d80CCD1B + inputs.sec80E
      + inputs.sec80G + d80TTA + inputs.sec80U + inputs.otherDeductions;
  }

  // 8. TAXABLE INCOME
  const totalTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
  const normalIncome = Math.max(0, totalTaxableIncome - capitalGainsSpecial);

  // 9. TAX ON NORMAL INCOME
  const slabs = getSlabs(regime, inputs.ageGroup);
  let taxOnNormal = slabTax(normalIncome, slabs);

  // Agricultural integration (old regime)
  if (regime === 'old' && inputs.agriculturalIncome > 5000 && normalIncome > 0) {
    const exemptLimit = inputs.ageGroup === '80plus' ? 500000
      : inputs.ageGroup === '60to79' ? 300000 : 250000;
    if (normalIncome > exemptLimit) {
      const taxTotal = slabTax(normalIncome + inputs.agriculturalIncome, slabs);
      const taxAgri = slabTax(inputs.agriculturalIncome + exemptLimit, slabs);
      taxOnNormal = taxTotal - taxAgri;
      warnings.push('Agricultural income integration applied.');
    }
  }

  // 10. SPECIAL TAX
  const taxOnSpecial = stcg111ATax + ltcg112ATax + ltcg112TaxAmt;

  // 11. REBATE 87A
  let rebate87A = 0;
  if (regime === 'new') {
    if (totalTaxableIncome <= 1200000) {
      rebate87A = taxOnNormal;
    } else {
      // Marginal relief on rebate
      const excess = totalTaxableIncome - 1200000;
      if (taxOnNormal > excess) {
        rebate87A = taxOnNormal - excess;
      }
    }
  } else {
    if (totalTaxableIncome <= 500000 && inputs.ageGroup !== '80plus') {
      rebate87A = Math.min(taxOnNormal, 12500);
    }
  }

  if (rebate87A > 0 && taxOnSpecial > 0) {
    warnings.push('Rebate u/s 87A applies only on normal income tax, not on capital gains tax.');
  }

  const taxAfterRebate = Math.max(0, taxOnNormal - rebate87A) + taxOnSpecial;

  // 12. SURCHARGE
  const { surcharge, marginalRelief } = computeSurcharge(
    taxAfterRebate, totalTaxableIncome, regime, taxOnSpecial
  );

  // 13. CESS
  const cess = (taxAfterRebate + surcharge) * 0.04;

  // 14. TOTAL
  const totalTaxLiability = Math.round(taxAfterRebate + surcharge + cess);

  // 15. TAX PAID
  const taxPaid = inputs.tds + inputs.advanceTax + inputs.selfAssessmentTax;

  return {
    grossSalaryIncome: grossSalary,
    hraExemption,
    standardDeduction,
    netSalaryIncome,
    housePropertyIncome,
    businessIncome,
    capitalGainsNormal,
    capitalGainsSpecial,
    stcg111ATax,
    ltcg112ATax,
    ltcg112Tax: ltcg112TaxAmt,
    otherIncome: totalOther,
    grossTotalIncome,
    totalDeductions,
    totalTaxableIncome,
    normalIncome,
    taxOnNormalIncome: taxOnNormal,
    taxOnSpecialIncome: taxOnSpecial,
    rebate87A,
    totalTaxBeforeSurcharge: taxAfterRebate,
    surcharge,
    marginalRelief,
    cess,
    totalTaxLiability,
    taxPaid,
    netPayable: totalTaxLiability - taxPaid,
    warnings,
  };
}
