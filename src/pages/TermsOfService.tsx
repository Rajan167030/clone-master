import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Founders Connect, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Role-Based Terms",
    content:
      "Different roles have different responsibilities. Users agree to community participation rules, investors agree to investment-related compliance and verification requirements, and founders agree to startup participation, profile accuracy, and ecosystem conduct standards.",
  },
  {
    title: "3. Account Responsibilities",
    content:
      "You are responsible for maintaining accurate account information, safeguarding your login credentials, and all activity under your account.",
  },
  {
    title: "4. Community Conduct",
    content:
      "Users must engage respectfully and lawfully. Harassment, impersonation, fraudulent activity, and misuse of platform features are prohibited.",
  },
  {
    title: "5. Events and Membership",
    content:
      "Event access, membership benefits, and platform features may change over time. Additional terms may apply for specific paid offerings or partner-led events.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "All platform branding, content, and software are owned by or licensed to Founders Connect. You may not copy, distribute, or exploit materials without permission.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "Founders Connect provides services on an as-available basis. To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from platform use.",
  },
  {
    title: "8. Termination",
    content:
      "We may suspend or terminate accounts that violate these terms, applicable laws, or create risks to other users or platform integrity.",
  },
  {
    title: "9. Contact",
    content:
      "For questions regarding these terms, contact support@foundersconnect.in.",
  },
];

const TermsOfService = () => (
  <main className="min-h-screen bg-background">
    <Navbar />

    <section className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Legal</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Last updated: April 26, 2026. These terms define the rules and responsibilities for
          using Founders Connect and related services, including role-specific conditions for users,
          investors, and founders.
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

export default TermsOfService;
