import { TaxInputs } from '@/lib/tax-types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Info } from 'lucide-react';

interface Props {
  inputs: TaxInputs;
  update: (field: string, value: string) => void;
}

export function UserProfile({ inputs, update }: Props) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Your Profile</h3>
        </div>

        <div className="mb-3 max-w-xs">
          <Label className="text-xs text-muted-foreground mb-1 block">Client Name <span className="text-[10px]">(for PDF)</span></Label>
          <Input placeholder="Enter name" value={inputs.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            className="bg-muted/50 border-border/50 h-8 text-xs" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Age</Label>
            <RadioGroup value={inputs.ageGroup} onValueChange={(v) => update('ageGroup', v)} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="below60" id="age-below60" />
                <Label htmlFor="age-below60" className="text-xs cursor-pointer">Below 60</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="60to79" id="age-60to79" />
                <Label htmlFor="age-60to79" className="text-xs cursor-pointer">60–79</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="80plus" id="age-80plus" />
                <Label htmlFor="age-80plus" className="text-xs cursor-pointer">80+</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Employment</Label>
            <RadioGroup value={inputs.employmentType} onValueChange={(v) => update('employmentType', v)} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="salaried" id="emp-salaried" />
                <Label htmlFor="emp-salaried" className="text-xs cursor-pointer">Salaried</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="business" id="emp-business" />
                <Label htmlFor="emp-business" className="text-xs cursor-pointer">Business</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="both" id="emp-both" />
                <Label htmlFor="emp-both" className="text-xs cursor-pointer">Both</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Tax Regime</Label>
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/40 border border-primary/20">
              <Info className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                We automatically compare Old & New regimes and recommend the one with lower tax.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
