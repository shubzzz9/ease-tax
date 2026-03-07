import { TaxInputs } from '@/lib/tax-types';
import { CurrencyInput } from './CurrencyInput';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number) => void;
}

export function CapitalGainsSection({ inputs, update }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Enter capital gain amounts directly. Shares &amp; Mutual Funds are treated as listed equity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput
          label="STCG – Shares / Mutual Funds"
          value={inputs.stcgEquity}
          onChange={(v) => update('stcgEquity', v)}
          tooltip="Short-term capital gain from listed equity shares or equity mutual funds. Holding period < 12 months. Taxed @ 20% u/s 111A."
        />
        <CurrencyInput
          label="LTCG – Shares / Mutual Funds"
          value={inputs.ltcgEquity}
          onChange={(v) => update('ltcgEquity', v)}
          tooltip="Long-term capital gain from listed equity shares or equity mutual funds. Holding period ≥ 12 months. Taxed @ 12.5% u/s 112A (₹1.25L exemption)."
        />
        <CurrencyInput
          label="STCG – Property / Land"
          value={inputs.stcgProperty}
          onChange={(v) => update('stcgProperty', v)}
          tooltip="Short-term capital gain from sale of immovable property or land. Holding period < 24 months. Taxed at slab rates."
        />
        <CurrencyInput
          label="LTCG – Property / Land"
          value={inputs.ltcgProperty}
          onChange={(v) => update('ltcgProperty', v)}
          tooltip="Long-term capital gain from sale of immovable property or land. Holding period ≥ 24 months. Taxed @ 12.5% u/s 112."
        />
      </div>

      <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
        Capital gains are taxed at applicable special rates. Surcharge on equity gains (Section 111A/112A) is capped at 15%.
        LTCG on equity has a ₹1,25,000 exemption under Section 112A.
      </p>
    </div>
  );
}
