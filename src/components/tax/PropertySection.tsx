import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string) => void;
}

export function PropertySection({ inputs, update }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Property Type</Label>
        <RadioGroup value={inputs.propertyType} onValueChange={(v) => update('propertyType', v)} className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="none" id="prop-none" />
            <Label htmlFor="prop-none" className="text-sm cursor-pointer">No Property</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="selfOccupied" id="prop-self" />
            <Label htmlFor="prop-self" className="text-sm cursor-pointer">Self-Occupied</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="rented" id="prop-rented" />
            <Label htmlFor="prop-rented" className="text-sm cursor-pointer">Rented / Let Out</Label>
          </div>
        </RadioGroup>
      </div>

      {inputs.propertyType !== 'none' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputs.propertyType === 'rented' && (
            <>
              <CurrencyInput label="Annual Rent Received" value={inputs.rentReceived}
                onChange={(v) => update('rentReceived', v)}
                tooltip="Total rent received during the year" />
              <CurrencyInput label="Municipal Taxes Paid" value={inputs.municipalTaxes}
                onChange={(v) => update('municipalTaxes', v)}
                tooltip="Property tax/municipal tax paid during the year" />
            </>
          )}
          <CurrencyInput label="Interest on Home Loan" value={inputs.homeLoanInterest}
            onChange={(v) => update('homeLoanInterest', v)}
            tooltip="Annual interest paid on home loan. Max ₹2L for self-occupied property." />
        </div>
      )}

      {inputs.propertyType === 'rented' && (
        <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
          30% standard deduction on Net Annual Value is auto-applied for rented property.
        </p>
      )}
    </div>
  );
}
