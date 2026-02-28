import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatINR } from '@/lib/formatters';
import { HelpTooltip } from './HelpTooltip';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tooltip?: string;
  max?: number;
  className?: string;
}

export function CurrencyInput({ label, value, onChange, tooltip, max, className }: Props) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Label className="text-sm text-foreground/80">{label}</Label>
        {tooltip && <HelpTooltip text={tooltip} />}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
        <Input
          type="number"
          min={0}
          max={max}
          value={value > 0 ? value : ''}
          placeholder="0"
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            const val = isNaN(v) ? 0 : Math.max(0, max ? Math.min(v, max) : v);
            onChange(val);
          }}
          className="pl-7 bg-muted/50 border-border/50 focus:border-primary/50 h-9 text-sm"
        />
      </div>
      {value > 0 && (
        <span className="text-xs text-muted-foreground mt-0.5 block">{formatINR(value)}</span>
      )}
    </div>
  );
}
