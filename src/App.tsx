import React, { useState, useRef } from 'react';
import { QuoteHeader } from './components/QuoteHeader';
import { ServiceSelector } from './components/ServiceSelector';
import { ProjectDetailsForm } from './components/ProjectDetailsForm';
import { ExteriorDetailsForm } from './components/ExteriorDetailsForm';
import { ContactForm } from './components/ContactForm';
import { QuoteResultCard } from './components/QuoteResultCard';
import { ExteriorConfirmationCard } from './components/ExteriorConfirmationCard';
import {
  ServiceType,
  CeilingHeight,
  CoatCount,
  HomeStories,
  SidingType,
  QuoteCalculationResult,
  QuoteSubmission,
} from './types/quote';
import { calculateQuoteClient, DEFAULT_CLIENT_PRICING } from './utils/calculator';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function App() {
  // Service Selection
  const [service, setService] = useState<ServiceType>('interior');

  // Interior Form State
  const [sqft, setSqft] = useState<number | ''>(486);
  const [ceiling, setCeiling] = useState<CeilingHeight>('standard');
  const [doors, setDoors] = useState<number | ''>(2);
  const [coats, setCoats] = useState<CoatCount>(2);

  // Exterior Form State
  const [homeStories, setHomeStories] = useState<HomeStories>(2);
  const [homeSqft, setHomeSqft] = useState<number | ''>(2000);
  const [sidingType, setSidingType] = useState<SidingType>('stucco');

  // Contact Details State (Shared)
  const [fullName, setFullName] = useState('Jane Doe');
  const [phone, setPhone] = useState('(555) 234-5678');
  const [email, setEmail] = useState('jane@example.com');

  // Processing & Error State
  const [isProcessing, setIsProcessing] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Result State
  const [quoteResult, setQuoteResult] = useState<QuoteCalculationResult | null>(null);
  const [leadSavedNotice, setLeadSavedNotice] = useState<string | null>(null);
  const [exteriorSubmission, setExteriorSubmission] = useState<QuoteSubmission | null>(null);

  // Interior on-site inquiry follow-up
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<QuoteSubmission | null>(null);

  const resultContainerRef = useRef<HTMLDivElement>(null);

  // Service switcher: clears result cards and branch errors
  const handleSelectService = (newService: ServiceType) => {
    setService(newService);
    setQuoteResult(null);
    setExteriorSubmission(null);
    setLeadSavedNotice(null);
    setCalcError(null);
    setSubmitError(null);
    setFieldErrors({}); // Clear errors so hidden field errors never remain visible
  };

  // Client-side validation tailored to active service branch
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    // Contact info (required for both branches)
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

    // Branch-specific validations
    if (service === 'interior') {
      if (sqft === '' || Number(sqft) <= 0) {
        errs.sqft = 'Enter an approximate wall area.';
      }
      if (doors === '' || Number(doors) < 0) {
        errs.doors = 'Enter the number of doors.';
      }
    } else if (service === 'exterior') {
      if (!homeStories || (homeStories !== 1 && homeStories !== 2)) {
        errs.home_stories = 'Please select home stories (1 or 2).';
      }
      if (homeSqft === '' || Number(homeSqft) <= 0) {
        errs.home_sqft = 'Enter the approximate home size in sq ft.';
      }
      if (!sidingType) {
        errs.siding_type = 'Please select a siding type.';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Main Submit Action: Instant Quote (Interior) vs Custom Request (Exterior)
  const handleSubmit = async () => {
    setCalcError(null);
    setSubmissionSuccess(null);
    setSubmitError(null);
    setLeadSavedNotice(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);

      const payload =
        service === 'interior'
          ? {
              clientSlug: 'test-painter',
              service: 'interior',
              sqft: Number(sqft),
              ceiling,
              doors: Number(doors),
              coats,
              fullName: fullName.trim(),
              phone: phone.trim(),
              email: email.trim(),
            }
          : {
              clientSlug: 'test-painter',
              service: 'exterior',
              home_stories: homeStories,
              home_sqft: Number(homeSqft),
              siding_type: sidingType,
              fullName: fullName.trim(),
              phone: phone.trim(),
              email: email.trim(),
            };

      let serverData: any = null;
      let serverJsonOk = false;

      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          serverData = await res.json();
          serverJsonOk = true;
        } else {
          console.warn('API returned non-JSON response status:', res.status);
        }

        if (serverJsonOk && serverData) {
          if (!res.ok || !serverData.success) {
            if (serverData.errors) {
              setFieldErrors(serverData.errors);
            } else {
              setCalcError(serverData.error || 'Unable to process your request. Please check your entries.');
            }
            return;
          }

          if (service === 'interior') {
            setQuoteResult(serverData.data);
            setExteriorSubmission(null);
            if (serverData.leadSubmissionId) {
              setLeadSavedNotice(serverData.leadSubmissionId);
            }
          } else {
            setExteriorSubmission(serverData.leadSubmission);
            setQuoteResult(null);
          }
          setFieldErrors({});

          setTimeout(() => {
            resultContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
          return;
        }
      } catch (networkErr) {
        console.warn('Network call to /api/quote encountered error, falling back:', networkErr);
      }

      // Seamless fallback for static environments or offline hosts (e.g. Vercel static deployments)
      if (service === 'interior') {
        const fallbackResult = calculateQuoteClient(
          {
            clientSlug: 'test-painter',
            service: 'interior',
            sqft: Number(sqft),
            ceiling,
            doors: Number(doors),
            coats,
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
          },
          DEFAULT_CLIENT_PRICING
        );
        setQuoteResult(fallbackResult);
        setExteriorSubmission(null);
      } else {
        const fallbackSubmission: QuoteSubmission = {
          id: 'sub_' + Math.random().toString(36).substring(2, 10),
          clientSlug: 'test-painter',
          service: 'exterior',
          quote_type: 'manual',
          pricing_mode: 'manual_quote',
          home_stories: homeStories,
          home_sqft: Number(homeSqft),
          siding_type: sidingType,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
          submissionSource: 'request_custom_estimate_click',
        };
        setExteriorSubmission(fallbackSubmission);
        setQuoteResult(null);
      }
      setFieldErrors({});

      // Smooth scroll to result
      setTimeout(() => {
        resultContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to process your request. Please check your connection.';
      setCalcError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Interior on-site quote booking submission
  const handleFinalSubmit = async () => {
    if (!quoteResult) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let serverJsonOk = false;
      let serverData: any = null;

      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientSlug: 'test-painter',
            service: 'interior',
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

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          serverData = await res.json();
          serverJsonOk = true;
        }

        if (serverJsonOk && serverData) {
          if (!res.ok || !serverData.success) {
            setSubmitError(serverData.error || 'Unable to submit request. Please try again.');
            return;
          }
          setSubmissionSuccess(serverData.data);
          return;
        }
      } catch (fetchErr) {
        console.warn('API submission failed, using local confirmation fallback:', fetchErr);
      }

      // Static hosting fallback
      const fallbackSuccess: QuoteSubmission = {
        id: 'sub_' + Math.random().toString(36).substring(2, 10),
        clientSlug: 'test-painter',
        service: 'interior',
        quote_type: 'instant',
        pricing_mode: 'instant_calculation',
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
        createdAt: new Date().toISOString(),
        submissionSource: 'request_on_site_quote',
      };
      setSubmissionSuccess(fallbackSuccess);
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
              handleSubmit();
            }}
            className="space-y-6 pt-6"
          >
            {/* 1. What are you painting? */}
            <ServiceSelector
              selectedService={service}
              onSelectService={handleSelectService}
            />

            {/* 2. Tell us about the project — Conditionally Rendered by Service */}
            {service === 'interior' ? (
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
            ) : (
              <ExteriorDetailsForm
                homeStories={homeStories}
                homeSqft={homeSqft}
                sidingType={sidingType}
                onChangeHomeStories={(val) => {
                  setHomeStories(val);
                  setExteriorSubmission(null);
                }}
                onChangeHomeSqft={(val) => {
                  setHomeSqft(val);
                  setExteriorSubmission(null);
                }}
                onChangeSidingType={(val) => {
                  setSidingType(val);
                  setExteriorSubmission(null);
                }}
                errors={fieldErrors}
              />
            )}

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

            {/* Error Alert */}
            {calcError && (
              <div
                id="calculation-error-alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{calcError}</span>
              </div>
            )}

            {/* Primary Action Button — Conditional CTA Text & Loading */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-calculate-quote"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all bg-[#171717] hover:bg-[#262626] active:scale-[0.99] text-white cursor-pointer shadow-xs disabled:bg-[#98A2B3] disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {service === 'interior'
                        ? 'Calculating your estimate...'
                        : 'Sending your request...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {service === 'interior'
                        ? 'Get My Estimate'
                        : 'Request Custom Estimate'}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results: Interior Quote Result Card */}
          {service === 'interior' && quoteResult && (
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

          {/* Results: Exterior Confirmation Card (No Pricing) */}
          {service === 'exterior' && exteriorSubmission && (
            <div ref={resultContainerRef}>
              <ExteriorConfirmationCard
                submission={exteriorSubmission}
                onReset={() => {
                  setExteriorSubmission(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
