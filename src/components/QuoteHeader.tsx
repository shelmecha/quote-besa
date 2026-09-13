import React from 'react';
import { Paintbrush } from 'lucide-react';

interface QuoteHeaderProps {
  clientName?: string;
}

export const QuoteHeader: React.FC<QuoteHeaderProps> = ({
  clientName = 'CRAFT PAINT',
}) => {
  return (
    <header className="pb-7 border-b border-[#E4E7EC]" id="quote-header">
      {/* Brand */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center">
            <Paintbrush className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#16181D]">
            {clientName}
          </span>
        </div>
        <span className="text-xs text-[#667085] font-medium">
          Interior Painting
        </span>
      </div>

      {/* Hero Headline & Subtext */}
      <div className="mt-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#16181D]">
          Get Your Instant Painting Estimate
        </h1>
        <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl">
          Tell us a little about your project and we'll give you an estimated price range.
          Takes about 60 seconds.
        </p>
      </div>
    </header>
  );
};
