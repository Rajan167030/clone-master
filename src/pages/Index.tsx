import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import { useSEO, useStructuredData } from "@/hooks/useSEO";
import HeroSlider from "@/components/HeroSlider";
import SponsorsSection from "@/components/SponsorsSection";
import GallerySection from "@/components/GallerySection";
import StatsSection from "@/components/StatsSection";
import PortfolioMarquee from "@/components/PortfolioMarquee";
import ExploreNetwork from "@/components/ExploreNetwork";
import JourneySection from "@/components/JourneySection";
import Testimonials from "@/components/Testimonials";
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
      <StatsSection className="gsap-section" />
      <PortfolioMarquee className="gsap-section" />
      <ExploreNetwork className="gsap-section" />
      <JourneySection className="gsap-section" />
      <SponsorsSection className="gsap-section" />
      <GallerySection className="gsap-section" />
      <Testimonials className="gsap-section" />
      <JoinUsSection showSocial={true} className="gsap-section" />
      <Footer />
    </div>
  );
};

export default Index;
