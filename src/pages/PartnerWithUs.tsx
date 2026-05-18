import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import EmailVerificationBox from "@/components/EmailVerificationBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Megaphone, Network, Users, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { submitPartnerInquiryApi, getPublicPartnerTypesApi } from "@/lib/api";

const emptyFormData = {
  companyName: "",
  companyType: "",
  contactPerson: "",
  email: "",
  phoneCountryCode: "+91",
  phoneNumber: "",
  city: "",
  partnershipType: "",
  partnershipGoal: "",
  audienceSize: "",
  budgetRange: "",
  timeline: "",
  website: "",
  linkedin: "",
  twitter: "",
  message: "",
};

const steps = [
  { id: 1, title: "Organization", description: "Company details" },
  { id: 2, title: "Contact", description: "Your information" },
  { id: 3, title: "Partnership", description: "Partnership plan" },
  { id: 4, title: "Details", description: "Links & message" },
  { id: 5, title: "Review", description: "Confirm & submit" },
];

const PartnerWithUs = () => {
  const [formData, setFormData] = useState(emptyFormData);
  const [partnershipTypes, setPartnershipTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{ website?: string; phone?: string }>({});

  useEffect(() => {
    getPublicPartnerTypesApi()
      .then((res) => {
        if (res?.types) setPartnershipTypes(res.types.map((t) => t.name));
      })
      .catch(() => {
        // fallback to a minimal static list
        setPartnershipTypes(["Media & Press", "Event Sponsor", "Co-hosting Partner", "Technology Partner", "Community Partner", "College Partner", "Other"]);
      });
  }, []);

const companyTypes = [
  "Startup",
  "Enterprise",
  "Investor / Fund",
  "Agency",
  "Community",
  "Media",
  "Education",
  "Other",
];

const budgetRanges = [
  "No fixed budget yet",
  "Under Rs. 50,000",
  "Rs. 50,000 - Rs. 2,00,000",
  "Rs. 2,00,000 - Rs. 5,00,000",
  "Rs. 5,00,000+",
];

const timelines = [
  "Immediately",
  "Within 1 month",
  "1-3 months",
  "3-6 months",
  "Exploring only",
];

const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+971", label: "UAE (+971)" },
];

const benefits = [
  {
    icon: Users,
    title: "Founder Access",
    description: "Reach a focused network of founders, operators, investors, and ecosystem builders.",
  },
  {
    icon: Megaphone,
    title: "Brand Visibility",
    description: "Get meaningful exposure through events, content, community touchpoints, and co-branded initiatives.",
  },
  {
    icon: Network,
    title: "Warm Collaboration",
    description: "Build partnerships around sponsorships, community growth, event programming, or technology support.",
  },
];

  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (e.target.name === "email") {
      setEmailVerificationToken("");
    }

    if (e.target.name === "website") {
      setValidationErrors((prev) => ({ ...prev, website: undefined }));
    }

    if (e.target.name === "phoneCountryCode" || e.target.name === "phoneNumber") {
      setValidationErrors((prev) => ({ ...prev, phone: undefined }));
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.name === "phoneNumber" ? e.target.value.replace(/\D/g, "") : e.target.value,
    }));
  };

  const isValidWebsite = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return true;

    try {
      const url = new URL(
        trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")
          ? trimmedValue
          : `https://${trimmedValue}`,
      );
      return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname.includes("."));
    } catch {
      return false;
    }
  };

  const getPhoneValidationError = () => {
    const phoneDigits = formData.phoneNumber.replace(/\D/g, "");

    if (!formData.phoneCountryCode) {
      return "Please select a country code.";
    }

    if (!phoneDigits) {
      return "Phone number is required.";
    }

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return "Enter a valid phone number with 7 to 15 digits.";
    }

    return "";
  };

  const handleCopyFormUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/partner-with-us`);
      setCopyMessage("Form URL copied");
    } catch {
      setCopyMessage("Unable to copy URL");
    }

    window.setTimeout(() => setCopyMessage(""), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const websiteError = isValidWebsite(formData.website) ? "" : "Please enter a valid website URL.";
    const phoneError = getPhoneValidationError();

    setValidationErrors({
      website: websiteError || undefined,
      phone: phoneError || undefined,
    });

    if (websiteError || phoneError) {
      window.alert(websiteError || phoneError);
      return;
    }

    if (!emailVerificationToken) {
      window.alert("Please verify your email before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await submitPartnerInquiryApi({
        ...formData,
        phone: `${formData.phoneCountryCode} ${formData.phoneNumber}`,
        emailVerificationToken,
      });

      window.alert("Partnership inquiry received. Our team will review it and get back to you soon.");
      setFormData(emptyFormData);
      setEmailVerificationToken("");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Error submitting inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const validateStep = (step: number): { valid: boolean; message: string } => {
    switch (step) {
      case 1:
        if (!formData.companyName.trim()) return { valid: false, message: "Company name is required" };
        if (!formData.companyType) return { valid: false, message: "Company type is required" };
        if (!formData.city.trim()) return { valid: false, message: "City is required" };
        if (formData.website && !isValidWebsite(formData.website)) return { valid: false, message: "Please enter a valid website URL." };
        return { valid: true, message: "" };
      
      case 2:
        if (!formData.contactPerson.trim()) return { valid: false, message: "Contact person is required" };
        if (getPhoneValidationError()) return { valid: false, message: getPhoneValidationError() };
        if (!formData.email.trim()) return { valid: false, message: "Email is required" };
        if (!emailVerificationToken) return { valid: false, message: "Email verification is required" };
        return { valid: true, message: "" };
      
      case 3:
        if (!formData.partnershipType) return { valid: false, message: "Partnership type is required" };
        if (!formData.partnershipGoal.trim()) return { valid: false, message: "Partnership goal is required" };
        return { valid: true, message: "" };
      
      default:
        return { valid: true, message: "" };
    }
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (!validation.valid) {
      window.alert(validation.message);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />


      <section className="relative min-h-[520px] overflow-hidden pt-24">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&fit=crop" alt="Founders Connect partnership" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/65" />
        
        <BackButton className="absolute left-0 right-0 top-24 z-20 animate-reveal-left" />

        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/75">Partnerships</p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl">
              Partner with Founders Connect
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Tell us what you want to build with the founder ecosystem. We will review the details and shape a collaboration that fits your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button" onClick={() => document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" })}>
                Start Partnership Form
              </Button>
              <Button type="button" variant="secondary" onClick={handleCopyFormUrl} className="gap-2">
                <Copy className="h-4 w-4" />
                Share Form URL
              </Button>
              {copyMessage && <span className="self-center text-sm text-white/80">{copyMessage}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-10">
        <div className="container mx-auto grid gap-4 px-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border border-border bg-background p-5">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="partner-form" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl w-full">
            <Card className="border shadow-xl">
              <CardContent className="p-5 sm:p-7">
                {/* Step Indicator */}
                <div className="mb-8">
                  <div className="flex items-start justify-between gap-2">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-colors ${
                              currentStep >= step.id
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {currentStep > step.id ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              step.id
                            )}
                          </div>
                          <span className="mt-2 text-xs font-medium text-center leading-tight">
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`mt-[-18px] h-0.5 flex-1 ${
                              currentStep > step.id ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Organization Details */}
                  {currentStep === 1 && (
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">Organization Details</h3>
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-foreground">
                          Company Name *
                          <input required name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Ventures" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Company Type *
                          <select required name="companyType" value={formData.companyType} onChange={handleChange} className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground">
                            <option value="">Select company type</option>
                            {companyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          City *
                          <input required name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Website
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://company.com"
                            inputMode="url"
                            autoComplete="url"
                            className={`mt-2 w-full rounded border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground ${validationErrors.website ? "border-red-500" : "border-border"}`}
                          />
                          {validationErrors.website && (
                            <p className="mt-1 text-xs font-medium text-red-600">{validationErrors.website}</p>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Details */}
                  {currentStep === 2 && (
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">Contact Details</h3>
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-foreground">
                          Contact Person *
                          <input required name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Your full name" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Phone *
                          <div className="mt-2 flex gap-2">
                            <select
                              name="phoneCountryCode"
                              value={formData.phoneCountryCode}
                              onChange={handleChange}
                              className="w-32 rounded border border-border bg-background px-3 py-2.5 text-foreground"
                            >
                              {countryCodes.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.code}
                                </option>
                              ))}
                            </select>
                            <input
                              required
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="9876543210"
                              inputMode="numeric"
                              autoComplete="tel-national"
                              className={`w-full rounded border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground ${validationErrors.phone ? "border-red-500" : "border-border"}`}
                            />
                          </div>
                          {validationErrors.phone && (
                            <p className="mt-1 text-xs font-medium text-red-600">{validationErrors.phone}</p>
                          )}
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Email *
                          <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                          <div className="mt-2">
                            <EmailVerificationBox
                              email={formData.email}
                              purpose="partner-inquiry"
                              token={emailVerificationToken}
                              onVerified={setEmailVerificationToken}
                              onReset={() => setEmailVerificationToken("")}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Partnership Plan */}
                  {currentStep === 3 && (
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">Partnership Plan</h3>
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-foreground">
                          Partnership Type *
                          <select required name="partnershipType" value={formData.partnershipType} onChange={handleChange} className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground">
                            <option value="">Select partnership type</option>
                            {partnershipTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Timeline
                          <select name="timeline" value={formData.timeline} onChange={handleChange} className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground">
                            <option value="">Select timeline</option>
                            {timelines.map((timeline) => <option key={timeline} value={timeline}>{timeline}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Audience / Community Size
                          <input name="audienceSize" value={formData.audienceSize} onChange={handleChange} placeholder="e.g. 10k founders, 50 portfolio companies" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Budget Range
                          <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground">
                            <option value="">Select budget range</option>
                            {budgetRanges.map((range) => <option key={range} value={range}>{range}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Partnership Goal *
                          <input required name="partnershipGoal" value={formData.partnershipGoal} onChange={handleChange} placeholder="What outcome do you want from this partnership?" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Links and Context */}
                  {currentStep === 4 && (
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">Links & Additional Info</h3>
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-foreground">
                          LinkedIn
                          <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Twitter / X
                          <input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="@handle or profile URL" className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                          Additional Message
                          <textarea name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Share event ideas, sponsorship needs, collaboration scope, or anything the team should know." className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground" />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Confirm */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-foreground mb-4">Review Your Information</h3>
                      <div className="grid gap-4 text-sm bg-background p-4 rounded-lg border border-border">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Company Name</p>
                            <p className="font-medium text-foreground">{formData.companyName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Company Type</p>
                            <p className="font-medium text-foreground">{formData.companyType}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Contact Person</p>
                            <p className="font-medium text-foreground">{formData.contactPerson}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                            <p className="font-medium text-foreground">{formData.email}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Phone</p>
                            <p className="font-medium text-foreground">{formData.phoneCountryCode} {formData.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Website</p>
                            <p className="font-medium text-foreground">{formData.website || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">City</p>
                            <p className="font-medium text-foreground">{formData.city}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Partnership Type</p>
                            <p className="font-medium text-foreground">{formData.partnershipType}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Timeline</p>
                            <p className="font-medium text-foreground">{formData.timeline || "Not specified"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Partnership Goal</p>
                            <p className="font-medium text-foreground">{formData.partnershipGoal}</p>
                          </div>
                          {formData.message && (
                            <div className="col-span-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase">Message</p>
                              <p className="font-medium text-foreground">{formData.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">Email verification completed ✓</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                    )}
                    {currentStep < 5 && (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="gap-2 ml-auto"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    {currentStep === 5 && (
                      <Button type="submit" disabled={submitting || !emailVerificationToken} className="w-full">
                        {submitting ? "Submitting..." : "Submit Partnership Inquiry"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerWithUs;
