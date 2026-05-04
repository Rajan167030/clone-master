import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly, including account details, profile information, and event participation data. We may also collect technical information such as device data, browser type, and usage analytics to improve platform performance.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "Your information is used to create and manage your account, personalize your experience, facilitate community interactions, process event registrations, and provide customer support. We also use aggregated data to improve product quality and safety.",
  },
  {
    title: "3. Information Sharing",
    content:
      "We do not sell your personal information. We may share limited data with trusted service providers for hosting, analytics, payment, and communication services, or when required by law.",
  },
  {
    title: "4. Data Security",
    content:
      "We use reasonable administrative, technical, and organizational safeguards to protect your information. While we strive for strong security, no online platform can guarantee absolute protection.",
  },
  {
    title: "5. Your Choices",
    content:
      "You may update profile details, manage communication preferences, and request account changes by contacting support. You may also request deletion of your account, subject to legal and operational obligations.",
  },
  {
    title: "6. Contact",
    content:
      "If you have any questions about this Privacy Policy, contact us at support@foundersconnect.in.",
  },
];

const PrivacyPolicy = () => (
  <main className="min-h-screen bg-background">
    <Navbar />

    <section className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Legal</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Last updated: April 26, 2026. This policy explains how Founders Connect collects, uses,
          and protects your information when you use our platform.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{section.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </main>
);

export default PrivacyPolicy;
