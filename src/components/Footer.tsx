import SubscribeForm from "@/components/SubscribeForm";

const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10.3V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="7.4" r="1.1" fill="currentColor" />
        <path d="M11.2 16v-3.1c0-1.4.8-2.4 2.2-2.4 1.2 0 1.9.8 1.9 2.2V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <path
          d="M19.6 7.3c.01.2.01.4.01.6 0 6-4.56 12.93-12.93 12.93-2.57 0-4.96-.75-6.97-2.04.36.04.71.05 1.08.05 2.13 0 4.08-.73 5.63-1.96a4.55 4.55 0 0 1-4.25-3.15c.28.04.56.07.86.07.41 0 .82-.06 1.2-.16A4.54 4.54 0 0 1 1.6 9.12v-.06c.6.33 1.27.53 1.99.56a4.52 4.52 0 0 1-1.98-3.77c0-.83.22-1.61.61-2.28a12.9 12.9 0 0 0 9.37 4.75 4.56 4.56 0 0 1 7.76-4.16 9.12 9.12 0 0 0 2.88-1.1 4.55 4.55 0 0 1-2 2.51 9.04 9.04 0 0 0 2.61-.72 9.76 9.76 0 0 1-2.28 2.36Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Slack",
    href: "https://slack.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <path d="M7.2 2.9a2.1 2.1 0 1 1 4.2 0v5.1H9.3A2.1 2.1 0 0 1 7.2 5.9V2.9Z" fill="currentColor" />
        <path d="M21.1 7.2a2.1 2.1 0 1 1 0 4.2H16V9.3a2.1 2.1 0 0 1 2.1-2.1h3Z" fill="currentColor" />
        <path d="M16.8 21.1a2.1 2.1 0 1 1-4.2 0V16h2.1a2.1 2.1 0 0 1 2.1 2.1v3Z" fill="currentColor" />
        <path d="M2.9 16.8a2.1 2.1 0 1 1 0-4.2H8v2.1a2.1 2.1 0 0 1-2.1 2.1h-3Z" fill="currentColor" />
      </svg>
    ),
  },
];

const Footer = () => (
  <footer className="relative px-4 pb-8 pt-3 sm:px-6 lg:px-8">
    <div className="pointer-events-none absolute inset-0 -top-24 bg-gradient-to-b from-transparent to-secondary/20" />
    <div className="mx-auto w-full max-w-7xl rounded-[2rem] border border-border/70 bg-secondary/35 px-6 py-12 shadow-[0_20px_50px_-25px_hsl(var(--primary)/0.4),0_25px_60px_-20px_hsl(var(--foreground)/0.25)] backdrop-blur-md sm:px-8 lg:px-10">
      <div className="grid grid-cols-2 gap-8 mb-12 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            {/* Founders Connect Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/founders_connect_global_logo.jpg" 
                alt="Founders Connect" 
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            A curated ecosystem where founders, builders, and investors meet with intent. We create high-signal events and membership experiences for startups.
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

          {/* Newsletter subscribe form */}
          <div className="mt-6">
            {/* Lazy import component to keep bundle small if needed */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <SubscribeForm />
          </div>
        </div>

        <div>
          <div className="font-heading font-semibold text-foreground mb-4">Explore</div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><a href="/events" className="hover:text-primary transition-colors">Events</a></li>
            <li><a href="/membership" className="hover:text-primary transition-colors">Membership</a></li>
            <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
          </ul>
        </div>

        <div>
          <div className="font-heading font-semibold text-foreground mb-4">Community</div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Founders</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Investors</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Chapters</a></li>
          </ul>
        </div>

        <div>
          <div className="font-heading font-semibold text-foreground mb-4">About</div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="py-6 border-y border-border/80">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2"></h4>
            <p className="text-sm text-muted-foreground"> </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2"></h4>
            <p className="text-sm text-muted-foreground">  </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2"> </h4>
            <p className="text-sm text-muted-foreground"> </p>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Founders Connect. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;