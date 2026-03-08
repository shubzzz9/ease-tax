import { TaxInputs, TaxResult } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string | boolean) => void;
  oldResult: TaxResult;
  newResult: TaxResult;
}

export function TaxPaidSection({ inputs, update }: Props) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Tax Already Paid</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput label="TDS Deducted" value={inputs.tds}
            onChange={(v) => update('tds', v)}
            tooltip="Total TDS deducted by employer, bank, etc. as shown in Form 26AS" />
          <CurrencyInput label="Advance Tax Paid" value={inputs.advanceTax}
            onChange={(v) => update('advanceTax', v)}
            tooltip="Total advance tax paid during the year" />
        </div>
      </CardContent>
    </Card>
  );
}
