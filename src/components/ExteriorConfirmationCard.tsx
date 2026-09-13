import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { QuoteSubmission, SIDING_OPTIONS } from '../types/quote';

interface ExteriorConfirmationCardProps {
  submission: QuoteSubmission;
  onReset?: () => void;
}

export const ExteriorConfirmationCard: React.FC<ExteriorConfirmationCardProps> = ({
  submission,
  onReset,
}) => {
  const sidingLabel =
    SIDING_OPTIONS.find((s) => s.id === submission.siding_type)?.label ||
    submission.siding_type ||
    '—';

  return (
    <div
      className="mt-8 pt-8 border-t border-[#E4E7EC] transition-all"
      id="exterior-confirmation-section"
    >
      <div
        id="exterior-confirmation-card"
        className="bg-white border border-[#E4E7EC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-center"
      >
        {/* Status Badge & Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            Custom estimate requested
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-[#16181D]">
            Thanks — we'll follow up with a custom estimate.
          </h3>
          <p className="text-sm text-[#475467] leading-relaxed">
            We've received your exterior project details and will contact you to discuss the project and pricing.
          </p>
        </div>

        {/* Project Summary Box (NO PRICING) */}
        <div className="bg-[#F9FAFB] rounded-xl p-5 border border-[#E4E7EC] max-w-md mx-auto text-left space-y-3">
          <h4 className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
            Project Summary
          </h4>
          <div className="divide-y divide-[#E4E7EC] text-sm">
            <div className="flex justify-between py-2 text-[#344054]">
              <span className="text-[#667085]">Home stories</span>
              <span className="font-semibold text-[#16181D]">
                {submission.home_stories === 1 ? '1 Story' : '2 Stories'}
              </span>
            </div>
            <div className="flex justify-between py-2 text-[#344054]">
              <span className="text-[#667085]">Approximate home size</span>
              <span className="font-semibold text-[#16181D]">
                {submission.home_sqft ? `${submission.home_sqft.toLocaleString()} sq ft` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-2 text-[#344054]">
              <span className="text-[#667085]">Siding type</span>
              <span className="font-semibold text-[#16181D]">
                {sidingLabel}
              </span>
            </div>
            <div className="flex justify-between py-2 text-[#344054]">
              <span className="text-[#667085]">Contact</span>
              <span className="font-medium text-[#16181D]">
                {submission.fullName}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence reassurance & Reference */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-[#667085] bg-[#F9FAFB] px-3 py-1.5 rounded-lg border border-[#E4E7EC]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Submitted securely &bull; Reference ID: {submission.id}</span>
          </div>

          {onReset && (
            <button
              type="button"
              id="exterior-start-new-estimate"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475467] hover:text-[#16181D] transition-colors cursor-pointer pt-2"
            >
              <span>Calculate or request another project</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
