import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number) => void;
}

export function OtherIncomeSection({ inputs, update }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Interest from Fixed Deposits" value={inputs.fdInterest}
          onChange={(v) => update('fdInterest', v)}
          tooltip="Interest earned on bank/company fixed deposits" />
        <CurrencyInput label="Savings Account Interest" value={inputs.savingsInterest}
          onChange={(v) => update('savingsInterest', v)}
          tooltip="Interest from savings bank account. Deduction available under 80TTA/80TTB." />
        <CurrencyInput label="Dividend Income" value={inputs.dividend}
          onChange={(v) => update('dividend', v)}
          tooltip="Dividend received from shares or mutual funds. Fully taxable." />
        <CurrencyInput label="Family Pension" value={inputs.familyPension}
          onChange={(v) => update('familyPension', v)}
          tooltip="Pension received by family member. Deduction of 1/3 or ₹15,000 (whichever lower) auto-applied." />
        <CurrencyInput label="Agricultural Income" value={inputs.agriculturalIncome}
          onChange={(v) => update('agriculturalIncome', v)}
          tooltip="Agricultural income is exempt but used to compute tax rate under Old Regime (integration)." />
        <CurrencyInput label="Any Other Income" value={inputs.otherIncome}
          onChange={(v) => update('otherIncome', v)}
          tooltip="Lottery, gifts, or any other taxable income" />
      </div>
    </div>
  );
}
