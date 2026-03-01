import { TaxResult } from '@/lib/tax-types';
import { formatINR } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, IndianRupee, Receipt, Award } from 'lucide-react';

interface Props {
  oldResult: TaxResult;
  newResult: TaxResult;
}

export function SummaryDashboard({ oldResult, newResult }: Props) {
  const recommended = newResult.totalTaxLiability <= oldResult.totalTaxLiability ? 'New' : 'Old';
  const savings = Math.abs(oldResult.totalTaxLiability - newResult.totalTaxLiability);
  const betterResult = recommended === 'New' ? newResult : oldResult;

  const cards = [
    {
      label: 'Gross Income',
      value: formatINR(Math.max(oldResult.grossTotalIncome, newResult.grossTotalIncome)),
      icon: IndianRupee,
      color: 'text-foreground',
    },
    {
      label: 'Tax (Old Regime)',
      value: formatINR(oldResult.totalTaxLiability),
      icon: Receipt,
      color: recommended === 'Old' ? 'text-primary' : 'text-muted-foreground',
    },
    {
      label: 'Tax (New Regime)',
      value: formatINR(newResult.totalTaxLiability),
      icon: Receipt,
      color: recommended === 'New' ? 'text-primary' : 'text-muted-foreground',
    },
    {
      label: 'You Save',
      value: formatINR(savings),
      icon: TrendingDown,
      color: 'text-success',
    },
    {
      label: betterResult.totalAmountPayable >= 0 ? 'Net Payable' : 'Refund Due',
      value: formatINR(Math.abs(betterResult.totalAmountPayable)),
      icon: betterResult.totalAmountPayable >= 0 ? TrendingUp : TrendingDown,
      color: betterResult.totalAmountPayable < 0 ? 'text-success' : 'text-destructive',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className="border-border/50 bg-card/80 hover:bg-card transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className={`text-sm sm:text-base font-bold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg gold-gradient animate-pulse-gold">
        <Award className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">
          Recommended: {recommended} Regime — Save {formatINR(savings)}
        </span>
      </div>
    </div>
  );
}
