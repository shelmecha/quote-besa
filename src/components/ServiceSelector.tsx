import React from 'react';
import { Home, Building2, Check } from 'lucide-react';
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
        {/* Interior Option */}
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

        {/* Exterior Option */}
        <button
          type="button"
          id="service-option-exterior"
          onClick={() => onSelectService('exterior')}
          className={`relative p-4 rounded-xl text-left border transition-all cursor-pointer ${
            selectedService === 'exterior'
              ? 'bg-white border-[#171717] ring-1 ring-[#171717] shadow-xs'
              : 'bg-[#F9FAFB] hover:bg-white border-[#E4E7EC] text-[#16181D]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  selectedService === 'exterior'
                    ? 'bg-[#171717] text-white'
                    : 'bg-white text-[#667085] border border-[#E4E7EC]'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-[#16181D] block">
                  Exterior Painting
                </span>
                <span className="text-xs text-[#667085] mt-0.5 block">
                  Request a custom estimate
                </span>
              </div>
            </div>
            {selectedService === 'exterior' && (
              <div className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
            )}
          </div>
        </button>
      </div>
    </section>
  );
};
