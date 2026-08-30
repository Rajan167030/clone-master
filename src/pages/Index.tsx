import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import { useSEO, useStructuredData } from "@/hooks/useSEO";
import HeroSlider from "@/components/HeroSlider";
import GallerySection from "@/components/GallerySection";
import StatsSection from "@/components/StatsSection";
import PortfolioMarquee from "@/components/PortfolioMarquee";
import ExploreNetwork from "@/components/ExploreNetwork";
import InvestorsSection from "@/components/InvestorsSection";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import ActivityResultsSection from "@/components/ActivityResultsSection";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import JoinUsSection from "@/components/JoinUsSection";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPublicSiteNoticeApi, type SiteNotice } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const [siteNotice, setSiteNotice] = useState<SiteNotice | null>(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // SEO Hook
  useSEO({
    title: "Founders Connect | India's Founder & Investor Network",
    description: "Connect with startup founders, investors, and builders at curated events, founder meetups, and exclusive membership experiences. Build meaningful relationships in India's founder ecosystem.",
    keywords: "founder network, investor meetup, startup events, founder community, startup networking, India startups, entrepreneur events",
    ogImage: "https://foundersconnect.co.in/og-image.jpg",
    ogType: "website",
    canonicalUrl: "https://foundersconnect.co.in/",
  });

  // Structured Data (Organization + WebSite schema)
  useStructuredData({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Founders Connect",
    url: "https://foundersconnect.co.in",
    logo: "https://foundersconnect.co.in/logo.png",
    description: "India's premier founder and investor networking platform",
    founder: {
      "@type": "Person",
      name: "Founders Connect Team",
    },
    sameAs: [
      "https://twitter.com/FoundersConnect",
      "https://linkedin.com/company/founders-connect",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "General",
      email: "hello@foundersconnect.co.in",
    },
  });

  useEffect(() => {
    let isMounted = true;

    getPublicSiteNoticeApi()
      .then((response) => {
        if (!isMounted) return;

        setSiteNotice(response.notice);
        setIsNoticeOpen(Boolean(response.notice?.isActive && response.notice?.message));
      })
      .catch(() => {
        if (!isMounted) return;
        setSiteNotice(null);
        setIsNoticeOpen(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".gsap-section");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            // Removes the inline transform once the reveal finishes — GSAP otherwise
            // leaves an identity transform behind, which silently breaks any
            // `position: sticky` section (a transform on an element creates a new
            // containing block, so sticky positioning starts tracking that element
            // instead of the viewport).
            clearProps: "transform",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background" ref={mainContainerRef}>
      <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
        {/* ... existing code ... */}
      </Dialog>

      <Navbar />
      <HeroSlider className="gsap-section" />
      <StatsSection className="gsap-section !py-12 md:!py-16" />
      <PortfolioMarquee className="gsap-section !py-12 md:!py-16" />
      <ExploreNetwork className="gsap-section !py-12 md:!py-16" />
      <InvestorsSection className="gsap-section !py-12 md:!py-16" />
      <UpcomingEventsSection className="gsap-section !py-12 md:!py-16" />
      <ActivityResultsSection className="gsap-section !py-12 md:!py-16" />
      <BlogSection className="gsap-section !py-12 md:!py-16" />
      <GallerySection className="gsap-section !py-12 md:!py-16" />
      {/*
        Sticky-stack scroll effect (a.k.a. "scroll overlap" / "scroll reveal overlay"):
        each section pins to the top of the viewport via `sticky top-0`, and the next
        section — sitting on top thanks to a higher z-index — scrolls up and slides
        over it like a card being dealt onto the one before it. Every section here
        needs its own opaque background, or the "cover" won't actually be visible.
      */}
      <Testimonials className="gsap-section !py-12 md:!py-16 sticky top-0 z-10 bg-background" />
      <JoinUsSection showSocial={true} className="gsap-section !py-12 md:!py-16 sticky top-0 z-20 bg-background" />
      <Footer className="relative z-30" />
    </div>
  );
};

export default Index;
