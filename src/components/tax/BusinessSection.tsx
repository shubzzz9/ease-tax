import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number) => void;
}

export function BusinessSection({ inputs, update }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CurrencyInput label="Net Profit (as per books)" value={inputs.netProfit}
        onChange={(v) => update('netProfit', v)}
        tooltip="Net profit from business or profession as per your books of accounts" />
      <CurrencyInput label="Adjustments (+/-)" value={inputs.businessAdjustments}
        onChange={(v) => update('businessAdjustments', v)}
        tooltip="Any additions or disallowances to book profit" />
      <CurrencyInput label="Brought Forward Business Loss" value={inputs.bfBusinessLoss}
        onChange={(v) => update('bfBusinessLoss', v)}
        tooltip="Business losses from previous years available for set-off" />
    </div>
  );
}
