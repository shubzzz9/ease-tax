import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string) => void;
}

export function PropertySection({ inputs, update }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Annual Rent Received" value={inputs.rentReceived}
          onChange={(v) => update('rentReceived', v)}
          tooltip="Total rent received during the year" />
        <CurrencyInput label="Municipal Taxes Paid" value={inputs.municipalTaxes}
          onChange={(v) => update('municipalTaxes', v)}
          tooltip="Property tax/municipal tax paid during the year" />
        <CurrencyInput label="Interest on Home Loan" value={inputs.homeLoanInterest}
          onChange={(v) => update('homeLoanInterest', v)}
          tooltip="Annual interest paid on home loan. No cap for let-out property." />
      </div>

      <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
        30% standard deduction on Net Annual Value is auto-applied for let-out property.
      </p>
    </div>
  );
}
