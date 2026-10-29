import React from "react";
import SubscribeForm from "@/components/SubscribeForm";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/foundersconnectindia/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/founders-connect-global/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10.3V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="7.4" r="1.1" fill="currentColor" />
        <path d="M11.2 16v-3.1c0-1.4.8-2.4 2.2-2.4 1.2 0 1.9.8 1.9 2.2V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={`relative pt-2 overflow-hidden bg-background ${className || ""}`}>
      <div className="relative px-4 sm:px-6 lg:px-8">

        <div className="mx-auto w-full max-w-[95%] rounded-[2rem] border border-border/70 bg-secondary/35 px-6 pt-8 pb-5 shadow-[0_20px_50px_-25px_hsl(var(--primary)/0.4),0_25px_60px_-20px_hsl(var(--foreground)/0.25)] backdrop-blur-md sm:px-8 lg:px-10 relative overflow-hidden">


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.3fr] gap-6 lg:gap-8 mb-4 relative z-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-6">
                <img
                  src="/founders_connect_global_logo.jpg"
                  alt="Founders Connect"
                  className="h-16 md:h-20 w-auto object-contain rounded-xl"
                />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                A curated ecosystem where founders, builders, and investors meet with intent. We create high-signal events and experiences for startups.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {socials.map(({ name, href, icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <span className="scale-125">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="font-heading font-semibold text-foreground mb-4">Explore</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/events" className="hover:text-primary transition-colors">Events</a></li>
                <li><a href="/falcon-club" className="text-amber-500 font-semibold hover:text-amber-400 transition-colors">FALCON Club</a></li>
                <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              </ul>
            </div>

            <div>
              <div className="font-heading font-semibold text-foreground mb-4">Community</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/falcon-club#members-directory" className="hover:text-primary transition-colors">FALCON Club Directory</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Founders</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Investors</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
                <li><a href="/chapters" className="hover:text-primary transition-colors">Chapters</a></li>
              </ul>
            </div>

            <div>
              <div className="font-heading font-semibold text-foreground mb-4">About</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <div className="font-heading font-semibold text-foreground mb-4">Contact Info</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span className="text-primary text-base flex-shrink-0">📧</span>
                  <a href="mailto:info@foundersconnect.co.in" className="hover:text-primary transition-colors break-words">
                    info@foundersconnect.co.in
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary text-base flex-shrink-0">📞</span>
                  <a href="tel:+916202655116" className="hover:text-primary transition-colors">
                    +91 6202 655 116
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-base flex-shrink-0">📍</span>
                  <address className="not-italic leading-relaxed">
                    Unit No: 8125, 8th Floor, Gaur City Mall Office, Gautam Buddha Nagar, Uttar Pradesh, India – 201318
                  </address>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-2">Subscribe to our newsletter</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Get exclusive invites to founder events and growth insights.</p>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <SubscribeForm />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FC Global Network Private Limited. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                CIN: U82300UW2026PTC259800 · GST: 09AAHCF3021G1ZX
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/privacy-policy" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;