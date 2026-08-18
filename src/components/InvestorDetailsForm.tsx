import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Lock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export interface InvestorFormValues {
  fullName: string;
  email: string;
  phone: string;
  vcName: string;
  investmentInterest: string;
}

export interface InvestorFormProps {
  onSubmit: (values: InvestorFormValues) => Promise<void>;
  isLoading?: boolean;
}

export interface QrSuccessScreenProps {
  qrValue: string;
  userEmail?: string;
  onOpenOnDevice: () => void;
}

export const QrSuccessScreen = ({
  qrValue,
  userEmail,
  onOpenOnDevice,
}: QrSuccessScreenProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Focus the heading when success view mounts for accessibility
    headingRef.current?.focus();
  }, []);

  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center justify-center p-6 md:p-10 text-center"
    >
      {/* Small circular purple-gradient badge */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] border-2 border-[#0B0B09] text-white shadow-[3px_3px_0px_#0B0B09]">
        <Check className="h-7 w-7 stroke-[3]" />
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#0B0B09] outline-none"
      >
        Details Received
      </h2>
      <p className="mt-2 text-sm text-[#6B6558] max-w-sm font-sans">
        Scan the code below to unlock your investor dashboard.
      </p>

      {/* TODO: backend-dependent — generate real access token + encode as QR, not in scope for this task */}
      <div
        className="mt-6 border-2 border-[#0B0B09] bg-white p-4 shadow-[4px_4px_0px_#0B0B09] rounded-none transition-transform motion-reduce:transition-none"
        aria-label="Scan with your phone to access your investor dashboard"
        role="img"
      >
        <div aria-hidden="true" className="p-2 bg-white">
          <QRCodeSVG
            value={qrValue || "https://foundersconnect.co.in/dashboard?auth=investor-login-placeholder"}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#0B0B09"
            level="H"
            includeMargin={false}
          />
        </div>
      </div>

      <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
        Scan to Access Dashboard
      </p>
      <p className="mt-1.5 max-w-xs text-xs text-[#6B6558] font-sans">
        Open your phone camera and point it at the code — works instantly with
        the email {userEmail ? <span className="font-semibold text-[#0B0B09]">{userEmail}</span> : "you just submitted"}.
      </p>

      {/* Secondary Button */}
      <button
        type="button"
        onClick={onOpenOnDevice}
        className="mt-6 w-full max-w-xs bg-[#0B0B09] text-white font-mono text-xs md:text-sm uppercase tracking-wider font-bold border-2 border-[#0B0B09] rounded-none py-3.5 px-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#4C1D95] transition-all duration-200 ease-out focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#4C1D95] motion-reduce:transition-none motion-reduce:hover:transform-none"
      >
        Open Dashboard on This Device &rarr;
      </button>
    </div>
  );
};

export const InvestorForm = ({ onSubmit, isLoading = false }: InvestorFormProps) => {
  const [formData, setFormData] = useState<InvestorFormValues>({
    fullName: "",
    email: "",
    phone: "",
    vcName: "",
    investmentInterest: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
          Investor Details
        </h2>
        <p className="mt-1.5 text-sm text-[#6B6558] font-sans">
          Share a few details and our team will reach out to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="block font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]"
          >
            Name <span className="text-[#4C1D95] font-bold">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Jane Investor"
            className="w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3.5 py-3 font-sans text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[3px_3px_0px_#4C1D95] transition-all motion-reduce:transition-none"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]"
          >
            Email <span className="text-[#4C1D95] font-bold">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="investor@example.com"
            className="w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3.5 py-3 font-sans text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[3px_3px_0px_#4C1D95] transition-all motion-reduce:transition-none"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="block font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]"
          >
            Phone Number{" "}
            <span className="font-normal text-[#6B6558] font-sans lowercase">
              (optional)
            </span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className="w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3.5 py-3 font-sans text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[3px_3px_0px_#4C1D95] transition-all motion-reduce:transition-none"
          />
        </div>

        {/* VC / Firm Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="vcName"
            className="block font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]"
          >
            VC / Firm Name <span className="text-[#4C1D95] font-bold">*</span>
          </label>
          <input
            id="vcName"
            name="vcName"
            type="text"
            required
            value={formData.vcName}
            onChange={handleChange}
            placeholder="e.g., Sequoia Capital"
            className="w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3.5 py-3 font-sans text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[3px_3px_0px_#4C1D95] transition-all motion-reduce:transition-none"
          />
        </div>

        {/* Investment Interest Textarea */}
        <div className="space-y-1.5">
          <label
            htmlFor="investmentInterest"
            className="block font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]"
          >
            What type of startups do you want to invest in?{" "}
            <span className="text-[#4C1D95] font-bold">*</span>
          </label>
          <textarea
            id="investmentInterest"
            name="investmentInterest"
            required
            rows={3}
            value={formData.investmentInterest}
            onChange={handleChange}
            placeholder="e.g., Early-stage Fintech, HealthTech, AI/ML, SaaS startups in India"
            className="w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3.5 py-3 font-sans text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[3px_3px_0px_#4C1D95] transition-all min-h-[90px] resize-y motion-reduce:transition-none"
          />
        </div>

        {/* Dark Purple Gradient Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white font-mono text-sm md:text-base font-bold uppercase tracking-wider border-2 border-[#0B0B09] rounded-none py-3.5 px-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B0B09] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60 transition-all duration-200 ease-out focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#0B0B09] motion-reduce:transition-none motion-reduce:hover:transform-none"
        >
          {isLoading ? "Submitting..." : "Submit Application"}
        </button>

        {/* Confidentiality Note */}
        <p className="flex items-center justify-center gap-1.5 text-center font-mono text-xs text-[#6B6558] pt-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-[#6B6558]" />
          Your information is kept confidential
        </p>
      </form>
    </div>
  );
};

export interface InvestorDetailsFormCardProps {
  onSubmit: (values: InvestorFormValues) => Promise<void>;
  onOpenOnDevice?: () => void;
  formNumber?: string;
}

export const InvestorDetailsFormCard = ({
  onSubmit,
  onOpenOnDevice,
  formNumber = "FC/INV-2026",
}: InvestorDetailsFormCardProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (values: InvestorFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
      setUserEmail(values.email);
      // Generate initial QR link (mock token + email link for automatic scanner recognition)
      const encodedEmail = encodeURIComponent(values.email);
      const generatedLink = `https://foundersconnect.co.in/dashboard?auth=qr&email=${encodedEmail}&ref=${formNumber}`;
      setQrToken(generatedLink);
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl border-2 border-[#0B0B09] bg-[#FBFAF5] rounded-none shadow-[6px_6px_0px_#0B0B09] overflow-hidden">
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b-2 border-[#0B0B09] bg-[#FBFAF5] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#0B0B09]">
        <span className="font-bold">Form No. {formNumber}</span>
        <span className="bg-[#0B0B09] text-white px-2 py-0.5 font-bold">
          For Investors
        </span>
      </div>

      {/* Main Content Area */}
      {submitted ? (
        <QrSuccessScreen
          qrValue={qrToken}
          userEmail={userEmail}
          onOpenOnDevice={() => {
            if (onOpenOnDevice) {
              onOpenOnDevice();
            } else {
              window.location.href = "/dashboard";
            }
          }}
        />
      ) : (
        <InvestorForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}
    </div>
  );
};

export default InvestorDetailsFormCard;
