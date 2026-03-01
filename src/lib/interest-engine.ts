/**
 * Interest Engine – Sections 234A, 234B, 234C
 * As per Income-tax Act, 1961 applicable for AY 2026-27
 * All amounts rounded to nearest ₹10 as per Section 288B
 */

export interface AdvanceTaxInstallment {
  date: string;   // YYYY-MM-DD
  amount: number;
}

export interface InterestInputs {
  totalTaxLiability: number;  // After cess
  tds: number;
  advanceTaxTotal: number;
  selfAssessmentTax: number;
  advanceTaxInstallments: AdvanceTaxInstallment[];  // Date-wise breakup
  returnFilingDate: string;    // YYYY-MM-DD
  dueDate: string;             // YYYY-MM-DD
  isPresumptive: boolean;      // 44AD/44ADA – single installment by 15 March
  useAdvancedMode: boolean;
}

export interface InterestResult {
  interest234A: number;
  interest234B: number;
  interest234C: number;
  totalInterest: number;
  months234A: number;
  shortfall234B: number;
  details234C: Installment234CDetail[];
  totalAmountPayable: number;
}

export interface Installment234CDetail {
  dueDate: string;
  cumulativePercent: number;
  requiredAmount: number;
  paidAmount: number;
  shortfall: number;
  months: number;
  interest: number;
}

function roundTo10(n: number): number {
  return Math.round(n / 10) * 10;
}

function monthDiff(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  // Part of month counts as full month
  if (d2.getDate() > d1.getDate()) months += 1;
  return Math.max(0, months);
}

function paidByDate(installments: AdvanceTaxInstallment[], cutoffDate: string): number {
  return installments
    .filter(i => i.date <= cutoffDate)
    .reduce((sum, i) => sum + i.amount, 0);
}

/**
 * Section 234A – Interest for delay in filing return
 * 1% per month or part thereof on unpaid tax
 */
function compute234A(inputs: InterestInputs): { interest: number; months: number } {
  if (!inputs.returnFilingDate || !inputs.dueDate) return { interest: 0, months: 0 };
  if (inputs.returnFilingDate <= inputs.dueDate) return { interest: 0, months: 0 };

  const assessedTax = inputs.totalTaxLiability - inputs.tds - inputs.advanceTaxTotal;
  if (assessedTax <= 0) return { interest: 0, months: 0 };

  const months = monthDiff(inputs.dueDate, inputs.returnFilingDate);
  if (months <= 0) return { interest: 0, months: 0 };

  const interest = roundTo10(Math.round(assessedTax * 0.01 * months));
  return { interest, months };
}

/**
 * Section 234B – Default in advance tax
 * If advance tax paid < 90% of assessed tax
 * Interest @ 1% per month from 1 April of AY to date of payment
 */
function compute234B(inputs: InterestInputs): { interest: number; shortfall: number } {
  const assessedTax = inputs.totalTaxLiability - inputs.tds;
  if (assessedTax <= 0) return { interest: 0, shortfall: 0 };

  const threshold = assessedTax * 0.90;
  if (inputs.advanceTaxTotal >= threshold) return { interest: 0, shortfall: 0 };

  const shortfall = assessedTax - inputs.advanceTaxTotal;
  // From 1 April 2026 to filing date or assessment
  const toDate = inputs.returnFilingDate || '2026-07-31';
  const months = monthDiff('2026-04-01', toDate);

  const interest = roundTo10(Math.round(shortfall * 0.01 * months));
  return { interest, shortfall };
}

/**
 * Section 234C – Deferment of advance tax installments
 * Non-presumptive: 4 installments (15%, 45%, 75%, 100%)
 * Presumptive (44AD/44ADA): single installment 100% by 15 March
 */
function compute234C(inputs: InterestInputs): Installment234CDetail[] {
  const assessedTax = inputs.totalTaxLiability - inputs.tds;
  if (assessedTax <= 10000) return []; // No advance tax if < ₹10,000

  if (inputs.isPresumptive) {
    // Single installment by 15 March
    const required = assessedTax;
    const paid = inputs.useAdvancedMode
      ? paidByDate(inputs.advanceTaxInstallments, '2026-03-15')
      : inputs.advanceTaxTotal;
    const shortfall = Math.max(0, required - paid);
    const interest = shortfall > 0 ? roundTo10(Math.round(shortfall * 0.01 * 1)) : 0;

    return [{
      dueDate: '2026-03-15',
      cumulativePercent: 100,
      requiredAmount: required,
      paidAmount: paid,
      shortfall,
      months: 1,
      interest,
    }];
  }

  // Non-presumptive: 4 installments
  const schedule: Array<{ date: string; percent: number; interestMonths: number }> = [
    { date: '2025-06-15', percent: 15, interestMonths: 3 },
    { date: '2025-09-15', percent: 45, interestMonths: 3 },
    { date: '2025-12-15', percent: 75, interestMonths: 3 },
    { date: '2026-03-15', percent: 100, interestMonths: 1 },
  ];

  return schedule.map(s => {
    const required = Math.round(assessedTax * s.percent / 100);
    const paid = inputs.useAdvancedMode
      ? paidByDate(inputs.advanceTaxInstallments, s.date)
      : Math.round(inputs.advanceTaxTotal * s.percent / 100);  // Proportional in simple mode
    const shortfall = Math.max(0, required - paid);
    const interest = shortfall > 0 ? roundTo10(Math.round(shortfall * 0.01 * s.interestMonths)) : 0;

    return {
      dueDate: s.date,
      cumulativePercent: s.percent,
      requiredAmount: required,
      paidAmount: paid,
      shortfall,
      months: s.interestMonths,
      interest,
    };
  });
}

export function computeInterest(inputs: InterestInputs): InterestResult {
  const { interest: interest234A, months: months234A } = compute234A(inputs);
  const { interest: interest234B, shortfall: shortfall234B } = compute234B(inputs);
  const details234C = compute234C(inputs);
  const interest234C = details234C.reduce((sum, d) => sum + d.interest, 0);

  const totalInterest = interest234A + interest234B + interest234C;

  return {
    interest234A,
    interest234B,
    interest234C,
    totalInterest,
    months234A,
    shortfall234B,
    details234C,
    totalAmountPayable: inputs.totalTaxLiability + totalInterest - inputs.tds - inputs.advanceTaxTotal - inputs.selfAssessmentTax,
  };
}

export const DEFAULT_INTEREST_INPUTS: Partial<InterestInputs> = {
  advanceTaxInstallments: [],
  returnFilingDate: '',
  dueDate: '2026-07-31',
  useAdvancedMode: false,
};
