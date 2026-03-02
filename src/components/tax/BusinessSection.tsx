import { TaxInputs } from '@/lib/tax-types';
import { BusinessInputs, BusinessTaxationType } from '@/lib/business-types';
import { computeBusinessIncome } from '@/lib/business-engine';
import { CurrencyInput } from './CurrencyInput';
import { HelpTooltip } from './HelpTooltip';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatINR } from '@/lib/formatters';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string) => void;
  updateBusinessInputs: (biz: BusinessInputs) => void;
}

const TAXATION_OPTIONS: { value: BusinessTaxationType; label: string; tooltip: string }[] = [
  { value: 'regular', label: 'Regular Business', tooltip: 'Normal computation under Sections 28–37 with books of accounts' },
  { value: 'presumptive44AD', label: 'Presumptive Income (44AD)', tooltip: 'Presumptive taxation under Section 44AD for businesses with turnover up to statutory limit' },
  { value: 'presumptive44ADA', label: 'Presumptive Income (44ADA)', tooltip: 'Presumptive taxation under Section 44ADA for professionals with receipts up to ₹75 Lakh' },
  { value: 'presumptive44AE', label: 'Presumptive Income (44AE)', tooltip: 'Presumptive taxation under Section 44AE for goods carriage operators' },
];

export function BusinessSection({ inputs, update, updateBusinessInputs }: Props) {
  const biz = inputs.businessInputs;

  const updateBiz = (field: keyof BusinessInputs, value: number | string) => {
    updateBusinessInputs({ ...biz, [field]: value });
  };

  const result = useMemo(() => computeBusinessIncome(biz), [biz]);

  return (
    <div className="space-y-5">
      {/* Taxation Type Selection */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Label className="text-sm font-medium">How do you want to compute your business income?</Label>
          <HelpTooltip text="Choose based on your business type and turnover. Simplified options compute income at a deemed percentage – no separate expense claims needed." />
        </div>
        <RadioGroup
          value={biz.taxationType}
          onValueChange={(v) => updateBiz('taxationType', v)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {TAXATION_OPTIONS.map(opt => (
            <div key={opt.value} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <RadioGroupItem value={opt.value} id={`biz-${opt.value}`} />
              <div className="flex items-center gap-1">
                <Label htmlFor={`biz-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</Label>
                <HelpTooltip text={opt.tooltip} />
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Regular Business Fields */}
      {biz.taxationType === 'regular' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput label="Net Profit (as per books)" value={biz.netProfit}
            onChange={(v) => updateBiz('netProfit', v)}
            tooltip="Net profit from business or profession as per your books of accounts (Section 29)" />
          <CurrencyInput label="Additions (Disallowances)" value={biz.additions}
            onChange={(v) => updateBiz('additions', v)}
            tooltip="Disallowances under Sections 40, 40A, 43B – expenses not allowed as deduction" />
          <CurrencyInput label="Deductions (Allowable Expenses)" value={biz.deductions}
            onChange={(v) => updateBiz('deductions', v)}
            tooltip="Allowable expenses not debited to P&L but permitted under Sections 30–37" />
          <CurrencyInput label="Brought Forward Business Loss" value={biz.bfBusinessLoss}
            onChange={(v) => updateBiz('bfBusinessLoss', v)}
            tooltip="Business losses from previous years (Section 72). Can be carried forward for up to 8 years." />
        </div>
      )}

      {/* Presumptive 44AD */}
      {biz.taxationType === 'presumptive44AD' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput label="Digital / Bank Receipts" value={biz.turnoverDigital}
              onChange={(v) => updateBiz('turnoverDigital', v)}
              tooltip="Turnover received through digital means (UPI, bank transfer, cards). Taxed at 6% under Section 44AD." />
            <CurrencyInput label="Cash Receipts" value={biz.turnoverCash}
              onChange={(v) => updateBiz('turnoverCash', v)}
              tooltip="Turnover received in cash. Taxed at 8% under Section 44AD." />
            <CurrencyInput label="Declare Higher Income (optional)" value={biz.declaredIncome44AD}
              onChange={(v) => updateBiz('declaredIncome44AD', v)}
              tooltip="You can declare income higher than the deemed amount. Leave 0 to use the statutory minimum." />
            <CurrencyInput label="Brought Forward Business Loss" value={biz.bfBusinessLoss}
              onChange={(v) => updateBiz('bfBusinessLoss', v)}
              tooltip="Business losses from previous years available for set-off" />
          </div>
          {result.deemedIncome > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Deemed Income: {formatINR(result.deemedIncome)} (6% of digital + 8% of cash receipts)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Presumptive 44ADA */}
      {biz.taxationType === 'presumptive44ADA' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput label="Gross Professional Receipts" value={biz.grossReceipts}
              onChange={(v) => updateBiz('grossReceipts', v)}
              tooltip="Total gross receipts from profession. Income deemed at 50% under Section 44ADA. Limit: ₹75 Lakh." />
            <CurrencyInput label="Declare Higher Income (optional)" value={biz.declaredIncome44ADA}
              onChange={(v) => updateBiz('declaredIncome44ADA', v)}
              tooltip="Declare income higher than 50% of receipts if applicable. Leave 0 for minimum." />
            <CurrencyInput label="Brought Forward Business Loss" value={biz.bfBusinessLoss}
              onChange={(v) => updateBiz('bfBusinessLoss', v)}
              tooltip="Business losses from previous years available for set-off" />
          </div>
          {result.deemedIncome > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Deemed Income: {formatINR(result.deemedIncome)} (50% of gross receipts)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Presumptive 44AE */}
      {biz.taxationType === 'presumptive44AE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm text-foreground/80">Heavy Goods Vehicles</Label>
                <HelpTooltip text="Number of heavy goods vehicles owned. Section 44AE: ₹7,500/vehicle/month." />
              </div>
              <input type="number" min={0} value={biz.heavyVehicles || ''} placeholder="0"
                onChange={(e) => updateBiz('heavyVehicles', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-9 rounded-md border border-border/50 bg-muted/50 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm text-foreground/80">Other Vehicles</Label>
                <HelpTooltip text="Number of other (non-heavy) vehicles. ₹7,500/vehicle/month." />
              </div>
              <input type="number" min={0} value={biz.otherVehicles || ''} placeholder="0"
                onChange={(e) => updateBiz('otherVehicles', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-9 rounded-md border border-border/50 bg-muted/50 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm text-foreground/80">Months Operated</Label>
                <HelpTooltip text="Number of months the vehicles were in operation during the year" />
              </div>
              <input type="number" min={1} max={12} value={biz.monthsOperated || ''} placeholder="12"
                onChange={(e) => updateBiz('monthsOperated', Math.min(12, Math.max(1, parseInt(e.target.value) || 12)))}
                className="w-full h-9 rounded-md border border-border/50 bg-muted/50 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <CurrencyInput label="Declare Higher Income (optional)" value={biz.declaredIncome44AE}
              onChange={(v) => updateBiz('declaredIncome44AE', v)}
              tooltip="Declare income higher than statutory per-vehicle amount if applicable." />
          </div>
          {result.deemedIncome > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Deemed Income: {formatINR(result.deemedIncome)} (₹7,500 × vehicles × months)
              </span>
            </div>
          )}
        </div>
      )}

      {/* PGBP Summary */}
      {result.taxableBusinessIncome > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{result.taxationLabel}</span>
            <span className="font-semibold">{formatINR(result.declaredIncome || result.grossIncome)}</span>
          </div>
          {result.bfLossSetOff > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Less: Loss Set-off</span>
              <span className="text-destructive">-{formatINR(result.bfLossSetOff)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold border-t border-primary/10 pt-1 mt-1">
            <span>Taxable Business Income</span>
            <span className="text-primary">{formatINR(result.taxableBusinessIncome)}</span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
