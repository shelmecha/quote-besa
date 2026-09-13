import React from 'react';

interface ContactFormProps {
  fullName: string;
  phone: string;
  email: string;
  onChangeFullName: (val: string) => void;
  onChangePhone: (val: string) => void;
  onChangeEmail: (val: string) => void;
  errors: Record<string, string>;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  fullName,
  phone,
  email,
  onChangeFullName,
  onChangePhone,
  onChangeEmail,
  errors,
}) => {
  return (
    <section className="space-y-4 pt-2" id="contact-details-section">
      <div>
        <h2 className="text-sm font-semibold text-[#16181D]">
          3. Where should we send your estimate?
        </h2>
        <p className="text-xs text-[#667085] mt-1">
          We'll only use this to follow up about your estimate.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-fullname"
            className="block text-xs font-medium text-[#16181D]"
          >
            Full Name
          </label>
          <input
            id="input-fullname"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => onChangeFullName(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#16181D] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 transition-all ${
              errors.fullName
                ? 'border-rose-400 focus:ring-rose-500/20'
                : 'border-[#E4E7EC] hover:border-[#D0D5DD] focus:border-[#171717] focus:ring-[#171717]/10'
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-email"
            className="block text-xs font-medium text-[#16181D]"
          >
            Email
          </label>
          <input
            id="input-email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#16181D] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'border-rose-400 focus:ring-rose-500/20'
                : 'border-[#E4E7EC] hover:border-[#D0D5DD] focus:border-[#171717] focus:ring-[#171717]/10'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-phone"
            className="block text-xs font-medium text-[#16181D]"
          >
            Phone Number
          </label>
          <input
            id="input-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 234-5678"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#16181D] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 transition-all ${
              errors.phone
                ? 'border-rose-400 focus:ring-rose-500/20'
                : 'border-[#E4E7EC] hover:border-[#D0D5DD] focus:border-[#171717] focus:ring-[#171717]/10'
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
          )}
        </div>
      </div>
    </section>
  );
};
