import { useState, useMemo } from 'react';
import { TaxInputs } from '@/lib/tax-types';
import { CapitalGainTransaction } from '@/lib/capital-gains-types';
import { computeAggregatedCapitalGains } from '@/lib/capital-gains-engine';
import { CurrencyInput } from './CurrencyInput';
import { TransactionForm } from './TransactionForm';
import { TransactionCard } from './TransactionCard';
import { CapitalGainsSummary } from './CapitalGainsSummary';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number) => void;
  updateTransactions: (txns: CapitalGainTransaction[]) => void;
}

export function CapitalGainsSection({ inputs, update, updateTransactions }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editTxn, setEditTxn] = useState<CapitalGainTransaction | undefined>();

  const txns = inputs.capitalGainTransactions;

  const cgResult = useMemo(
    () => computeAggregatedCapitalGains(txns, inputs.bfCapitalLossSTCG, inputs.bfCapitalLossLTCG),
    [txns, inputs.bfCapitalLossSTCG, inputs.bfCapitalLossLTCG],
  );

  const handleAdd = () => { setEditTxn(undefined); setFormOpen(true); };
  const handleEdit = (txn: CapitalGainTransaction) => { setEditTxn(txn); setFormOpen(true); };

  const handleSave = (txn: CapitalGainTransaction) => {
    const idx = txns.findIndex(t => t.id === txn.id);
    if (idx >= 0) {
      const updated = [...txns];
      updated[idx] = txn;
      updateTransactions(updated);
    } else {
      updateTransactions([...txns, txn]);
    }
  };

  const handleDelete = (id: string) => {
    updateTransactions(txns.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      {cgResult.computed.length > 0 && (
        <div className="space-y-2">
          {cgResult.computed.map(c => (
            <TransactionCard
              key={c.transaction.id}
              computed={c}
              onEdit={() => handleEdit(c.transaction)}
              onDelete={() => handleDelete(c.transaction.id)}
            />
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full text-xs h-9 border-dashed">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Transaction
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput
          label="B/F Short-Term Capital Loss"
          value={inputs.bfCapitalLossSTCG}
          onChange={(v) => update('bfCapitalLossSTCG', v)}
          tooltip="Short-term capital losses from previous years. Can be set off against any capital gain."
        />
        <CurrencyInput
          label="B/F Long-Term Capital Loss"
          value={inputs.bfCapitalLossLTCG}
          onChange={(v) => update('bfCapitalLossLTCG', v)}
          tooltip="Long-term capital losses from previous years. Can only be set off against long-term capital gains."
        />
      </div>

      <CapitalGainsSummary result={cgResult} />

      <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
        Capital gains are automatically computed from your transactions and taxed at applicable special rates.
        Surcharge on equity gains (Section 111A/112A) is capped at 15%.
      </p>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editTransaction={editTxn}
      />
    </div>
  );
}
