import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';

interface Props {
  text: string;
}

export function HelpTooltip({ text }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-colors">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-xs text-xs bg-popover border-border p-2 w-auto">
        {text}
      </PopoverContent>
    </Popover>
  );
}
