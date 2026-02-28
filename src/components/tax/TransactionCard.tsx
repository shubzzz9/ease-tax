import { ComputedTransaction, ASSET_LABELS } from '@/lib/capital-gains-types';
import { formatINR } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  computed: ComputedTransaction;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionCard({ computed, onEdit, onDelete }: Props) {
  const { transaction: txn, taxableGain, taxRateLabel, holdingMonths, isLongTerm, isGrandfathered } = computed;
  const isGain = taxableGain >= 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/60 hover:bg-card/80 transition-colors">
      <div className={`p-2 rounded-full flex-shrink-0 ${isGain ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
        {isGain
          ? <TrendingUp className="h-4 w-4 text-green-500" />
          : <TrendingDown className="h-4 w-4 text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{ASSET_LABELS[txn.assetType]}</p>
        <p className="text-xs text-muted-foreground">
          {holdingMonths}m · {isLongTerm ? 'Long-Term' : 'Short-Term'}
          {isGrandfathered && ' · Grandfathered'}
        </p>
        <p className="text-xs text-muted-foreground">{taxRateLabel}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
          {formatINR(taxableGain)}
        </p>
        <p className="text-xs text-muted-foreground">Sale: {formatINR(txn.saleConsideration)}</p>
      </div>
      <div className="flex gap-1 no-print flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
