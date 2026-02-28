import { CapitalGainsAggregated } from '@/lib/capital-gains-types';
import { formatINR } from '@/lib/formatters';

interface Props {
  result: CapitalGainsAggregated;
}

function SummaryRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  if (value === 0 && !highlight) return null;
  return (
    <div className={`flex justify-between py-1.5 text-sm ${highlight ? 'font-semibold border-t border-border/50 pt-2 mt-1' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={value < 0 ? 'text-red-500' : ''}>{formatINR(value)}</span>
    </div>
  );
}

export function CapitalGainsSummary({ result }: Props) {
  const totalGain = result.capitalGainsSpecial + result.capitalGainsNormal;
  const totalTax = result.stcg111ATax + result.ltcg112ATax + result.ltcg112Tax;
  if (result.computed.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-0.5">
      <h4 className="text-sm font-semibold mb-2">Capital Gains Summary</h4>
      <SummaryRow label="Short-Term Gain on Equity @ 20%" value={result.stcg111A} />
      <SummaryRow label="Short-Term Gain @ Slab Rate" value={result.stcgSlab} />
      <SummaryRow label="Long-Term Gain on Equity @ 12.5%" value={result.ltcg112ANet} />
      <SummaryRow label="Long-Term Gain @ 12.5%" value={result.ltcg112} />
      {result.ltcg112Indexed > 0 && (
        <SummaryRow label="Long-Term Gain @ 20% (Indexed Property)" value={result.ltcg112Indexed} />
      )}
      {result.totalExemptions > 0 && (
        <SummaryRow label="Less: Exemptions Claimed" value={-result.totalExemptions} />
      )}
      <SummaryRow label="Total Taxable Capital Gain" value={totalGain} highlight />
      <SummaryRow label="Tax on Capital Gains" value={totalTax} highlight />
    </div>
  );
}
