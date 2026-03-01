import { TaxInputs, TaxResult } from '@/lib/tax-types';
import { AdvanceTaxInstallment } from '@/lib/interest-engine';
import { CurrencyInput } from './CurrencyInput';
import { HelpTooltip } from './HelpTooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Receipt, AlertTriangle, Plus, Trash2, Clock } from 'lucide-react';
import { formatINR } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: number | string | boolean) => void;
  oldResult: TaxResult;
  newResult: TaxResult;
}

export function TaxPaidSection({ inputs, update, oldResult, newResult }: Props) {
  const result = newResult.totalTaxLiability <= oldResult.totalTaxLiability ? newResult : oldResult;

  const addInstallment = () => {
    const updated: AdvanceTaxInstallment[] = [...inputs.advanceTaxInstallments, { date: '', amount: 0 }];
    update('advanceTaxInstallments', updated as any);
  };

  const removeInstallment = (idx: number) => {
    const updated = inputs.advanceTaxInstallments.filter((_, i) => i !== idx);
    update('advanceTaxInstallments', updated as any);
  };

  const updateInstallment = (idx: number, field: 'date' | 'amount', value: string | number) => {
    const updated = [...inputs.advanceTaxInstallments];
    updated[idx] = { ...updated[idx], [field]: value };
    update('advanceTaxInstallments', updated as any);
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Tax Already Paid</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CurrencyInput label="TDS Deducted" value={inputs.tds}
            onChange={(v) => update('tds', v)}
            tooltip="Total TDS deducted by employer, bank, etc. as shown in Form 26AS" />
          <CurrencyInput label="Advance Tax Paid" value={inputs.advanceTax}
            onChange={(v) => update('advanceTax', v)}
            tooltip="Total advance tax paid during the year" />
          <CurrencyInput label="Self Assessment Tax" value={inputs.selfAssessmentTax}
            onChange={(v) => update('selfAssessmentTax', v)}
            tooltip="Tax paid at the time of filing the return" />
        </div>

        <Separator className="my-4 bg-border/50" />

        {/* Interest Computation Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Interest Computation</h4>
            <HelpTooltip text="Interest is computed under Sections 234A (late filing), 234B (advance tax shortfall), and 234C (installment deferment) of the Income-tax Act." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm text-foreground/80">Return Filing Date</Label>
                <HelpTooltip text="Date you filed / plan to file your ITR. Interest for late filing (Section 234A) is computed from the due date." />
              </div>
              <Input type="date" value={inputs.returnFilingDate}
                onChange={(e) => update('returnFilingDate', e.target.value)}
                className="bg-muted/50 border-border/50 h-9 text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label className="text-sm text-foreground/80">Due Date</Label>
                <HelpTooltip text="Due date for filing return. Default is 31 July for non-audit cases." />
              </div>
              <Input type="date" value={inputs.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
                className="bg-muted/50 border-border/50 h-9 text-sm" />
            </div>
          </div>

          {/* Advanced Mode Toggle */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <Switch
              checked={inputs.useAdvancedMode}
              onCheckedChange={(v) => update('useAdvancedMode', v)}
            />
            <div>
              <Label className="text-sm cursor-pointer">Date-wise Advance Tax Breakup</Label>
              <p className="text-xs text-muted-foreground">Enable for installment-wise interest computation</p>
            </div>
          </div>

          {/* Date-wise Installments */}
          {inputs.useAdvancedMode && (
            <div className="space-y-2">
              {inputs.advanceTaxInstallments.map((inst, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input type="date" value={inst.date}
                      onChange={(e) => updateInstallment(idx, 'date', e.target.value)}
                      className="bg-muted/50 border-border/50 h-8 text-xs" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
                    <Input type="number" min={0} value={inst.amount || ''} placeholder="0"
                      onChange={(e) => updateInstallment(idx, 'amount', parseFloat(e.target.value) || 0)}
                      className="bg-muted/50 border-border/50 h-8 text-xs" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeInstallment(idx)} className="h-8 w-8 p-0">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addInstallment} className="w-full text-xs h-8 border-dashed">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Installment
              </Button>
            </div>
          )}

          {/* Interest Summary */}
          {(result.interest234A > 0 || result.interest234B > 0 || result.interest234C > 0) && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1.5">
              <h5 className="text-sm font-semibold text-destructive">Interest Payable</h5>
              {result.interest234A > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Interest for Late Filing
                    <HelpTooltip text="Section 234A: 1% per month on tax due, from due date to filing date" />
                  </span>
                  <span className="font-medium">{formatINR(result.interest234A)}</span>
                </div>
              )}
              {result.interest234B > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Interest for Advance Tax Shortfall
                    <HelpTooltip text="Section 234B: 1% per month when advance tax < 90% of assessed tax" />
                  </span>
                  <span className="font-medium">{formatINR(result.interest234B)}</span>
                </div>
              )}
              {result.interest234C > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Interest for Delayed Payment
                    <HelpTooltip text="Section 234C: 1% per month for shortfall in advance tax installments" />
                  </span>
                  <span className="font-medium">{formatINR(result.interest234C)}</span>
                </div>
              )}
              <Separator className="bg-destructive/10" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Interest</span>
                <span className="text-destructive">{formatINR(result.totalInterest)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Warnings */}
        {result.totalInterest > 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span>Interest is computed as per Sections 234A/234B/234C. Amounts rounded to nearest ₹10 (Section 288B).</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
