import { TaxInputs, TaxResult } from '@/lib/tax-types';
import { formatINR } from '@/lib/formatters';
import { exportPdf } from '@/lib/pdf-export';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Download, Share2, Printer, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  inputs: TaxInputs;
  oldResult: TaxResult;
  newResult: TaxResult;
}

function Row({ label, old, new: nw, highlight, recommendedRegime }: { label: string; old: number; new: number; highlight?: boolean; recommendedRegime: 'Old' | 'New' }) {
  const isOldRec = recommendedRegime === 'Old';
  return (
    <div className={`grid grid-cols-3 gap-2 py-1.5 px-2 rounded text-sm ${highlight ? 'font-semibold' : ''}`}>
      <span className="text-muted-foreground text-xs sm:text-sm">{label}</span>
      <span className={`text-right ${isOldRec ? 'bg-green-100/60 dark:bg-green-900/30 rounded px-1' : ''}`}>{formatINR(old)}</span>
      <span className={`text-right ${!isOldRec ? 'bg-green-100/60 dark:bg-green-900/30 rounded px-1' : ''}`}>{formatINR(nw)}</span>
    </div>
  );
}

export function ResultsComparison({ inputs, oldResult, newResult }: Props) {
  const { toast } = useToast();
  const recommended: 'Old' | 'New' = newResult.totalTaxLiability <= oldResult.totalTaxLiability ? 'New' : 'Old';

  const allWarnings = [...new Set([...oldResult.warnings, ...newResult.warnings])];

  const handleExportCSV = () => {
    const rows = [
      ['Particulars', 'Old Regime', 'New Regime'],
      ['Gross Total Income', oldResult.grossTotalIncome, newResult.grossTotalIncome],
      ['Total Deductions', oldResult.totalDeductions, newResult.totalDeductions],
      ['Taxable Income', oldResult.totalTaxableIncome, newResult.totalTaxableIncome],
      ['Tax on Normal Income', oldResult.taxOnNormalIncome, newResult.taxOnNormalIncome],
      ['Tax on Capital Gains', oldResult.taxOnSpecialIncome, newResult.taxOnSpecialIncome],
      ['Rebate 87A', oldResult.rebate87A, newResult.rebate87A],
      ['Surcharge', oldResult.surcharge, newResult.surcharge],
      ['Cess', oldResult.cess, newResult.cess],
      ['Total Tax', oldResult.totalTaxLiability, newResult.totalTaxLiability],
      ['Tax Paid', oldResult.taxPaid, newResult.taxPaid],
      ['Total Amount Payable', oldResult.totalAmountPayable, newResult.totalAmountPayable],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tax-comparison-fy2025-26.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Excel/CSV downloaded!' });
  };

  const handleShare = () => {
    try {
      const encoded = btoa(JSON.stringify(inputs));
      const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
      navigator.clipboard.writeText(url);
      toast({ title: 'Shareable link copied to clipboard!' });
    } catch {
      toast({ title: 'Could not generate link', variant: 'destructive' });
    }
  };

  const handlePrint = () => window.print();

  const handlePdf = () => {
    const success = exportPdf({
      clientName: inputs.clientName,
      inputs,
      oldResult,
      newResult,
    });
    if (success) {
      toast({ title: 'PDF opened in new tab. Use Print → Save as PDF.' });
    } else {
      toast({ title: 'Pop-up blocked. Please allow pop-ups.', variant: 'destructive' });
    }
  };

  const isOldRec = recommended === 'Old';

  // Glow style for recommended column header
  const glowStyle = 'text-green-700 dark:text-green-400 font-bold';
  const glowBg = 'bg-green-100 dark:bg-green-900/40 shadow-[0_0_12px_2px_rgba(34,197,94,0.3)] dark:shadow-[0_0_12px_2px_rgba(74,222,128,0.25)]';

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold font-display">Tax Comparison</h3>
          </div>
          <div className="flex gap-2 no-print flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePdf} className="text-xs h-8">
              <FileText className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs h-8">
              <Download className="h-3.5 w-3.5 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs h-8">
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="text-xs h-8">
              <Share2 className="h-3.5 w-3.5 mr-1" /> Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 px-2 rounded mb-2">
          <span className="text-xs font-medium text-muted-foreground">Particulars</span>
          <span className={`text-xs font-medium text-right py-1 px-2 rounded-md transition-all ${isOldRec ? `${glowStyle} ${glowBg}` : 'text-muted-foreground'}`}>
            Old Regime {isOldRec ? '✓' : ''}
          </span>
          <span className={`text-xs font-medium text-right py-1 px-2 rounded-md transition-all ${!isOldRec ? `${glowStyle} ${glowBg}` : 'text-muted-foreground'}`}>
            New Regime {!isOldRec ? '✓' : ''}
          </span>
        </div>

        <div className="space-y-0.5">
          <Row label="Gross Total Income" old={oldResult.grossTotalIncome} new={newResult.grossTotalIncome} recommendedRegime={recommended} />
          <Row label="Total Deductions" old={oldResult.totalDeductions} new={newResult.totalDeductions} recommendedRegime={recommended} />
          <Separator className="my-1 bg-border/50" />
          <Row label="Taxable Income" old={oldResult.totalTaxableIncome} new={newResult.totalTaxableIncome} highlight recommendedRegime={recommended} />
          <Row label="Tax on Salary & Other Income" old={oldResult.taxOnNormalIncome} new={newResult.taxOnNormalIncome} recommendedRegime={recommended} />
          <Row label="Tax on Capital Gains" old={oldResult.taxOnSpecialIncome} new={newResult.taxOnSpecialIncome} recommendedRegime={recommended} />
          <Row label="Less: Rebate u/s 87A" old={oldResult.rebate87A} new={newResult.rebate87A} recommendedRegime={recommended} />
          <Separator className="my-1 bg-border/50" />
          <Row label="Tax After Rebate" old={oldResult.totalTaxBeforeSurcharge} new={newResult.totalTaxBeforeSurcharge} recommendedRegime={recommended} />
          <Row label="Surcharge" old={oldResult.surcharge} new={newResult.surcharge} recommendedRegime={recommended} />
          {(oldResult.marginalRelief > 0 || newResult.marginalRelief > 0) && (
            <Row label="Marginal Relief" old={oldResult.marginalRelief} new={newResult.marginalRelief} recommendedRegime={recommended} />
          )}
          <Row label="Health & Education Cess (4%)" old={oldResult.cess} new={newResult.cess} recommendedRegime={recommended} />
          <Separator className="my-1 bg-border/50" />
          <Row label="TOTAL TAX LIABILITY" old={oldResult.totalTaxLiability} new={newResult.totalTaxLiability} highlight recommendedRegime={recommended} />

          <Row label="Less: Tax Already Paid" old={oldResult.taxPaid} new={newResult.taxPaid} recommendedRegime={recommended} />
          <Separator className="my-1 bg-border/50" />
          <Row
            label={oldResult.totalAmountPayable >= 0 ? "TOTAL AMOUNT PAYABLE" : "REFUND DUE"}
            old={oldResult.totalAmountPayable}
            new={newResult.totalAmountPayable}
            highlight
            recommendedRegime={recommended}
          />
        </div>

        <div className={`mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
          isOldRec 
            ? 'bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 shadow-[0_0_20px_4px_rgba(34,197,94,0.25)] dark:shadow-[0_0_20px_4px_rgba(74,222,128,0.2)]'
            : 'bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 shadow-[0_0_20px_4px_rgba(34,197,94,0.25)] dark:shadow-[0_0_20px_4px_rgba(74,222,128,0.2)]'
        }`}>
          <span className="text-sm font-bold text-green-800 dark:text-green-300">
            ✨ Recommended Regime: {recommended} Regime — You save {formatINR(Math.abs(oldResult.totalTaxLiability - newResult.totalTaxLiability))}
          </span>
        </div>

        {allWarnings.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {allWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
