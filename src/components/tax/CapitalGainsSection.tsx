import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number) => void;
}

export function CapitalGainsSection({ inputs, update }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="STCG on Equity / MF (Section 111A)" value={inputs.stcgEquity}
          onChange={(v) => update('stcgEquity', v)}
          tooltip="Short-term capital gain on listed shares or equity mutual funds. Taxed at 20%." />
        <CurrencyInput label="LTCG on Equity / MF (Section 112A)" value={inputs.ltcgEquity}
          onChange={(v) => update('ltcgEquity', v)}
          tooltip="Long-term gain on listed equity. First ₹1,25,000 is exempt. Taxed at 12.5%." />
        <CurrencyInput label="LTCG on Property / Other (Section 112)" value={inputs.ltcgProperty}
          onChange={(v) => update('ltcgProperty', v)}
          tooltip="Long-term gain on property, gold, debt funds etc. Taxed at 12.5%." />
        <CurrencyInput label="STCG – Other Assets" value={inputs.stcgOther}
          onChange={(v) => update('stcgOther', v)}
          tooltip="Short-term gain on other assets. Taxed at normal slab rates." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Exemptions (54 / 54EC / 54F)" value={inputs.exemptions54}
          onChange={(v) => update('exemptions54', v)}
          tooltip="Capital gain exemptions claimed u/s 54, 54EC, 54F etc." />
        <CurrencyInput label="B/F Capital Loss" value={inputs.bfCapitalLoss}
          onChange={(v) => update('bfCapitalLoss', v)}
          tooltip="Capital losses from previous years. Can only be set off against capital gains." />
      </div>
      <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
        Capital gains are taxed at special rates. Surcharge on 111A/112A capped at 15%.
      </p>
    </div>
  );
}
