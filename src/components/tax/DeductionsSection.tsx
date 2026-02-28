import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';
import { Card, CardContent } from '@/components/ui/card';
import { PiggyBank, Info } from 'lucide-react';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number) => void;
}

export function DeductionsSection({ inputs, update }: Props) {
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
            tooltip="Health insurance premium. Up to ₹25,000 (₹50,000 for senior citizens) for self + family" />
          <CurrencyInput label="Section 80CCD(1B) (NPS Extra)" value={inputs.sec80CCD1B}
            onChange={(v) => update('sec80CCD1B', v)} max={50000}
            tooltip="Additional NPS contribution. Max ₹50,000 over and above 80C limit." />
          <CurrencyInput label="Section 80E (Education Loan Interest)" value={inputs.sec80E}
            onChange={(v) => update('sec80E', v)}
            tooltip="Interest on education loan. No upper limit. Available for 8 years." />
          <CurrencyInput label="Section 80G (Donations)" value={inputs.sec80G}
            onChange={(v) => update('sec80G', v)}
            tooltip="Eligible donation amount after applying 50%/100% rule" />
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
      </CardContent>
    </Card>
  );
}
