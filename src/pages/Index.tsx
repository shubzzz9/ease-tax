import { TaxCalculator } from '@/components/tax/TaxCalculator';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Calculator } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 navy-gradient no-print">
        <div className="container py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary">
                G S Mundada & Co.
              </h1>
              <p className="text-sm sm:text-base font-semibold text-secondary-foreground/90 mt-0.5">
                CA Dr. Akash Mundada
              </p>
              <p className="text-xs text-secondary-foreground/70">
                Office: 7020591108
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calculator className="h-4 w-4 text-primary/70" />
                <p className="text-xs sm:text-sm text-secondary-foreground/80">
                  Income Tax Calculator – FY 2025-26 (AY 2026-27)
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-secondary-foreground/50">Chartered Accountants</p>
              <p className="text-xs text-secondary-foreground/50">As per Income-tax Act, 1961</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-5 sm:py-6">
        <TaxCalculator />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 no-print">
        <div className="container text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} G S Mundada & Co. • This calculator is for estimation purposes only.
            Please consult your CA for final tax computation.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Made by Lovable – shubhamlunawat98@gmail.com
          </p>
        </div>
      </footer>
      <InstallPrompt />
    </div>
  );
};

export default Index;
