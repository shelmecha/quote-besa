import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { QuoteCalculationResult, QuoteSubmission } from '../types/quote';

interface QuoteResultCardProps {
  quote: QuoteCalculationResult;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
  submissionSuccess: QuoteSubmission | null;
  submitError: string | null;
  leadSavedNotice?: string | null;
}

export const QuoteResultCard: React.FC<QuoteResultCardProps> = ({
  quote,
  onFinalSubmit,
  isSubmitting,
  submissionSuccess,
  submitError,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Extract first name for personalized greeting
  const firstName = submissionSuccess?.fullName
    ? submissionSuccess.fullName.trim().split(' ')[0]
    : 'there';

  return (
    <div
      className="mt-8 pt-8 border-t border-[#E4E7EC] transition-all"
      id="quote-result-section"
    >
      {/* State 2: Request Received Confirmation */}
      {submissionSuccess ? (
        <div
          id="submission-success-banner"
          className="bg-white border border-[#E4E7EC] rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-[#16181D]">
              Request received
            </h3>
            <p className="text-sm text-[#475467] max-w-md mx-auto leading-relaxed">
              Thanks, {firstName}. We've received your project details and will follow up using the contact information you provided.
            </p>
          </div>

          {/* Simple summary */}
          <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E4E7EC] max-w-sm mx-auto text-left text-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-[#667085]">
              <span>Estimated range</span>
              <span className="font-bold text-sm text-[#16181D]">
                ${submissionSuccess.displayLow} – ${submissionSuccess.displayHigh}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#667085] pt-1 border-t border-[#E4E7EC]">
              <span>Project scope</span>
              <span className="text-[#344054]">
                {submissionSuccess.sqft} sq ft • {submissionSuccess.coats} {submissionSuccess.coats === 1 ? 'coat' : 'coats'}
              </span>
            </div>
          </div>

          {/* Small unobtrusive reference */}
          <p className="text-xs text-[#98A2B3]">
            Estimate reference: {submissionSuccess.id}
          </p>
        </div>
      ) : (
        /* State 1: Active Estimate Display */
        <div className="space-y-6">
          {/* Calm, Premium Result Card */}
          <div
            id="estimated-range-card"
            className="bg-[#16181D] text-white rounded-2xl p-6 sm:p-8 text-center relative shadow-sm"
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 block tracking-normal">
                Your estimate is ready
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-[#98A2B3] block">
                Estimated project range
              </span>

              <div
                id="display-quote-range"
                className="text-4xl sm:text-5xl font-bold tracking-tight text-white py-1 flex items-center justify-center gap-2"
              >
                <span>${quote.quoteLow}</span>
                <span className="text-[#667085] font-light">–</span>
                <span>${quote.quoteHigh}</span>
              </div>

              <p className="text-xs text-[#98A2B3] max-w-md mx-auto leading-relaxed pt-1">
                Based on the project details you provided. Final pricing may change after an on-site inspection.
              </p>
            </div>
          </div>

          {/* Project Summary Under Result */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#475467] bg-[#F9FAFB] border border-[#E4E7EC] rounded-xl px-4 py-3">
            <span className="font-medium text-[#16181D]">{quote.breakdown.sqft} sq ft</span>
            <span className="text-[#D0D5DD]">•</span>
            <span>{quote.breakdown.coats} {quote.breakdown.coats === 1 ? 'coat' : 'coats'}</span>
            <span className="text-[#D0D5DD]">•</span>
            <span>{quote.breakdown.doors} {quote.breakdown.doors === 1 ? 'door' : 'doors'}</span>
            <span className="text-[#D0D5DD]">•</span>
            <span>{quote.breakdown.ceiling === 'high' ? 'High / Vaulted ceiling' : 'Standard ceiling'}</span>
          </div>

          {/* Accordion: Estimate Details */}
          <div className="rounded-xl border border-[#E4E7EC] bg-white overflow-hidden">
            <button
              type="button"
              id="btn-toggle-breakdown"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs sm:text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              <span>Estimate Details</span>
              <span className="text-[#667085] flex items-center gap-1 text-xs">
                {showDetails ? 'Hide' : 'Show'}
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>

            {showDetails && (
              <div
                id="breakdown-details-panel"
                className="px-4 pb-4 pt-1 text-xs text-[#475467] border-t border-[#E4E7EC] space-y-2.5 bg-[#F9FAFB]"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[#667085] block text-[11px]">Estimated paint needed</span>
                    <strong className="text-[#16181D] text-sm mt-0.5 block">
                      {quote.gallons} {quote.gallons === 1 ? 'gallon' : 'gallons'}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[#667085] block text-[11px]">Estimated labor hours</span>
                    <strong className="text-[#16181D] text-sm mt-0.5 block">
                      {quote.breakdown.laborHours} hours
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[#667085] block text-[11px]">Wall area</span>
                    <strong className="text-[#16181D] text-sm mt-0.5 block">
                      {quote.breakdown.sqft} sq ft
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[#667085] block text-[11px]">Number of coats</span>
                    <strong className="text-[#16181D] text-sm mt-0.5 block">
                      {quote.breakdown.coats} {quote.breakdown.coats === 1 ? 'coat' : 'coats'}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[#667085] block text-[11px]">Number of doors</span>
                    <strong className="text-[#16181D] text-sm mt-0.5 block">
                      {quote.breakdown.doors} {quote.breakdown.doors === 1 ? 'door' : 'doors'}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
                    <span className="text-[#667085] block text-[11px]">Ceiling type</span>
                    <strong className="text-[#16181D] text-sm mt-0.5 block">
                      {quote.breakdown.ceiling === 'high' ? 'High / Vaulted (10+ ft)' : 'Standard (8–9 ft)'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submission error message */}
          {submitError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {submitError}
            </div>
          )}

          {/* Secondary CTA: Request an On-Site Quote */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              id="btn-request-final-quote"
              disabled={isSubmitting}
              onClick={onFinalSubmit}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all bg-[#171717] hover:bg-[#262626] active:scale-[0.99] text-white cursor-pointer disabled:bg-[#98A2B3] disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Submitting request...</span>
              ) : (
                <>
                  <span>Request an On-Site Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#667085]">
              We'll contact you to confirm the project details and final pricing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
