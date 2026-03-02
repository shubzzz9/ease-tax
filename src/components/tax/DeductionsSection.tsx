import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';
import { HelpTooltip } from './HelpTooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PiggyBank, Info, AlertTriangle } from 'lucide-react';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string) => void;
}

export function DeductionsSection({ inputs, update }: Props) {
  // 80G validation warnings
  const warnings: string[] = [];

  // 80G cash donation > ₹2,000 check
  if (inputs.sec80GCashDonation > 2000) {
    warnings.push('Cash donations exceeding ₹2,000 are not eligible for deduction under Section 80G.');
  }

  // 80D preventive health checkup included in 80D limit
  if (inputs.sec80DPreventive > 5000) {
    warnings.push('Preventive health check-up deduction is capped at ₹5,000 (included within Section 80D limit).');
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Tax Saving Investments</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Chapter VI-A deductions — applicable under Old Regime only</p>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Most deductions are <strong>not allowed</strong> under New Regime. These values are used only for Old Regime comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput label="Section 80C (PF, LIC, ELSS etc.)" value={inputs.sec80C}
            onChange={(v) => update('sec80C', v)} max={150000}
            tooltip="Investments in PF, PPF, LIC, ELSS, tuition fees etc. Max ₹1,50,000" />

          <CurrencyInput label="Section 80D (Medical Insurance)" value={inputs.sec80D}
            onChange={(v) => update('sec80D', v)}
            tooltip="Health insurance premium. Up to ₹25,000 (₹50,000 for senior citizens) for self + family. Includes preventive health check-up." />

          <CurrencyInput label="80D – Preventive Health Check-up" value={inputs.sec80DPreventive}
            onChange={(v) => update('sec80DPreventive', v)} max={5000}
            tooltip="Preventive health check-up expenses. Max ₹5,000 (included within 80D limit, not additional)." />

          <CurrencyInput label="Section 80CCD(1B) (NPS Extra)" value={inputs.sec80CCD1B}
            onChange={(v) => update('sec80CCD1B', v)} max={50000}
            tooltip="Additional NPS contribution. Max ₹50,000 over and above 80C limit." />

          <CurrencyInput label="Section 80E (Education Loan Interest)" value={inputs.sec80E}
            onChange={(v) => update('sec80E', v)}
            tooltip="Interest on education loan. No upper limit. Available for 8 years." />

          {/* 80G Donations – Enhanced */}
          <div className="sm:col-span-2 space-y-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Section 80G – Donations</Label>
              <HelpTooltip text="Deduction for donations to approved funds/charities. Some qualify for 100% deduction, others 50%. Cash donations above ₹2,000 not allowed." />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label className="text-xs text-muted-foreground">Donation Category</Label>
                <HelpTooltip text="100% deduction: PM Relief Fund, National Defence Fund etc. 50% deduction: Other approved charitable institutions." />
              </div>
              <RadioGroup
                value={inputs.sec80GType}
                onValueChange={(v) => update('sec80GType', v)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                <div className="flex items-center gap-2 p-2 rounded border border-border/50">
                  <RadioGroupItem value="100" id="g100" />
                  <Label htmlFor="g100" className="text-xs cursor-pointer">100% Deduction (PM Relief, NDF etc.)</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded border border-border/50">
                  <RadioGroupItem value="50" id="g50" />
                  <Label htmlFor="g50" className="text-xs cursor-pointer">50% Deduction (Other approved charities)</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded border border-border/50">
                  <RadioGroupItem value="100_restricted" id="g100r" />
                  <Label htmlFor="g100r" className="text-xs cursor-pointer">100% Deduction (with 10% AGI limit)</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded border border-border/50">
                  <RadioGroupItem value="50_restricted" id="g50r" />
                  <Label htmlFor="g50r" className="text-xs cursor-pointer">50% Deduction (with 10% AGI limit)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CurrencyInput label="Donation Amount" value={inputs.sec80G}
                onChange={(v) => update('sec80G', v)}
                tooltip="Total eligible donation amount" />
              <CurrencyInput label="Of which Cash Donation" value={inputs.sec80GCashDonation}
                onChange={(v) => update('sec80GCashDonation', v)}
                tooltip="Cash donations above ₹2,000 are not eligible for 80G deduction." />
            </div>
          </div>

          <CurrencyInput label="Section 80TTA / 80TTB" value={inputs.sec80TTA}
            onChange={(v) => update('sec80TTA', v)}
            tooltip="Savings interest deduction. 80TTA: max ₹10,000. 80TTB (senior): max ₹50,000." />
          <CurrencyInput label="Section 80U (Disability)" value={inputs.sec80U}
            onChange={(v) => update('sec80U', v)}
            tooltip="Deduction for person with disability. ₹75,000 or ₹1,25,000 for severe." />
          <CurrencyInput label="Other Deductions" value={inputs.otherDeductions}
            onChange={(v) => update('otherDeductions', v)}
            tooltip="Any other eligible deductions under Chapter VI-A" />
        </div>

        {/* Validation Warnings */}
        {warnings.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
