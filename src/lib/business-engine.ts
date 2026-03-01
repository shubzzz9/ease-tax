import {
  BusinessInputs, BusinessResult,
  LIMITS_44AD, LIMITS_44ADA, LIMITS_44AE,
} from './business-types';

/**
 * Computes Profit & Gains of Business or Profession
 * as per Sections 28-44AE of the Income-tax Act, 1961
 * applicable for AY 2026-27.
 */
export function computeBusinessIncome(inputs: BusinessInputs): BusinessResult {
  switch (inputs.taxationType) {
    case 'presumptive44AD': return compute44AD(inputs);
    case 'presumptive44ADA': return compute44ADA(inputs);
    case 'presumptive44AE': return compute44AE(inputs);
    default: return computeRegular(inputs);
  }
}

function computeRegular(inputs: BusinessInputs): BusinessResult {
  const warnings: string[] = [];

  // Section 29: Income = Book Profit + Disallowances - Allowable deductions
  const grossIncome = inputs.netProfit + inputs.additions - inputs.deductions;

  // Section 72: Set-off of brought forward business loss (max 8 years)
  const bfLossSetOff = Math.min(Math.max(0, grossIncome), inputs.bfBusinessLoss);
  const taxableBusinessIncome = Math.max(0, grossIncome - bfLossSetOff);

  if (inputs.bfBusinessLoss > bfLossSetOff && bfLossSetOff > 0) {
    warnings.push('Brought forward business loss partially set off. Remaining can be carried forward (up to 8 years).');
  }

  if (grossIncome < 0) {
    warnings.push('Business loss can be set off against other income (except salary) and carried forward for 8 years.');
  }

  return {
    taxationType: 'regular',
    taxationLabel: 'Regular Business Income',
    grossIncome: Math.max(0, grossIncome),
    deemedIncome: 0,
    declaredIncome: 0,
    additions: inputs.additions,
    deductionsAllowed: inputs.deductions,
    bfLossSetOff,
    taxableBusinessIncome,
    warnings,
  };
}

function compute44AD(inputs: BusinessInputs): BusinessResult {
  const warnings: string[] = [];
  const totalTurnover = inputs.turnoverDigital + inputs.turnoverCash;

  // Validate turnover limits
  const digitalPercent = totalTurnover > 0 ? inputs.turnoverDigital / totalTurnover : 0;
  const limit = digitalPercent >= 0.95 ? LIMITS_44AD.turnoverLimit : LIMITS_44AD.turnoverLimitCash;

  if (totalTurnover > limit) {
    warnings.push(`Turnover exceeds ₹${(limit / 10000000).toFixed(0)} Cr limit for presumptive taxation. Consider using regular computation.`);
  }

  // Deemed income: 6% digital + 8% cash
  const deemedIncome = Math.round(
    inputs.turnoverDigital * LIMITS_44AD.rateDigital +
    inputs.turnoverCash * LIMITS_44AD.rateCash
  );

  // User can declare higher income
  const declaredIncome = Math.max(deemedIncome, inputs.declaredIncome44AD || 0);
  const effectiveIncome = inputs.declaredIncome44AD > deemedIncome ? inputs.declaredIncome44AD : deemedIncome;

  // B/F loss set-off allowed even under presumptive
  const bfLossSetOff = Math.min(effectiveIncome, inputs.bfBusinessLoss);
  const taxableBusinessIncome = Math.max(0, effectiveIncome - bfLossSetOff);

  if (inputs.declaredIncome44AD > 0 && inputs.declaredIncome44AD < deemedIncome) {
    warnings.push('Declared income cannot be less than deemed income under presumptive taxation.');
  }

  // No deduction u/s 30-38 allowed
  warnings.push('Under presumptive taxation, no separate expense deductions (Sections 30–38) are allowed. Depreciation is deemed to have been allowed.');

  return {
    taxationType: 'presumptive44AD',
    taxationLabel: 'Presumptive Business Income (Small Business)',
    grossIncome: totalTurnover,
    deemedIncome,
    declaredIncome: effectiveIncome,
    additions: 0,
    deductionsAllowed: 0,
    bfLossSetOff,
    taxableBusinessIncome,
    warnings,
  };
}

function compute44ADA(inputs: BusinessInputs): BusinessResult {
  const warnings: string[] = [];

  if (inputs.grossReceipts > LIMITS_44ADA.grossReceiptsLimit) {
    warnings.push(`Gross receipts exceed ₹${(LIMITS_44ADA.grossReceiptsLimit / 100000).toFixed(0)} Lakh limit for professionals.`);
  }

  // 50% deemed income
  const deemedIncome = Math.round(inputs.grossReceipts * LIMITS_44ADA.deemedRate);
  const effectiveIncome = Math.max(deemedIncome, inputs.declaredIncome44ADA || 0);

  if (inputs.declaredIncome44ADA > 0 && inputs.declaredIncome44ADA < deemedIncome) {
    warnings.push('Declared income cannot be less than 50% of gross receipts.');
  }

  const bfLossSetOff = Math.min(effectiveIncome, inputs.bfBusinessLoss);
  const taxableBusinessIncome = Math.max(0, effectiveIncome - bfLossSetOff);

  warnings.push('Under presumptive taxation for professionals, no separate expense deductions are allowed.');

  return {
    taxationType: 'presumptive44ADA',
    taxationLabel: 'Presumptive Professional Income',
    grossIncome: inputs.grossReceipts,
    deemedIncome,
    declaredIncome: effectiveIncome,
    additions: 0,
    deductionsAllowed: 0,
    bfLossSetOff,
    taxableBusinessIncome,
    warnings,
  };
}

function compute44AE(inputs: BusinessInputs): BusinessResult {
  const warnings: string[] = [];
  const months = Math.min(12, Math.max(1, inputs.monthsOperated));

  const deemedIncome =
    inputs.heavyVehicles * LIMITS_44AE.perHeavyVehiclePerMonth * months +
    inputs.otherVehicles * LIMITS_44AE.perOtherVehiclePerMonth * months;

  const effectiveIncome = Math.max(deemedIncome, inputs.declaredIncome44AE || 0);

  if (inputs.declaredIncome44AE > 0 && inputs.declaredIncome44AE < deemedIncome) {
    warnings.push('Declared income cannot be less than statutory presumptive income per vehicle.');
  }

  const bfLossSetOff = Math.min(effectiveIncome, inputs.bfBusinessLoss);
  const taxableBusinessIncome = Math.max(0, effectiveIncome - bfLossSetOff);

  return {
    taxationType: 'presumptive44AE',
    taxationLabel: 'Presumptive Goods Transport Income',
    grossIncome: deemedIncome,
    deemedIncome,
    declaredIncome: effectiveIncome,
    additions: 0,
    deductionsAllowed: 0,
    bfLossSetOff,
    taxableBusinessIncome,
    warnings,
  };
}
