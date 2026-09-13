import React, { useState, useRef } from 'react';
import { QuoteHeader } from './components/QuoteHeader';
import { ServiceSelector } from './components/ServiceSelector';
import { ProjectDetailsForm } from './components/ProjectDetailsForm';
import { ContactForm } from './components/ContactForm';
import { QuoteResultCard } from './components/QuoteResultCard';
import { ServiceType, CeilingHeight, CoatCount, QuoteCalculationResult, QuoteSubmission } from './types/quote';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function App() {
  // Form State
  const [service, setService] = useState<ServiceType>('interior');
  const [sqft, setSqft] = useState<number | ''>(486);
  const [ceiling, setCeiling] = useState<CeilingHeight>('standard');
  const [doors, setDoors] = useState<number | ''>(2);
  const [coats, setCoats] = useState<CoatCount>(2);
  const [fullName, setFullName] = useState('Jane Doe');
  const [phone, setPhone] = useState('(555) 234-5678');
  const [email, setEmail] = useState('jane@example.com');

  // Calculation & Submission State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [quoteResult, setQuoteResult] = useState<QuoteCalculationResult | null>(null);
  const [leadSavedNotice, setLeadSavedNotice] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<QuoteSubmission | null>(null);

  const resultContainerRef = useRef<HTMLDivElement>(null);

  // Client-side quick validation before hitting server
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (sqft === '' || Number(sqft) <= 0) {
      errs.sqft = 'Enter an approximate wall area.';
    }
    if (doors === '' || Number(doors) < 0) {
      errs.doors = 'Enter the number of doors.';
    }
    if (!fullName.trim()) {
      errs.fullName = 'Enter your full name.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim() || digits.length < 7) {
      errs.phone = 'Enter a valid phone number.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Calculate quote
  const handleCalculateQuote = async () => {
    setCalcError(null);
    setSubmissionSuccess(null);
    setSubmitError(null);
    setLeadSavedNotice(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsCalculating(true);
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSlug: 'test-painter',
          service,
          sqft: Number(sqft),
          ceiling,
          doors: Number(doors),
          coats,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setCalcError(data.error || 'Unable to calculate estimate. Please check your entries.');
        }
        return;
      }

      setQuoteResult(data.data);
      if (data.leadSubmissionId) {
        setLeadSavedNotice(data.leadSubmissionId);
      }
      setFieldErrors({});

      // Smooth scroll down to result card
      setTimeout(() => {
        resultContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to calculate estimate. Please check your connection.';
      setCalcError(msg);
    } finally {
      setIsCalculating(false);
    }
  };

  // Perform final inquiry submission
  const handleFinalSubmit = async () => {
    if (!quoteResult) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSlug: 'test-painter',
          service,
          sqft: Number(sqft),
          ceiling,
          doors: Number(doors),
          coats,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          exactCalculatedQuote: Math.round(quoteResult.finalQuote * 100) / 100,
          displayLow: quoteResult.quoteLow,
          displayHigh: quoteResult.quoteHigh,
          submissionSource: 'request_on_site_quote',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Unable to submit request. Please try again.');
        return;
      }

      setSubmissionSuccess(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to submit request. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#16181D] py-8 sm:py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Main Clean Card Container */}
        <main
          id="instant-quote-widget"
          className="bg-white rounded-2xl border border-[#E4E7EC] p-6 sm:p-9 shadow-xs"
        >
          {/* Header */}
          <QuoteHeader clientName="CRAFT PAINT" />

          {/* Form */}
          <form
            id="quote-calculator-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCalculateQuote();
            }}
            className="space-y-6 pt-6"
          >
            {/* 1. What are you painting? */}
            <ServiceSelector
              selectedService={service}
              onSelectService={(s) => {
                setService(s);
                setQuoteResult(null);
                setLeadSavedNotice(null);
              }}
            />

            {/* 2. Tell us about the project */}
            <ProjectDetailsForm
              sqft={sqft}
              onChangeSqft={(val) => {
                setSqft(val);
                setQuoteResult(null);
                setLeadSavedNotice(null);
              }}
              ceiling={ceiling}
              onChangeCeiling={(val) => {
                setCeiling(val);
                setQuoteResult(null);
                setLeadSavedNotice(null);
              }}
              doors={doors}
              onChangeDoors={(val) => {
                setDoors(val);
                setQuoteResult(null);
                setLeadSavedNotice(null);
              }}
              coats={coats}
              onChangeCoats={(val) => {
                setCoats(val);
                setQuoteResult(null);
                setLeadSavedNotice(null);
              }}
              errors={fieldErrors}
            />

            {/* 3. Where should we send your estimate? */}
            <ContactForm
              fullName={fullName}
              onChangeFullName={(val) => {
                setFullName(val);
                setLeadSavedNotice(null);
              }}
              phone={phone}
              onChangePhone={(val) => {
                setPhone(val);
                setLeadSavedNotice(null);
              }}
              email={email}
              onChangeEmail={(val) => {
                setEmail(val);
                setLeadSavedNotice(null);
              }}
              errors={fieldErrors}
            />

            {/* Calculation Error Alert */}
            {calcError && (
              <div
                id="calculation-error-alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{calcError}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-calculate-quote"
                disabled={isCalculating}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all bg-[#171717] hover:bg-[#262626] active:scale-[0.99] text-white cursor-pointer shadow-xs disabled:bg-[#98A2B3] disabled:cursor-not-allowed group"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculating your estimate...</span>
                  </>
                ) : (
                  <>
                    <span>Get My Estimate</span>
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quote Result Card */}
          {quoteResult && (
            <div ref={resultContainerRef}>
              <QuoteResultCard
                quote={quoteResult}
                onFinalSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
                submissionSuccess={submissionSuccess}
                submitError={submitError}
                leadSavedNotice={leadSavedNotice}
              />
            </div>
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="mt-8 text-center text-xs text-[#667085] pb-8 space-y-1">
          <p>© 2026 CRAFT PAINT</p>
          <p className="text-[11px] text-[#98A2B3]">
            Estimates are preliminary and subject to on-site verification.
          </p>
        </footer>
      </div>
    </div>
  );
}
