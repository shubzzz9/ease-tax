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
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-display">Your Profile</h3>
        </div>

        {/* Client Name & PAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Client Name</Label>
            <Input placeholder="Enter name (for PDF export)" value={inputs.clientName}
              onChange={(e) => update('clientName', e.target.value)}
              className="bg-muted/50 border-border/50 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">PAN</Label>
            <Input placeholder="e.g. ABCDE1234F" value={inputs.pan}
              onChange={(e) => update('pan', e.target.value.toUpperCase())}
              maxLength={10}
              className="bg-muted/50 border-border/50 h-9 text-sm uppercase" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Age Group</Label>
            <RadioGroup value={inputs.ageGroup} onValueChange={(v) => update('ageGroup', v)} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="below60" id="age-below60" />
                <Label htmlFor="age-below60" className="text-sm cursor-pointer">Below 60</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="60to79" id="age-60to79" />
                <Label htmlFor="age-60to79" className="text-sm cursor-pointer">60–79 (Senior Citizen)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="80plus" id="age-80plus" />
                <Label htmlFor="age-80plus" className="text-sm cursor-pointer">80+ (Super Senior)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Employment Type</Label>
            <RadioGroup value={inputs.employmentType} onValueChange={(v) => update('employmentType', v)} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="salaried" id="emp-salaried" />
                <Label htmlFor="emp-salaried" className="text-sm cursor-pointer">Salaried</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="business" id="emp-business" />
                <Label htmlFor="emp-business" className="text-sm cursor-pointer">Business / Professional</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="emp-both" />
                <Label htmlFor="emp-both" className="text-sm cursor-pointer">Both</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Tax Regime</Label>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-primary/20">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                New Regime is default as per law. We automatically compare both regimes and recommend the one with lower tax.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
