import React from 'react';
import { Home, Sparkles, Check } from 'lucide-react';
import { ServiceType } from '../types/quote';

interface ServiceSelectorProps {
  selectedService: ServiceType;
  onSelectService: (service: ServiceType) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedService,
  onSelectService,
}) => {
  return (
    <section className="space-y-3" id="service-selection-section">
      <h2 className="text-sm font-semibold text-[#16181D]">
        1. What are you painting?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Interior Option - Active */}
        <button
          type="button"
          id="service-option-interior"
          onClick={() => onSelectService('interior')}
          className={`relative p-4 rounded-xl text-left border transition-all cursor-pointer ${
            selectedService === 'interior'
              ? 'bg-white border-[#171717] ring-1 ring-[#171717] shadow-xs'
              : 'bg-[#F9FAFB] hover:bg-white border-[#E4E7EC] text-[#16181D]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  selectedService === 'interior'
                    ? 'bg-[#171717] text-white'
                    : 'bg-white text-[#667085] border border-[#E4E7EC]'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-[#16181D] block">
                  Interior Painting
                </span>
                <span className="text-xs text-[#667085] mt-0.5 block">
                  Get an instant estimate
                </span>
              </div>
            </div>
            {selectedService === 'interior' && (
              <div className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
            )}
          </div>
        </button>

        {/* Exterior Option - Coming Soon */}
        <div
          id="service-option-exterior"
          className="p-4 rounded-xl text-left border border-[#E4E7EC] bg-[#F9FAFB] opacity-60 cursor-not-allowed"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white text-[#98A2B3] border border-[#E4E7EC]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-[#667085] block">
                  Exterior Painting
                </span>
                <span className="text-xs text-[#98A2B3] mt-0.5 block">
                  Coming soon
                </span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#667085] bg-white border border-[#E4E7EC] px-2 py-0.5 rounded-md">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
