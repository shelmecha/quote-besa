import React from 'react';
import { HomeStories, SidingType, SIDING_OPTIONS } from '../types/quote';

interface ExteriorDetailsFormProps {
  homeStories: HomeStories;
  homeSqft: number | '';
  sidingType: SidingType | '';
  onChangeHomeStories: (val: HomeStories) => void;
  onChangeHomeSqft: (val: number | '') => void;
  onChangeSidingType: (val: SidingType) => void;
  errors: Record<string, string>;
}

export const ExteriorDetailsForm: React.FC<ExteriorDetailsFormProps> = ({
  homeStories,
  homeSqft,
  sidingType,
  onChangeHomeStories,
  onChangeHomeSqft,
  onChangeSidingType,
  errors,
}) => {
  const presets = [
    { label: 'Cottage / Small', val: 1200 },
    { label: 'Average home', val: 1800 },
    { label: 'Suburban home', val: 2400 },
    { label: 'Spacious estate', val: 3200 },
  ];

  return (
    <section className="space-y-6 pt-2" id="exterior-details-section">
      <h2 className="text-sm font-semibold text-[#16181D]">
        2. Tell us about the project
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Home Stories */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#16181D]">
            Home stories
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="exterior-stories-1"
              onClick={() => onChangeHomeStories(1)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all text-center cursor-pointer ${
                homeStories === 1
                  ? 'bg-[#171717] border-[#171717] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F9FAFB] border-[#E4E7EC] text-[#344054]'
              }`}
            >
              1 Story
            </button>
            <button
              type="button"
              id="exterior-stories-2"
              onClick={() => onChangeHomeStories(2)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all text-center cursor-pointer ${
                homeStories === 2
                  ? 'bg-[#171717] border-[#171717] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F9FAFB] border-[#E4E7EC] text-[#344054]'
              }`}
            >
              2 Stories
            </button>
          </div>
          {errors.home_stories && (
            <p className="text-xs text-red-600 font-medium" id="error-home-stories">
              {errors.home_stories}
            </p>
          )}
        </div>

        {/* Approximate Home Size */}
        <div className="space-y-2">
          <label
            htmlFor="input-home-sqft"
            className="block text-sm font-medium text-[#16181D]"
          >
            Approximate home size
          </label>
          <div className="relative">
            <input
              id="input-home-sqft"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 2000"
              value={homeSqft === '' ? '' : homeSqft}
              onChange={(e) => {
                const val = e.target.value;
                onChangeHomeSqft(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
              }}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#16181D] placeholder:text-[#98A2B3] focus:outline-hidden focus:ring-2 focus:ring-[#171717] focus:border-transparent transition-all pr-14 ${
                errors.home_sqft ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E4E7EC]'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#667085] pointer-events-none select-none">
              sq ft
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((preset) => (
              <button
                key={preset.val}
                type="button"
                id={`exterior-preset-${preset.val}`}
                onClick={() => onChangeHomeSqft(preset.val)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  homeSqft === preset.val
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#F9FAFB] hover:bg-[#F2F4F7] text-[#475467] border-[#EAECF0]'
                }`}
              >
                {preset.label} ({preset.val.toLocaleString()})
              </button>
            ))}
          </div>

          <p className="text-xs text-[#667085]">A rough estimate is fine.</p>
          {errors.home_sqft && (
            <p className="text-xs text-red-600 font-medium" id="error-home-sqft">
              {errors.home_sqft}
            </p>
          )}
        </div>

        {/* Siding Type */}
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-[#16181D]">
            Siding type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SIDING_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                id={`siding-option-${option.id}`}
                onClick={() => onChangeSidingType(option.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-center cursor-pointer ${
                  sidingType === option.id
                    ? 'bg-[#171717] border-[#171717] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F9FAFB] border-[#E4E7EC] text-[#344054]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.siding_type && (
            <p className="text-xs text-red-600 font-medium" id="error-siding-type">
              {errors.siding_type}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
