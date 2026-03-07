import { TaxInputs, TaxResult } from './tax-types';
import { formatINR } from './formatters';

interface PdfOptions {
  clientName: string;
  inputs: TaxInputs;
  oldResult: TaxResult;
  newResult: TaxResult;
}

function esc(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function row(label: string, oldVal: number, newVal: number, bold = false) {
  const cls = bold ? 'font-weight:bold;background:#f5f0e8;' : '';
  return `<tr style="${cls}">
    <td style="padding:6px 10px;border:1px solid #ddd;">${label}</td>
    <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatINR(oldVal)}</td>
    <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatINR(newVal)}</td>
  </tr>`;
}

function singleRow(label: string, value: string, bold = false) {
  const cls = bold ? 'font-weight:bold;background:#f5f0e8;' : '';
  return `<tr style="${cls}">
    <td style="padding:6px 10px;border:1px solid #ddd;">${label}</td>
    <td colspan="2" style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${value}</td>
  </tr>`;
}

export function generatePdfHtml(opts: PdfOptions): string {
  const { clientName, inputs, oldResult, newResult } = opts;
  const recommended = newResult.totalTaxLiability <= oldResult.totalTaxLiability ? 'New' : 'Old';
  const ay = 'AY 2026-27 (FY 2025-26)';
  const ageLabel = inputs.ageGroup === '80plus' ? 'Super Senior Citizen (80+)'
    : inputs.ageGroup === '60to79' ? 'Senior Citizen (60-79)' : 'Below 60';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Income Tax Computation - ${esc(clientName || 'Client')}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;margin:0;padding:20px 30px;font-size:11px;line-height:1.5;}
  h1{color:#0B3C5D;font-size:18px;margin:0;}
  h2{color:#0B3C5D;font-size:14px;border-bottom:2px solid #D4AF37;padding-bottom:4px;margin:20px 0 10px;}
  h3{color:#0B3C5D;font-size:12px;margin:15px 0 8px;}
  table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11px;}
  th{background:#0B3C5D;color:#fff;padding:8px 10px;text-align:left;border:1px solid #0B3C5D;}
  th:not(:first-child){text-align:right;}
  td{padding:6px 10px;border:1px solid #ddd;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #D4AF37;padding-bottom:15px;margin-bottom:15px;}
  .firm{color:#0B3C5D;}
  .gold{color:#D4AF37;}
  .recommend{background:#D4AF37;color:#fff;padding:8px 15px;text-align:center;font-weight:bold;border-radius:4px;margin:15px 0;font-size:13px;}
  .footer{margin-top:30px;padding-top:10px;border-top:1px solid #ddd;font-size:9px;color:#999;text-align:center;}
  .info-table td{border:none;padding:3px 10px;}
  .info-table td:first-child{font-weight:bold;color:#555;width:180px;}
  @media print{body{padding:15px 20px;}}
</style>
</head><body>

<div class="header">
  <div>
    <h1 class="firm">G S Mundada & Co.</h1>
    <div style="font-size:10px;color:#666;">Chartered Accountants</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:13px;font-weight:bold;color:#0B3C5D;">INCOME TAX COMPUTATION</div>
    <div style="font-size:11px;color:#D4AF37;font-weight:bold;">${ay}</div>
  </div>
</div>

<h2>Client Details</h2>
<table class="info-table">
  <tr><td>Name</td><td>${esc(clientName || '—')}</td></tr>
  <tr><td>Assessment Year</td><td>${ay}</td></tr>
  <tr><td>Age Category</td><td>${ageLabel}</td></tr>
  <tr><td>Employment Type</td><td>${inputs.employmentType === 'salaried' ? 'Salaried' : inputs.employmentType === 'business' ? 'Business / Professional' : 'Both'}</td></tr>
  <tr><td>Recommended Regime</td><td style="font-weight:bold;color:#D4AF37;">${recommended} Regime</td></tr>
</table>

<h2>Head-wise Income Computation</h2>
<table>
  <tr><th>Particulars</th><th>Old Regime (₹)</th><th>New Regime (₹)</th></tr>
  ${row('1. Gross Salary Income', oldResult.grossSalaryIncome, newResult.grossSalaryIncome)}
  ${row('   Less: HRA Exemption', oldResult.hraExemption, newResult.hraExemption)}
  ${row('   Less: Standard Deduction', oldResult.standardDeduction, newResult.standardDeduction)}
  ${row('   Net Salary Income', oldResult.netSalaryIncome, newResult.netSalaryIncome, true)}
  ${row('2. Income from House Property', oldResult.housePropertyIncome, newResult.housePropertyIncome)}
  ${row('3. Profit & Gains from Business', oldResult.businessIncome, newResult.businessIncome)}
  ${row('4. Capital Gains (Normal)', oldResult.capitalGainsNormal, newResult.capitalGainsNormal)}
  ${row('   Capital Gains (Special Rate)', oldResult.capitalGainsSpecial, newResult.capitalGainsSpecial)}
  ${row('5. Other Income', oldResult.otherIncome, newResult.otherIncome)}
  ${row('GROSS TOTAL INCOME', oldResult.grossTotalIncome, newResult.grossTotalIncome, true)}
</table>

<h2>Chapter VI-A Deductions</h2>
<table>
  <tr><th>Particulars</th><th>Old Regime (₹)</th><th>New Regime (₹)</th></tr>
  ${singleRow('Section 80C (PF, LIC, ELSS etc.)', formatINR(Math.min(inputs.sec80C, 150000)))}
  ${singleRow('Section 80D (Medical Insurance)', formatINR(inputs.sec80D))}
  ${singleRow('Section 80D (Preventive Health Check)', formatINR(Math.min(inputs.sec80DPreventive, 5000)))}
  ${singleRow('Section 80CCD(1B) (NPS)', formatINR(Math.min(inputs.sec80CCD1B, 50000)))}
  ${singleRow('Section 80E (Education Loan)', formatINR(inputs.sec80E))}
  ${singleRow('Section 80G (Donations)', formatINR(inputs.sec80G))}
  ${singleRow('Section 80TTA/80TTB', formatINR(inputs.sec80TTA))}
  ${singleRow('Section 80U (Disability)', formatINR(inputs.sec80U))}
  ${singleRow('Other Deductions', formatINR(inputs.otherDeductions))}
  ${row('TOTAL DEDUCTIONS', oldResult.totalDeductions, newResult.totalDeductions, true)}
</table>

<h2>Tax Computation (Slab-wise)</h2>
<table>
  <tr><th>Particulars</th><th>Old Regime (₹)</th><th>New Regime (₹)</th></tr>
  ${row('Total Taxable Income', oldResult.totalTaxableIncome, newResult.totalTaxableIncome, true)}
  ${row('Normal Income', oldResult.normalIncome, newResult.normalIncome)}
  ${row('Tax on Normal Income', oldResult.taxOnNormalIncome, newResult.taxOnNormalIncome)}
  ${row('Tax on Capital Gains (Special Rates)', oldResult.taxOnSpecialIncome, newResult.taxOnSpecialIncome)}
  ${oldResult.rebate87A > 0 || newResult.rebate87A > 0 ? row('Less: Rebate u/s 87A', oldResult.rebate87A, newResult.rebate87A) : ''}
  ${row('Tax After Rebate', oldResult.totalTaxBeforeSurcharge, newResult.totalTaxBeforeSurcharge)}
  ${oldResult.surcharge > 0 || newResult.surcharge > 0 ? row('Add: Surcharge', oldResult.surcharge, newResult.surcharge) : ''}
  ${oldResult.marginalRelief > 0 || newResult.marginalRelief > 0 ? row('Less: Marginal Relief', oldResult.marginalRelief, newResult.marginalRelief) : ''}
  ${row('Add: Health & Education Cess @ 4%', oldResult.cess, newResult.cess)}
  ${row('TOTAL TAX LIABILITY', oldResult.totalTaxLiability, newResult.totalTaxLiability, true)}
</table>




<h2>Tax Payable / Refund</h2>
<table>
  <tr><th>Particulars</th><th>Old Regime (₹)</th><th>New Regime (₹)</th></tr>
  ${row('Total Tax Liability', oldResult.totalTaxLiability, newResult.totalTaxLiability)}
  ${row('Less: TDS', inputs.tds, inputs.tds)}
  ${row('Less: Advance Tax', inputs.advanceTax, inputs.advanceTax)}
  ${row('Less: Self Assessment Tax', inputs.selfAssessmentTax, inputs.selfAssessmentTax)}
  ${row(oldResult.totalAmountPayable >= 0 ? 'NET TAX PAYABLE' : 'REFUND DUE', oldResult.totalAmountPayable, newResult.totalAmountPayable, true)}
</table>

<div class="recommend">
  ✨ RECOMMENDED REGIME: ${recommended.toUpperCase()} REGIME — Save ${formatINR(Math.abs(oldResult.totalTaxLiability - newResult.totalTaxLiability))}
</div>

${oldResult.warnings.length > 0 || newResult.warnings.length > 0 ? `
<h3>Important Notes</h3>
<ul style="font-size:10px;color:#555;">
  ${[...new Set([...oldResult.warnings, ...newResult.warnings])].map(w => `<li>${esc(w)}</li>`).join('')}
</ul>` : ''}

<div class="footer">
  <p>This computation is for estimation purposes only. Please consult your Chartered Accountant for final tax filing.</p>
  <p>© ${new Date().getFullYear()} G S Mundada & Co. — Chartered Accountants</p>
  <p style="margin-top:4px;">Made by Lovable – shubhamlunawat98@gmail.com</p>
</div>

</body></html>`;
}

export function exportPdf(opts: PdfOptions) {
  const html = generatePdfHtml(opts);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
  return true;
}
