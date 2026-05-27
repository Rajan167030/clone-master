import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import JoinUsSection from "@/components/JoinUsSection";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { CalendarDays, Target, UsersRound } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    title: "Our Mission",
    description:
      "Enable founders to access the right people, practical insights, and growth opportunities at every stage.",
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: "What We Run",
    description:
      "Founder meetups, investor networking nights, and members-only sessions focused on execution and outcomes.",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    title: "Who It's For",
    description:
      "Startup founders, co-founders, and serious builders looking for real conversations and quality connections.",
    icon: <UsersRound className="h-5 w-5" />,
  },
];

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // SEO Hook
  useSEO({
    title: "About Founders Connect",
    description: "Learn about Founders Connect - India's most valuable founder network connecting builders, founders, and investors with intent. Discover our mission and events.",
    keywords: "about founders connect, founder network, startup ecosystem, investor network India",
    ogType: "website",
    canonicalUrl: "https://founders.connect/about",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".reveal-word-about", {
        y: "0%",
        opacity: 1,
        rotate: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      });

      gsap.fromTo(".reveal-card",
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".reveal-cards-container",
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const headingText = "Building India's most valuable founder network.";
  const headingWords = headingText.split(" ");

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <Navbar />
      <section className="relative pt-24 pb-16">
        <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-blob" />

        <BackButton className="mb-6 animate-reveal-left" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">About Founders Connect</p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl flex flex-wrap justify-center gap-x-3 overflow-hidden py-2">
              {headingWords.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-2">
                  <span className="reveal-word-about inline-block translate-y-[110%] opacity-0 rotate-[4deg] transition-transform duration-75">
                    {word}
                  </span>
                </span>
              ))}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Founders Connect is a curated ecosystem where founders, builders, and investors meet with intent, not noise.
              We design high-signal events and membership experiences that help startups grow faster.
            </p>
          </div>

          <div className="reveal-cards-container relative z-10 mt-12 grid grid-cols-1 md:grid-cols-3">
            {cards.map((card, index) => (
              <FeatureCard key={card.title} {...card} index={index} />
            ))}
          </div>

          <JoinUsSection showSocial={true} />
        </div>
      </section>

      {/* Join Us & Get Funding Strip */}
      <section className="relative w-full overflow-hidden bg-primary py-4 md:py-6 flex items-center shadow-inner">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:30px_30px] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="animate-marquee flex whitespace-nowrap items-center" style={{ width: '200%' }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className="mx-6 md:mx-10 text-sm md:text-lg font-bold tracking-widest uppercase text-white flex items-center gap-6 md:gap-10">
              <Link to="/join-us" className="hover:text-white/70 transition-colors">Join Us</Link>
              <span className="w-2 h-2 rounded-full bg-white/40 block"></span>
              <Link to="/get-funding" className="hover:text-white/70 transition-colors">Get Funding</Link>
              <span className="w-2 h-2 rounded-full bg-white/40 block"></span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "reveal-card opacity-0 group/feature relative flex flex-col py-10 lg:border-r dark:border-neutral-800",
        index === 0 && "lg:border-l dark:border-neutral-800"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
      <div className="relative z-10 mb-4 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="relative z-10 mb-2 px-10 text-lg font-bold">
        <div className="absolute left-0 inset-y-0 h-6 w-1 rounded-br-full rounded-tr-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-blue-500 dark:bg-neutral-700" />
        <span className="inline-block text-neutral-800 transition duration-200 group-hover/feature:translate-x-2 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="relative z-10 max-w-xs px-10 text-sm text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
    </div>
  );
};

export default About;
