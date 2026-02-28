import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from './CurrencyInput';
import { HelpTooltip } from './HelpTooltip';
import { formatINR } from '@/lib/formatters';
import {
  CapitalGainTransaction, AssetType, ExemptionType,
  ASSET_LABELS, EXEMPTION_LABELS, generateId,
} from '@/lib/capital-gains-types';
import { computeTransaction } from '@/lib/capital-gains-engine';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (txn: CapitalGainTransaction) => void;
  editTransaction?: CapitalGainTransaction;
}

const EMPTY: CapitalGainTransaction = {
  id: '',
  assetType: 'listedEquity',
  dateOfAcquisition: '',
  dateOfTransfer: '',
  saleConsideration: 0,
  transferExpenses: 0,
  costOfAcquisition: 0,
  costOfImprovement: 0,
  exemptionType: 'none',
  exemptionAmount: 0,
  capitalGainsAccountScheme: false,
};

export function TransactionForm({ open, onClose, onSave, editTransaction }: Props) {
  const [form, setForm] = useState<CapitalGainTransaction>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(editTransaction || { ...EMPTY, id: generateId() });
    }
  }, [open, editTransaction]);

  const updateField = <K extends keyof CapitalGainTransaction>(field: K, value: CapitalGainTransaction[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const computed = form.dateOfAcquisition && form.dateOfTransfer
    ? computeTransaction(form)
    : null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const canSave = form.dateOfAcquisition && form.dateOfTransfer && form.saleConsideration > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editTransaction ? 'Edit' : 'Add'} Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Asset Type */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Label className="text-sm">Type of Asset</Label>
              <HelpTooltip text="Select the type of asset you sold or transferred." />
            </div>
            <Select value={form.assetType} onValueChange={(v) => updateField('assetType', v as AssetType)}>
              <SelectTrigger className="bg-muted/50 border-border/50 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ASSET_LABELS) as [AssetType, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm">Date of Purchase</Label>
                <HelpTooltip text="The date you acquired or bought this asset." />
              </div>
              <Input
                type="date"
                value={form.dateOfAcquisition}
                onChange={(e) => updateField('dateOfAcquisition', e.target.value)}
                className="bg-muted/50 border-border/50 h-9 text-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm">Date of Sale</Label>
                <HelpTooltip text="The date you sold or transferred this asset." />
              </div>
              <Input
                type="date"
                value={form.dateOfTransfer}
                onChange={(e) => updateField('dateOfTransfer', e.target.value)}
                className="bg-muted/50 border-border/50 h-9 text-sm"
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              label="Sale Price"
              value={form.saleConsideration}
              onChange={(v) => updateField('saleConsideration', v)}
              tooltip="Full value of consideration received or accruing on sale/transfer (Section 48)."
            />
            <CurrencyInput
              label="Transfer Expenses"
              value={form.transferExpenses}
              onChange={(v) => updateField('transferExpenses', v)}
              tooltip="Brokerage, stamp duty, legal fees and other expenses on transfer."
            />
            <CurrencyInput
              label="Purchase Cost"
              value={form.costOfAcquisition}
              onChange={(v) => updateField('costOfAcquisition', v)}
              tooltip="Original cost of acquiring the asset (Section 48)."
            />
            <CurrencyInput
              label="Improvement Cost"
              value={form.costOfImprovement}
              onChange={(v) => updateField('costOfImprovement', v)}
              tooltip="Cost of any improvements made to the asset after acquisition."
            />
          </div>

          {/* Exemption section – only for LTCG */}
          {computed && computed.isLongTerm && computed.grossGain > 0 && (
            <div className="space-y-3 border border-border/50 rounded-lg p-3 bg-muted/20">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Exemption Claim</Label>
                <HelpTooltip text="If you reinvested the capital gain in a qualifying asset, you may claim an exemption under Section 54/54EC/54F etc." />
              </div>
              <Select value={form.exemptionType} onValueChange={(v) => updateField('exemptionType', v as ExemptionType)}>
                <SelectTrigger className="bg-muted/50 border-border/50 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(EXEMPTION_LABELS) as [ExemptionType, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.exemptionType !== 'none' && (
                <>
                  <CurrencyInput
                    label="Amount Invested"
                    value={form.exemptionAmount}
                    onChange={(v) => updateField('exemptionAmount', v)}
                    tooltip="Amount invested in the exemption-qualifying asset. Capped at the capital gain and statutory limits."
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={form.capitalGainsAccountScheme}
                      onCheckedChange={(c) => updateField('capitalGainsAccountScheme', !!c)}
                    />
                    <Label className="text-xs text-muted-foreground">
                      Amount deposited in Capital Gains Account Scheme
                    </Label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Live preview of computation */}
          {computed && (
            <div className="rounded-lg p-3 bg-muted/30 border border-border/30 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holding Period</span>
                <span>{computed.holdingMonths} months · {computed.isLongTerm ? 'Long-Term' : 'Short-Term'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capital Gain / Loss</span>
                <span className={computed.taxableGain >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatINR(computed.taxableGain)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Treatment</span>
                <span className="text-xs text-right max-w-[60%]">{computed.taxRateLabel}</span>
              </div>
              {computed.exemption > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exemption Applied</span>
                  <span className="text-primary">{formatINR(computed.exemption)}</span>
                </div>
              )}
              {computed.isGrandfathered && (
                <p className="text-xs text-primary mt-1">
                  ✦ Property acquired before 23 July 2024 — optimal tax option applied automatically.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>Save Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
