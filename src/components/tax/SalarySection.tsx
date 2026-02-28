import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatINR } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string) => void;
}

export function SalarySection({ inputs, update }: Props) {
  // Compute HRA exemption for display
  const salary = inputs.basicSalary + inputs.da;
  const hraExempt = inputs.hra > 0 && inputs.rentPaid > 0
    ? Math.min(inputs.hra, Math.max(0, inputs.rentPaid - 0.1 * salary), (inputs.cityType === 'metro' ? 0.5 : 0.4) * salary)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Basic Salary (Annual)" value={inputs.basicSalary}
          onChange={(v) => update('basicSalary', v)}
          tooltip="Your annual basic salary as per salary slip" />
        <CurrencyInput label="Dearness Allowance" value={inputs.da}
          onChange={(v) => update('da', v)}
          tooltip="DA received as part of salary, if applicable" />
        <CurrencyInput label="HRA Received" value={inputs.hra}
          onChange={(v) => update('hra', v)}
          tooltip="House Rent Allowance received from employer. Exemption auto-calculated under Old Regime." />
        <CurrencyInput label="Rent Paid (Annual)" value={inputs.rentPaid}
          onChange={(v) => update('rentPaid', v)}
          tooltip="Annual rent paid for accommodation. Required for HRA exemption calculation." />
      </div>

      {inputs.hra > 0 && inputs.rentPaid > 0 && (
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">City Type:</Label>
          <RadioGroup value={inputs.cityType} onValueChange={(v) => update('cityType', v)} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="metro" id="city-metro" />
              <Label htmlFor="city-metro" className="text-sm cursor-pointer">Metro</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="nonmetro" id="city-nonmetro" />
              <Label htmlFor="city-nonmetro" className="text-sm cursor-pointer">Non-Metro</Label>
            </div>
          </RadioGroup>
          {hraExempt > 0 && (
            <Badge variant="secondary" className="text-xs">
              HRA Exemption: {formatINR(hraExempt)} (Old Regime)
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Other Allowances" value={inputs.otherAllowances}
          onChange={(v) => update('otherAllowances', v)}
          tooltip="LTA, special allowances, bonus, etc." />
        <CurrencyInput label="Professional Tax" value={inputs.professionalTax}
          onChange={(v) => update('professionalTax', v)}
          tooltip="Professional tax deducted by employer (deductible under Old Regime only)" />
        <CurrencyInput label="Employer NPS Contribution" value={inputs.employerNps}
          onChange={(v) => update('employerNps', v)}
          tooltip="Employer's contribution to NPS u/s 80CCD(2). Allowed in both regimes." />
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
        <span>Auto-applied: Standard Deduction ₹75,000 (New) / ₹50,000 (Old)</span>
      </div>
    </div>
  );
}
