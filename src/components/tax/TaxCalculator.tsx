import { useState, useMemo, useCallback, useEffect } from 'react';
import { TaxInputs, DEFAULT_INPUTS, DEMO_INPUTS } from '@/lib/tax-types';
import { BusinessInputs } from '@/lib/business-types';
import { CapitalGainTransaction } from '@/lib/capital-gains-types';
import { computeTax } from '@/lib/tax-engine';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, Building2, TrendingUp, Wallet, RotateCcw, Play } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { SalarySection } from './SalarySection';
import { PropertySection } from './PropertySection';
import { BusinessSection } from './BusinessSection';
import { CapitalGainsSection } from './CapitalGainsSection';
import { OtherIncomeSection } from './OtherIncomeSection';
import { DeductionsSection } from './DeductionsSection';
import { TaxPaidSection } from './TaxPaidSection';
import { SummaryDashboard } from './SummaryDashboard';
import { ResultsComparison } from './ResultsComparison';

export function TaxCalculator() {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decoded = JSON.parse(atob(hash));
        setInputs({ ...DEFAULT_INPUTS, ...decoded });
      } catch { /* ignore */ }
    }
  }, []);

  const update = useCallback((field: string, value: number | string | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBusinessInputs = useCallback((biz: BusinessInputs) => {
    setInputs(prev => ({ ...prev, businessInputs: biz }));
  }, []);

  const updateTransactions = useCallback((txns: CapitalGainTransaction[]) => {
    setInputs(prev => ({ ...prev, capitalGainTransactions: txns }));
  }, []);

  const oldResult = useMemo(() => computeTax(inputs, 'old'), [inputs]);
  const newResult = useMemo(() => computeTax(inputs, 'new'), [inputs]);

  const showSalary = inputs.employmentType !== 'business';
  const showBusiness = inputs.employmentType !== 'salaried';

  return (
    <div className="space-y-5 animate-fade-in">
      <SummaryDashboard oldResult={oldResult} newResult={newResult} />

      <div className="flex gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => setInputs(DEMO_INPUTS)} className="text-xs h-8">
          <Play className="h-3.5 w-3.5 mr-1" /> Load Demo
        </Button>
        <Button variant="outline" size="sm" onClick={() => setInputs(DEFAULT_INPUTS)} className="text-xs h-8">
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
        </Button>
      </div>

      <UserProfile inputs={inputs} update={update} />

      <Accordion type="multiple" defaultValue={showSalary ? ['salary'] : ['business']} className="space-y-2">
        {showSalary && (
          <AccordionItem value="salary" className="border border-border/50 rounded-lg bg-card/80 px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4 text-primary" />
                Income from Salary
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <SalarySection inputs={inputs} update={update} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="property" className="border border-border/50 rounded-lg bg-card/80 px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Home className="h-4 w-4 text-primary" />
              Income from House Property
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <PropertySection inputs={inputs} update={update} />
          </AccordionContent>
        </AccordionItem>

        {showBusiness && (
          <AccordionItem value="business" className="border border-border/50 rounded-lg bg-card/80 px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-primary" />
                Business / Freelance Income
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <BusinessSection inputs={inputs} update={update} updateBusinessInputs={updateBusinessInputs} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="capitalgains" className="border border-border/50 rounded-lg bg-card/80 px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Income from Shares / Property / Mutual Funds
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <CapitalGainsSection inputs={inputs} update={update} updateTransactions={updateTransactions} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="other" className="border border-border/50 rounded-lg bg-card/80 px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4 text-primary" />
              Other Income
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <OtherIncomeSection inputs={inputs} update={update} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <DeductionsSection inputs={inputs} update={update} />
      <TaxPaidSection inputs={inputs} update={update} oldResult={oldResult} newResult={newResult} />
      <ResultsComparison inputs={inputs} oldResult={oldResult} newResult={newResult} />
    </div>
  );
}
