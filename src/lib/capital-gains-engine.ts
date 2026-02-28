import {
  CapitalGainTransaction, ComputedTransaction, CapitalGainsAggregated,
  CII, HOLDING_THRESHOLDS, GRANDFATHERING_DATE,
} from './capital-gains-types';

export function getFinancialYear(dateStr: string): number {
  const d = new Date(dateStr);
  const month = d.getMonth(); // 0-indexed, April = 3
  const year = d.getFullYear();
  return month >= 3 ? year : year - 1;
}

export function getHoldingMonths(acqDate: string, transferDate: string): number {
  const d1 = new Date(acqDate);
  const d2 = new Date(transferDate);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

function getCII(fy: number): number {
  return CII[fy] || 100;
}

function setOff(gain: number, loss: number): [number, number] {
  const offset = Math.min(gain, loss);
  return [gain - offset, loss - offset];
}

export function computeTransaction(txn: CapitalGainTransaction): ComputedTransaction {
  const holdingMonths = getHoldingMonths(txn.dateOfAcquisition, txn.dateOfTransfer);
  const threshold = HOLDING_THRESHOLDS[txn.assetType];

  // Debt MF acquired after 1 Apr 2023: always short-term at slab rates
  const isDebtPostApr23 = txn.assetType === 'debtMF' && txn.dateOfAcquisition >= '2023-04-01';
  const isLongTerm = isDebtPostApr23 ? false : holdingMonths >= threshold;

  const netConsideration = txn.saleConsideration - txn.transferExpenses;

  let indexedCostOfAcquisition = txn.costOfAcquisition;
  let indexedCostOfImprovement = txn.costOfImprovement;
  let isGrandfathered = false;
  let grandfatheredOption: 'indexed' | 'nonIndexed' | undefined;

  // Grandfathered immovable property: acquired before 23 July 2024
  // Taxpayer can choose: 20% with indexation OR 12.5% without – whichever gives lower tax
  if (isLongTerm && txn.assetType === 'immovableProperty' && txn.dateOfAcquisition < GRANDFATHERING_DATE) {
    isGrandfathered = true;
    const fyAcq = getFinancialYear(txn.dateOfAcquisition);
    const ciiAcq = getCII(fyAcq);
    const ciiCap = 363; // CII capped at FY 2024-25

    const idxCost = Math.round(txn.costOfAcquisition * ciiCap / ciiAcq);
    const idxImprove = Math.round(txn.costOfImprovement * ciiCap / ciiAcq);

    const gainIdx = netConsideration - idxCost - idxImprove;
    const gainNoIdx = netConsideration - txn.costOfAcquisition - txn.costOfImprovement;

    const taxIdx = Math.max(0, gainIdx) * 0.20;
    const taxNoIdx = Math.max(0, gainNoIdx) * 0.125;

    if (taxIdx < taxNoIdx) {
      grandfatheredOption = 'indexed';
      indexedCostOfAcquisition = idxCost;
      indexedCostOfImprovement = idxImprove;
    } else {
      grandfatheredOption = 'nonIndexed';
    }
  }

  const grossGain = netConsideration - indexedCostOfAcquisition - indexedCostOfImprovement;

  // Exemption only for LTCG with positive gain
  let exemption = 0;
  if (isLongTerm && txn.exemptionType !== 'none' && grossGain > 0) {
    let maxExemption = grossGain;
    if (txn.exemptionType === '54EC') maxExemption = Math.min(maxExemption, 5000000);
    exemption = Math.min(txn.exemptionAmount, maxExemption);
  }

  const taxableGain = grossGain - exemption;

  // Tax classification per the Act
  let taxSection: '111A' | '112A' | '112' | 'slab';
  let taxRate: number;
  let taxRateLabel: string;

  if (!isLongTerm) {
    if (txn.assetType === 'listedEquity' || txn.assetType === 'equityMF') {
      taxSection = '111A'; taxRate = 0.20;
      taxRateLabel = 'Short-Term Gain on Equity @ 20%';
    } else {
      taxSection = 'slab'; taxRate = -1;
      taxRateLabel = 'Short-Term Gain @ Slab Rate';
    }
  } else {
    if (txn.assetType === 'listedEquity' || txn.assetType === 'equityMF') {
      taxSection = '112A'; taxRate = 0.125;
      taxRateLabel = 'Long-Term Gain on Equity @ 12.5%';
    } else if (isGrandfathered && grandfatheredOption === 'indexed') {
      taxSection = '112'; taxRate = 0.20;
      taxRateLabel = 'Long-Term Gain @ 20% with Indexation';
    } else {
      taxSection = '112'; taxRate = 0.125;
      taxRateLabel = 'Long-Term Gain @ 12.5%';
    }
  }

  return {
    transaction: txn, holdingMonths, isLongTerm, netConsideration,
    indexedCostOfAcquisition, indexedCostOfImprovement, grossGain,
    exemption, taxableGain, taxSection, taxRate, taxRateLabel,
    isGrandfathered, grandfatheredOption,
  };
}

/**
 * Aggregates all capital gain transactions, applies loss set-off rules,
 * ₹1.25L exemption on 112A, and computes taxes.
 */
export function computeAggregatedCapitalGains(
  transactions: CapitalGainTransaction[],
  bfSTCL: number,
  bfLTCL: number,
): CapitalGainsAggregated {
  const computed = transactions.map(computeTransaction);

  let stcg111A = 0, stcgSlab = 0, ltcg112AGross = 0;
  let ltcg112 = 0, ltcg112Indexed = 0;
  let stcLoss = 0, ltcLoss = 0;
  let totalExemptions = 0;

  for (const c of computed) {
    totalExemptions += c.exemption;
    if (c.taxableGain >= 0) {
      switch (c.taxSection) {
        case '111A': stcg111A += c.taxableGain; break;
        case 'slab': stcgSlab += c.taxableGain; break;
        case '112A': ltcg112AGross += c.taxableGain; break;
        case '112':
          if (c.isGrandfathered && c.grandfatheredOption === 'indexed') {
            ltcg112Indexed += c.taxableGain;
          } else {
            ltcg112 += c.taxableGain;
          }
          break;
      }
    } else {
      if (c.isLongTerm) ltcLoss += Math.abs(c.taxableGain);
      else stcLoss += Math.abs(c.taxableGain);
    }
  }

  // ₹1,25,000 exemption on LTCG u/s 112A
  let ltcg112ANet = Math.max(0, ltcg112AGross - 125000);

  // Current-year STCL: set off against any CG (slab first, then special)
  let rSTCL = stcLoss;
  [stcgSlab, rSTCL] = setOff(stcgSlab, rSTCL);
  [stcg111A, rSTCL] = setOff(stcg111A, rSTCL);
  [ltcg112, rSTCL] = setOff(ltcg112, rSTCL);
  [ltcg112Indexed, rSTCL] = setOff(ltcg112Indexed, rSTCL);
  [ltcg112ANet, rSTCL] = setOff(ltcg112ANet, rSTCL);

  // Current-year LTCL: only against LTCG
  let rLTCL = ltcLoss;
  [ltcg112, rLTCL] = setOff(ltcg112, rLTCL);
  [ltcg112Indexed, rLTCL] = setOff(ltcg112Indexed, rLTCL);
  [ltcg112ANet, rLTCL] = setOff(ltcg112ANet, rLTCL);

  // B/F STCL: against any CG
  let bfST = bfSTCL;
  [stcgSlab, bfST] = setOff(stcgSlab, bfST);
  [stcg111A, bfST] = setOff(stcg111A, bfST);
  [ltcg112, bfST] = setOff(ltcg112, bfST);
  [ltcg112Indexed, bfST] = setOff(ltcg112Indexed, bfST);
  [ltcg112ANet, bfST] = setOff(ltcg112ANet, bfST);

  // B/F LTCL: only against LTCG
  let bfLT = bfLTCL;
  [ltcg112, bfLT] = setOff(ltcg112, bfLT);
  [ltcg112Indexed, bfLT] = setOff(ltcg112Indexed, bfLT);
  [ltcg112ANet, bfLT] = setOff(ltcg112ANet, bfLT);

  // Tax computation
  const stcg111ATax = stcg111A * 0.20;
  const ltcg112ATax = ltcg112ANet * 0.125;
  const ltcg112Tax = ltcg112 * 0.125 + ltcg112Indexed * 0.20;

  const capitalGainsSpecial = stcg111A + ltcg112ANet + ltcg112 + ltcg112Indexed;
  const capitalGainsNormal = stcgSlab;

  return {
    stcg111A, stcgSlab,
    ltcg112AGross, ltcg112ANet,
    ltcg112, ltcg112Indexed,
    stcg111ATax, ltcg112ATax, ltcg112Tax,
    totalExemptions,
    capitalGainsSpecial, capitalGainsNormal,
    computed,
  };
}
