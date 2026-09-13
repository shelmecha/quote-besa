import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { CeilingHeight, CoatCount } from '../types/quote';

interface ProjectDetailsFormProps {
  sqft: number | '';
  ceiling: CeilingHeight;
  doors: number | '';
  coats: CoatCount;
  onChangeSqft: (val: number | '') => void;
  onChangeCeiling: (val: CeilingHeight) => void;
  onChangeDoors: (val: number | '') => void;
  onChangeCoats: (val: CoatCount) => void;
  errors: Record<string, string>;
}

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  sqft,
  ceiling,
  doors,
  coats,
  onChangeSqft,
  onChangeCeiling,
  onChangeDoors,
  onChangeCoats,
  errors,
}) => {
  const currentDoors = typeof doors === 'number' ? doors : 0;

  const handleDoorsDelta = (delta: number) => {
    const nextVal = Math.max(0, currentDoors + delta);
    onChangeDoors(nextVal);
  };

  const presets = [
    { label: 'Small room', val: 200 },
    { label: 'Bedroom', val: 350 },
    { label: 'Living area', val: 600 },
    { label: 'Large space', val: 900 },
  ];

  return (
    <section className="space-y-6 pt-2" id="project-details-section">
      <h2 className="text-sm font-semibold text-[#16181D]">
        2. Tell us about the project
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Wall Area */}
        <div className="space-y-2">
          <label
            htmlFor="input-sqft"
            className="block text-sm font-medium text-[#16181D]"
          >
            Approximate wall area
          </label>
          <div className="relative">
            <input
              id="input-sqft"
              type="number"
              min="1"
              max="20000"
              step="1"
              placeholder="e.g. 486"
              value={sqft}
              onChange={(e) => {
                const val = e.target.value;
                onChangeSqft(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
              }}
              className={`w-full px-3.5 py-2.5 pr-14 rounded-lg border bg-white text-sm text-[#16181D] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 transition-all ${
                errors.sqft
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-[#E4E7EC] hover:border-[#D0D5DD] focus:border-[#171717] focus:ring-[#171717]/10'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#667085] font-medium pointer-events-none">
              sq ft
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            A rough estimate is fine.
          </p>

          {/* Clean Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {presets.map((p) => {
              const isSelected = sqft === p.val;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => onChangeSqft(p.val)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-[#F9FAFB] hover:bg-white text-[#344054] border-[#E4E7EC]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {errors.sqft && (
            <p className="text-xs text-rose-600 mt-1">{errors.sqft}</p>
          )}
        </div>

        {/* Ceiling Height */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#16181D]">
            Ceiling height
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="ceiling-option-standard"
              onClick={() => onChangeCeiling('standard')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                ceiling === 'standard'
                  ? 'border-[#171717] bg-white ring-1 ring-[#171717] shadow-xs'
                  : 'border-[#E4E7EC] bg-[#F9FAFB] hover:bg-white text-[#344054]'
              }`}
            >
              <span className="text-sm font-semibold text-[#16181D] block">
                Standard
              </span>
              <span className="text-xs text-[#667085] mt-0.5 block">
                8–9 ft
              </span>
            </button>

            <button
              type="button"
              id="ceiling-option-high"
              onClick={() => onChangeCeiling('high')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                ceiling === 'high'
                  ? 'border-[#171717] bg-white ring-1 ring-[#171717] shadow-xs'
                  : 'border-[#E4E7EC] bg-[#F9FAFB] hover:bg-white text-[#344054]'
              }`}
            >
              <span className="text-sm font-semibold text-[#16181D] block">
                High / Vaulted
              </span>
              <span className="text-xs text-[#667085] mt-0.5 block">
                10+ ft
              </span>
            </button>
          </div>
          <p className="text-xs text-[#667085]">
            This helps us estimate the work involved.
          </p>

          {errors.ceiling && (
            <p className="text-xs text-rose-600 mt-1">{errors.ceiling}</p>
          )}
        </div>

        {/* Doors */}
        <div className="space-y-2">
          <label
            htmlFor="input-doors"
            className="block text-sm font-medium text-[#16181D]"
          >
            Number of doors
          </label>
          <div className="flex items-center gap-2 max-w-[200px]">
            <button
              type="button"
              onClick={() => handleDoorsDelta(-1)}
              disabled={currentDoors <= 0}
              className="w-10 h-10 rounded-lg border border-[#E4E7EC] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#344054] transition-colors cursor-pointer"
              aria-label="Decrease door count"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              id="input-doors"
              type="number"
              min="0"
              max="100"
              step="1"
              value={doors}
              onChange={(e) => {
                const val = e.target.value;
                onChangeDoors(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
              }}
              className={`w-16 py-2 text-center rounded-lg border bg-white text-sm font-semibold text-[#16181D] focus:outline-none focus:ring-2 transition-all ${
                errors.doors
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-[#E4E7EC] focus:border-[#171717] focus:ring-[#171717]/10'
              }`}
            />
            <button
              type="button"
              onClick={() => handleDoorsDelta(1)}
              className="w-10 h-10 rounded-lg border border-[#E4E7EC] bg-white hover:bg-[#F9FAFB] flex items-center justify-center text-[#344054] transition-colors cursor-pointer"
              aria-label="Increase door count"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#667085]">
            Interior doors to be painted.
          </p>

          {errors.doors && (
            <p className="text-xs text-rose-600 mt-1">{errors.doors}</p>
          )}
        </div>

        {/* Paint Coats */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#16181D]">
            Number of coats
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="coats-option-1"
              onClick={() => onChangeCoats(1)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                coats === 1
                  ? 'border-[#171717] bg-white ring-1 ring-[#171717] shadow-xs'
                  : 'border-[#E4E7EC] bg-[#F9FAFB] hover:bg-white text-[#344054]'
              }`}
            >
              <span className="text-sm font-semibold text-[#16181D] block">
                1 Coat
              </span>
              <span className="text-xs text-[#667085] mt-0.5 block">
                Touch-up or refresh
              </span>
            </button>

            <button
              type="button"
              id="coats-option-2"
              onClick={() => onChangeCoats(2)}
              className={`relative p-3 rounded-lg border text-left transition-all cursor-pointer ${
                coats === 2
                  ? 'border-[#171717] bg-white ring-1 ring-[#171717] shadow-xs'
                  : 'border-[#E4E7EC] bg-[#F9FAFB] hover:bg-white text-[#344054]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#16181D]">
                  2 Coats
                </span>
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <span className="text-xs text-[#667085] mt-0.5 block">
                Standard full coverage
              </span>
            </button>
          </div>
          <p className="text-xs text-[#667085]">
            2 coats are recommended for most projects.
          </p>

          {errors.coats && (
            <p className="text-xs text-rose-600 mt-1">{errors.coats}</p>
          )}
        </div>
      </div>
    </section>
  );
};
